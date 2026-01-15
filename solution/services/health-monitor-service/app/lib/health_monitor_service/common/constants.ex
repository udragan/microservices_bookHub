defmodule HealthMonitorService.Common.Constants do
	defmacro __using__(_opts) do
		quote do
			@health_map :health_service_messages
			@healthy_treshold 30
			@stale_treshold 120

			@initial_retry_delay 1000
			@max_retry_delay 64000
		end
	end
end
