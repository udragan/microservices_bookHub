using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Controllers;

[ApiController]
[Route(".well-known/jwks.json")]
[Produces("application/json")]
public class JwksController(RsaSecurityKey key) : ControllerBase
{
	[HttpGet]
	public IActionResult Get()
	{
		RSAParameters parameters = key.Rsa.ExportParameters(false);

		string exponent = Base64UrlEncoder.Encode(parameters.Exponent);
		string modulus = Base64UrlEncoder.Encode(parameters.Modulus);

		var jwk = new
		{
			keys = new[]
			{
				new
				{
					kty = "RSA",
					use = "sig",
					kid = key.KeyId,
					e = exponent,
					n = modulus,
					alg = "RS256"
				}
			}
		};

		return Ok(jwk);
	}
}
