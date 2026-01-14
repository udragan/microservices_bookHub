defmodule HealthMonitorService.Api.Web do
	use Plug.Router

	def child_spec(_opts) do
		Plug.Cowboy.child_spec(
			scheme: :http,
			plug: __MODULE__,
			options: [port: 8005]
		)
	end

	plug :match
	plug :dispatch

	get "/health" do
		# require IEx
		# IEx.pry()
		data = HealthMonitorService.Storage.Storage.get_all_health()

		conn
		|> put_resp_content_type("application/json")
		|> send_resp(200, Jason.encode!(data))
	end

	match _ do
		send_resp(conn, 404, "endpoint not found")
	end
end
