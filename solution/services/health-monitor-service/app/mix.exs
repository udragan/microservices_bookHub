defmodule HealthMonitorService.MixProject do
	use Mix.Project

	def project do
		[
			app: :health_monitor_service,
			version: "0.1.0",
			elixir: "~> 1.19",
			start_permanent: Mix.env() == :prod,
			deps: deps()
		]
	end

	# Run "mix help compile.app" to learn about applications.
	def application do
		[
			extra_applications: [:logger],
			mod: {HealthMonitorService.Application, []}
		]
	end

	# Run "mix help deps" to learn about dependencies.
	defp deps do
		[
			{:jason, "~> 1.4"},
			{:joken, "~> 2.6"},
	 		{:joken_jwks, "~> 1.6"},
			{:hackney, "~> 1.18"},
			{:tesla, "~> 1.4"},
			{:plug_cowboy, "~> 2.7"},
			{:broadway, "~> 1.0"},
			{:broadway_rabbitmq, "~> 0.7"}
		]
	end
end
