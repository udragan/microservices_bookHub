using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route(".well-known/openid-configuration")]
public class DiscoveryController(IConfiguration config) : ControllerBase
{
	[HttpGet]
	public IActionResult Get()
	{
		string? issuer = config["Jwt:Issuer"];
		return Ok(new
		{
			issuer,
			jwks_uri = $"{issuer}/.well-known/jwks.json",
			token_endpoint = $"{issuer}/connect/token",
			authorization_endpoint = $"{issuer}/connect/authorize",
			response_types_supported = new[] { "token" },
			subject_types_supported = new[] { "public" },
			id_token_signing_alg_values_supported = new[] { "RS256" }
		});
	}
}
