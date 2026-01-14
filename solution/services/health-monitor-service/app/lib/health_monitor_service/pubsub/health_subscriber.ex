defmodule HealthMonitorService.PubSub.HealthSubscriber do
	use Broadway
	require Logger

	@initial_retry_delay 1000
	@max_retry_delay 64000
	@health_exchange_backoff_key {:health_monitor_service, :health_exchange_backoff}

	def start_link(_opts) do
		:persistent_term.put(@health_exchange_backoff_key, 0)
		Broadway.start_link(__MODULE__,
			name: __MODULE__,
			producer: [
				module: {
					BroadwayRabbitMQ.Producer,
					connection: [
						host: Application.get_env(:health_monitor_service, :rabbitmq, []) |> Keyword.get(:host)
					],
					queue: Application.get_env(:health_monitor_service, :rabbitmq, []) |> Keyword.get(:health_exchange_queue),
					after_connect: &after_connect/1
				},
				concurrency: 1
			],
			processors: [
				default: [concurrency: 4]
			]
		)
	end

	@impl true
	def handle_message(_, message, _) do
		Logger.info("Health event: #{message.data}")
		case Jason.decode(message.data) do
			{:ok, decoded_map} ->
				%{"serviceId" => service_id, "body" => body} = decoded_map
				:ets.insert(:health_service_messages, {service_id, body})
			{:error, _reason} ->
				IO.puts("Failed to parse JSON")
		end
		message
	end

	def after_connect(channel) do
		ensure_exchange(channel)
		ensure_queue(channel)
	end

	defp ensure_exchange(channel) do
		exchange = Application.get_env(:health_monitor_service, :rabbitmq, []) |> Keyword.get(:health_exchange)
		case AMQP.Exchange.declare(channel, exchange, :fanout, durable: false) do
			:ok ->
				reset_backoff()
				Logger.info("Exchange #{exchange} is ready.")
				:ok

			{:error, reason} ->
				attempt = increment_backoff()
				delay = calculate_delay(attempt)
				Logger.warning("Cannot declare exchange #{exchange} (attempt #{attempt}): #{inspect(reason)}. Retrying in #{delay}ms.")
				Process.sleep(delay)
				ensure_exchange(channel)
			end
		rescue
			error -> {:error, error}
	end

	defp ensure_queue(channel) do
		exchange = Application.get_env(:health_monitor_service, :rabbitmq, []) |> Keyword.get(:health_exchange)
		queue = Application.get_env(:health_monitor_service, :rabbitmq, []) |> Keyword.get(:health_exchange_queue)
		case AMQP.Queue.declare(channel, queue, durable: false, auto_delete: true) do
			{:ok, _} ->
				AMQP.Queue.bind(channel, queue, exchange)
				Logger.info("Queue #{queue} declared and bound to #{exchange}")
				:ok

			{:error, reason} ->
				attempt = increment_backoff()
				delay = calculate_delay(attempt)
				Logger.warning("Cannot declare queue #{queue} (attempt #{attempt}): #{inspect(reason)}. Retrying in #{delay}ms.")
				Process.sleep(delay)
				ensure_queue(channel)
		end
	end

	defp increment_backoff do
		:persistent_term.get(@health_exchange_backoff_key, 0)
		|> then(fn attempt ->
			:persistent_term.put(@health_exchange_backoff_key, attempt + 1)
			attempt
		end)
	end

	defp reset_backoff do
		:persistent_term.put(@health_exchange_backoff_key, 0)
	end

	defp calculate_delay(attempt) do
		delay = trunc(@initial_retry_delay * :math.pow(2, attempt))
		min(delay, @max_retry_delay)
	end
end
