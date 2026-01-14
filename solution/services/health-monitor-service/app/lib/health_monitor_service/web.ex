defmodule HealthMonitorService.Web do
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
		send_resp(conn, 200, "health-monitor-service: OK")
	end

	match _ do
		send_resp(conn, 404, "endpoint not found")
	end
end
