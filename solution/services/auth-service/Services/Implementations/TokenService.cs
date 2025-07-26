using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AuthService.Models;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Services.Implementations;
public class TokenService(RsaSecurityKey _key, string _issuer)
{
	public string GenerateToken(User user)
	{
		Claim[] claims =
		[
			new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
			new Claim(JwtRegisteredClaimNames.Name, user.Name),
			new Claim(JwtRegisteredClaimNames.Email, user.Email),
			new Claim("role", user.Role)
		];

		SigningCredentials credentials = new SigningCredentials(_key, SecurityAlgorithms.RsaSha256);

		JwtSecurityToken token = new(
			issuer: _issuer,
			audience: "bookhub-api-gateway",
			claims: claims,
			expires: DateTime.UtcNow.AddHours(1),
			signingCredentials: credentials
		);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}
