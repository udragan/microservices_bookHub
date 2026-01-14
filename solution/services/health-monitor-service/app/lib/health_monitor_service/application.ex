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
			HealthMonitorService.Web,
			HealthMonitorService.HealthSubscriber
		]

		# See https://hexdocs.pm/elixir/Supervisor.html
		# for other strategies and supported options
		opts = [strategy: :one_for_one, name: HealthMonitorService.Supervisor]
		Supervisor.start_link(children, opts)
	end

	defp log_env do
		rabbitmq_conf= Application.get_env(:health_monitor_service, :rabbitmq)
		Logger.info("RABBITMQ = #{rabbitmq_conf}")
	end
end
