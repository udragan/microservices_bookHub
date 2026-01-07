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
		ContentResult result = new ContentResult
		{
			StatusCode = (int)response.StatusCode,
			Content = content,
			ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json"
		};

		return result;
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
		ContentResult result = new ContentResult
		{
			StatusCode = (int)response.StatusCode,
			Content = content,
			ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json"
		};

		return result;
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

		if (!response.IsSuccessStatusCode)
		{
			string textContent = await response.Content.ReadAsStringAsync();
			return StatusCode((int)response.StatusCode, textContent);
		}

		string contentType = response.Content.Headers.ContentType?.ToString() ?? "application/json";

		switch (contentType)
		{
			case string ct when ct.StartsWith("application/json"):
				string textContent = await response.Content.ReadAsStringAsync();
				return new ContentResult
				{
					StatusCode = (int)response.StatusCode,
					Content = textContent,
					ContentType = contentType
				};
			case string ct when ct.StartsWith("image/"):
				Stream imageContent = await response.Content.ReadAsStreamAsync();
				return File(imageContent, contentType);
			default:
				Stream binaryContent = await response.Content.ReadAsStreamAsync();
				return File(binaryContent, contentType);
		}
	}
	#endregion
}
