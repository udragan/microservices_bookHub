defmodule HealthMonitorService.Storage.Storage do
	use GenServer

	@healthy_after 30
	@stale_after 60
	@health_map :health_service_messages

	def start_link(_) do
		GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
	end

	def init(:ok) do
		:ets.new(@health_map, [:named_table, :public, :set, {:read_concurrency, true}, {:write_concurrency, true}])
		{:ok, %{}}
	end

	def get_services_health_map do
		services_health_map = :ets.tab2list(@health_map)
			|> Enum.map(&process_service/1)
			|> Map.new()
		services_health_map
	end

	defp process_service({service_id, state}) do
		timestamp = state.timestamp
		calculated_status = set_service_state_from_timestamp(timestamp)
		new_state = %{state | status: calculated_status}
		{service_id, new_state}
	end

	defp set_service_state_from_timestamp(timestamp) do
		now = DateTime.utc_now()
		diff = DateTime.diff(now, timestamp, :second)

		cond do
			diff <= @healthy_after -> :healthy
			diff <= @stale_after -> :stale
			true -> :offline
		end
	end
end
