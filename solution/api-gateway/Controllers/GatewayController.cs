using ApiGateway.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiGateway.Controllers;

[ApiController]
[Route("{*url}")]
public class GatewayController(RoutingService routingService) : ControllerBase
{
	#region Public methods
	// Separate specific endpoint for register since it doesnt have authorization by design
	// THINK ABOUT THIS!!
	[HttpPost]
	[AllowAnonymous]
	[Route("/users/register")]
	public async Task<IActionResult> Register()
	{
		HttpResponseMessage response = await routingService.ForwardRequestAsync(Request);

		string content = await response.Content.ReadAsStringAsync();
		return StatusCode((int)response.StatusCode, content);
	}

	// Separate specific endpoint for register since it doesnt have authorization by design
	// THINK ABOUT THIS!!
	[HttpPost]
	[AllowAnonymous]
	[Route("/auth/login")]
	public async Task<IActionResult> Login()
	{
		HttpResponseMessage response = await routingService.ForwardRequestAsync(Request);

		string content = await response.Content.ReadAsStringAsync();
		return StatusCode((int)response.StatusCode, content);
	}

	[HttpGet, HttpPost, HttpPut, HttpDelete, HttpPatch]
	public async Task<IActionResult> HandleRequest()
	{
		// 1. Extract the incoming JWT token
		string? accessToken = Request.Headers.Authorization.ToString()
			.Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase);



		// Bypass routing if request is for swagger
		string? path = HttpContext.Request.Path.Value?.ToLower();

		if (path != null && (path.StartsWith("/swagger") || path.StartsWith("/favicon")))
		{
			return NotFound(); // Let ASP.NET Core serve this natively
		}

		HttpResponseMessage response = await routingService.ForwardRequestAsync(Request);

		string content = await response.Content.ReadAsStringAsync();
		return StatusCode((int)response.StatusCode, content);
	}
	#endregion
}
