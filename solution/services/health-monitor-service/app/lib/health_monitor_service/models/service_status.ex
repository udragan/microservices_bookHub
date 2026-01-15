defmodule HealthMonitorService.Models.ServiceStatus do
	@derive Jason.Encoder
	defstruct [
		:service_id,
		:timestamp,
		:status,
		stats: %{},
		data: %{}
	]
end
