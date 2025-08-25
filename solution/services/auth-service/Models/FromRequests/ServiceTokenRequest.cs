using System.Text.Json.Serialization;

namespace AuthService.Models.FromRequests;

public record ServiceTokenRequest
(
	[property: JsonPropertyName("serviceName")] string ServiceName,
	[property: JsonPropertyName("targetServiceName")] string TargetServiceName,
	[property: JsonPropertyName("sharedSecret")] string SharedSecret
);
