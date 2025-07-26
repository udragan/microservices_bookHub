using AuthService.Models.FromRequests;
using AuthService.Services;
using AuthService.Services.Implementations;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
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
			Ok(new { access_token = _tokenService.GenerateToken(user!) }) :
			Unauthorized(message);
	}
}
