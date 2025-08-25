using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AuthService.Models;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Services.Implementations;
public class TokenService(RsaSecurityKey _key, string _issuer)
{
	public string GenerateUserToken(User user)
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
			audience: Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
			claims: claims,
			expires: DateTime.UtcNow.AddHours(1),
			signingCredentials: credentials
		);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}

	public string GenerateServiceToken(string serviceName, string targetServiceName)
	{
		Claim[] claims =
		[
			new Claim(JwtRegisteredClaimNames.Sub, serviceName),
			new Claim(JwtRegisteredClaimNames.Azp, targetServiceName)
		];

		SigningCredentials credentials = new SigningCredentials(_key, SecurityAlgorithms.RsaSha256);

		JwtSecurityToken token = new(
			issuer: _issuer,
			audience: Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
			claims: claims,
			expires: DateTime.UtcNow.AddMinutes(5),
			signingCredentials: credentials
		);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}
