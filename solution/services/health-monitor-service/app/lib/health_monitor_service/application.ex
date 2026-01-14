defmodule HealthMonitorService.Application do
	# See https://hexdocs.pm/elixir/Application.html
	# for more information on OTP Applications
	@moduledoc false

	use Application

	require Logger

	@impl true
	def start(_type, _args) do
		log_env()

		children = [
			# Starts a worker by calling: HealthMonitorService.Worker.start_link(arg)
			# {HealthMonitorService.Worker, arg}
			HealthMonitorService.Api.Web,
			HealthMonitorService.PubSub.HealthSubscriber,
			HealthMonitorService.Storage.Storage,
		]

		# See https://hexdocs.pm/elixir/Supervisor.html
		# for other strategies and supported options
		opts = [strategy: :one_for_one, name: HealthMonitorService.Supervisor]
		Supervisor.start_link(children, opts)
	end

	defp log_env do
		rabbitmq_conf= Application.get_env(:health_monitor_service, :rabbitmq)
		Logger.info("RABBITMQ_host = #{rabbitmq_conf[:host]}")
		Logger.info("RABBITMQ_helth_exchange = #{rabbitmq_conf[:health_exchange]}")
		Logger.info("RABBITMQ_helth_exchange_queue = #{rabbitmq_conf[:health_exchange_queue]}")
	end
end
