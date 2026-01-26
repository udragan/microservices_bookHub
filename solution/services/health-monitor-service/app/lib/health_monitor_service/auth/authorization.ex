defmodule HealthMonitorService.Auth.Authorization do
	import Plug.Conn
	require Logger

	def init(opts), do: opts

	def call(conn, _opts) do
		with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
			{:ok, %{"kid" => kid}} <- Joken.peek_header(token),
			signer when not is_nil(signer) <- HealthMonitorService.Auth.JwksStrategy.get_signer(kid),
			{:ok, claims} <- HealthMonitorService.Auth.AuthorizationConfig.verify_and_validate(token, signer) do
				assign(conn, :current_user, claims)
		else
		[] ->
			send_unauthorized(conn, "Missing Authorization Header")
		nil ->
			Logger.error("Signer not found for kid")
			send_unauthorized(conn, "Invalid Token Key")
		{:error, reason} ->
			Logger.error("Token validation failed: #{inspect(reason)}")
			send_unauthorized(conn, "Unauthorized")
		end
	end

	defp send_unauthorized(conn, message) do
		conn
		|> put_resp_content_type("application/json")
		|> send_resp(401, Jason.encode!(%{error: message}))
		|> halt()
	end
end
