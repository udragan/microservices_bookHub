defmodule HealthMonitorService.Workers.StatusUpdater do
	use GenServer
	use HealthMonitorService.Common.Constants
	require Logger

	def start_link(_opts) do
		GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
	end

	@impl true
	def init(state) do
		schedule_recalculation()
		{:ok, state}
	end

	@impl true
	def handle_info(:recalculate_health, state) do
		recalculate_all_statuses()
		schedule_recalculation()
		{:noreply, state}
	end

	defp schedule_recalculation do
		Process.send_after(self(), :recalculate_health, @health_status_recalculation_interval)
	end

	defp recalculate_all_statuses do
		now = DateTime.utc_now()

		@health_map
		|> :ets.tab2list()
		|> Enum.each(fn {service_id, service_state} ->
			diff = DateTime.diff(now, service_state.timestamp, :second)

			new_status = cond do
				diff <= @healthy_treshold -> :healthy
				diff <= @stale_treshold -> :stale
				true -> :offline
			end

			if new_status != service_state.status do
				case new_status do
					:healthy ->
						Logger.info("Service #{service_id} checked in. Marking as healthy.")
						updated_service_state = %{service_state | status: new_status}
						:ets.insert(@health_map, {service_id, updated_service_state})
					:stale ->
						Logger.warning("Service #{service_id} did not check in. Marking as stale.")
						updated_service_state = %{service_state | status: new_status}
						:ets.insert(@health_map, {service_id, updated_service_state})
					:offline ->
						Logger.warning("Service #{service_id} did not check in. Marking as offline.")
						updated_service_state = %{service_state | status: new_status}
						:ets.insert(@health_map, {service_id, updated_service_state})
						_ -> :ok
				end
			end
		end)
	end
end
