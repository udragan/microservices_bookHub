using System.Text.Json.Serialization;

namespace AuthService.Models;

public record User
(
	[property: JsonPropertyName("id")] int Id,
	[property: JsonPropertyName("name")] string Name,
	[property: JsonPropertyName("email")] string Email,
	[property: JsonPropertyName("role")] string Role
);
