defmodule HealthMonitorService.Common.Constants do
	defmacro __using__(_opts) do
		quote do
			@heartbeat_map :heartbeat_service_messages

			@heartbeat_recalculation_interval :timer.seconds(10)
			@healthy_treshold 30
			@stale_treshold 60

			@initial_retry_delay 1000
			@max_retry_delay 64000
		end
	end
end
