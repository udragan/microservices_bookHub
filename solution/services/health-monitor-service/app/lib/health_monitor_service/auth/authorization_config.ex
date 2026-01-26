defmodule HealthMonitorService.Auth.AuthorizationConfig do
	use Joken.Config

	def token_config do
		default_claims(skip: [:aud, :iss]) # TODO_faja: set appropriate claims checks!and also check for adimn
	end
end
