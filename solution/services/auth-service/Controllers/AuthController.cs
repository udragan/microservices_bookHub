using AuthService.Models.FromRequests;
using AuthService.Services;
using AuthService.Services.Implementations;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
public class AuthController(TokenService _tokenService, IUserService _userService) : ControllerBase
{
	[HttpPost("login")]
	public async Task<IActionResult> Login([FromBody] LoginRequest request)
	{
		if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
		{
			return Unauthorized("no data");
		}

		(bool success, string? message, Models.User? user) = await _userService.Verify(request);

		return success ?
			Ok(new { access_token = _tokenService.GenerateUserToken(user!) }) :
			Unauthorized(message);
	}

	[HttpPost("internal/token")]
	public IActionResult ServiceToken([FromBody] ServiceTokenRequest request)
	{
		if (string.IsNullOrWhiteSpace(request.ServiceName) ||
			string.IsNullOrWhiteSpace(request.TargetServiceName) ||
			string.IsNullOrWhiteSpace(request.SharedSecret))
		{
			return Unauthorized("no data");
		}

		if (!string.Equals(request.SharedSecret, Environment.GetEnvironmentVariable("SHARED_SECRET")))
		{
			return Unauthorized("invalid credentials");
		}

		return Ok(new { access_token = _tokenService.GenerateServiceToken(request.ServiceName, request.TargetServiceName) });
	}
}
