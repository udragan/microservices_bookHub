using System.Text.Json.Serialization;

namespace AuthService.Models.FromRequests;

public record LoginRequest
(
	[property: JsonPropertyName("email")] string Email,
	[property: JsonPropertyName("password")] string Password
);
