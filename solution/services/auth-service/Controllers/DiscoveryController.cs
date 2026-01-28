using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route(".well-known/openid-configuration")]
public class DiscoveryController(IConfiguration _config) : ControllerBase
{
	[HttpGet]
	public IActionResult Get()
	{
		string? issuer = _config["Jwt:Issuer"];
		string[] supported_response_types = ["token"];
		string[] supported_subject_types = ["public"];
		string[] supported_id_token_signing_alg_values = ["RS256"];

		return Ok(new
		{
			issuer,
			jwks_uri = $"{issuer}/.well-known/jwks.json",
			token_endpoint = $"{issuer}/connect/token",
			authorization_endpoint = $"{issuer}/connect/authorize",
			response_types_supported = supported_response_types,
			subject_types_supported = supported_subject_types,
			id_token_signing_alg_values_supported = supported_id_token_signing_alg_values
		});
	}
}
