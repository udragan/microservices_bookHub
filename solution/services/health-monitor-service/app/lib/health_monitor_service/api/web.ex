defmodule HealthMonitorService.Api.Web do
	use Plug.Router
	use HealthMonitorService.Common.Constants

	def child_spec(_opts) do
		Plug.Cowboy.child_spec(
			scheme: :http,
			plug: __MODULE__,
			options: [port: 8010]
		)
	end

	plug HealthMonitorService.Auth.Authorization
	plug :match
	plug :dispatch

	get "/health" do
		# require IEx
		# IEx.pry()

		data = :ets.tab2list(@health_map) |> Map.new()
		#IO.inspect(data, label: "data")

		conn
		|> put_resp_content_type("application/json")
		|> send_resp(200, Jason.encode!(data))
	end

	match _ do
		send_resp(conn, 404, "endpoint not found")
	end
end
