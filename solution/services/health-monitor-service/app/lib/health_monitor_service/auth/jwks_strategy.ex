defmodule HealthMonitorService.Auth.JwksStrategy do
	use GenServer
	require Logger

	def start_link(_), do: GenServer.start_link(__MODULE__, %{}, name: __MODULE__)

	def get_signer(kid) do
		table = Application.get_env(:health_monitor_service, :auth, []) |> Keyword.get(:jwks_cache)
		case :ets.lookup(table, kid) do
		[{^kid, signer}] -> signer
		[] -> nil
		end
	end

	@impl true
	def init(_) do
		table = Application.get_env(:health_monitor_service, :auth, []) |> Keyword.get(:jwks_cache)
		:ets.new(table, [:named_table, :set, :public, read_concurrency: true])
		send(self(), :fetch)
		{:ok, %{}}
	end

	@impl true
	def handle_info(:fetch, state) do
		jwks_url = Application.get_env(:health_monitor_service, :auth, []) |> Keyword.get(:jwks_url)
		case :httpc.request(:get, {String.to_charlist(jwks_url), []}, [], []) do
		{:ok, {{_, 200, _}, _headers, body}} ->
			table = Application.get_env(:health_monitor_service, :auth, []) |> Keyword.get(:jwks_cache)
			decoded = Jason.decode!(body)
			keys = Map.get(decoded, "keys", [])

			Enum.each(keys, fn key_params ->
				alg = Map.get(key_params, "alg", "RS256")
				kid = Map.get(key_params, "kid")
				signer = Joken.Signer.create(alg, key_params)
				:ets.insert(table, {kid, signer})
				end)
			Logger.info("JWKS: Successfully loaded #{length(keys)} keys into ETS.")
		error ->
			Logger.error("JWKS: Fetch failed: #{inspect(error)}")
		end

		Process.send_after(self(), :fetch, 3600_000)
		{:noreply, state}
	end
end
