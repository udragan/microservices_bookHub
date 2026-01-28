defmodule HealthMonitorService.Storage.Storage do
	use GenServer
	use HealthMonitorService.Common.Constants

	def start_link(_) do
		GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
	end

	def init(:ok) do
		:ets.new(@heartbeat_map, [:named_table, :public, :set, {:read_concurrency, true}, {:write_concurrency, true}])
		{:ok, %{}}
	end
end
