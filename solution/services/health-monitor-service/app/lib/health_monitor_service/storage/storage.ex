defmodule HealthMonitorService.Storage.Storage do
	use GenServer

	@table :health_service_messages

	def start_link(_) do
		GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
	end

	def init(:ok) do
		:ets.new(@table, [:named_table, :public, :set, {:read_concurrency, true}, {:write_concurrency, true}])
		{:ok, %{}}
	end

	# Helper to fetch the dictionary for your API
	def get_all_health do
		@table
		|> :ets.tab2list()
		|> Map.new()
	end
end
