using ApiGateway.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiGateway.Controllers;

[ApiController]
[Route("{*url}")]
public class GatewayController : ControllerBase
{
	#region Members
	private readonly RoutingService _routingService;
	#endregion

	#region Constructors
	public GatewayController(RoutingService routingService)
	{
		_routingService = routingService;
	}
	#endregion

	#region Public methods
	[HttpGet, HttpPost, HttpPut, HttpDelete, HttpPatch]
	public async Task<IActionResult> HandleRequest()
	{
		var response = await _routingService.ForwardRequestAsync(Request);

		var content = await response.Content.ReadAsStringAsync();
		return StatusCode((int)response.StatusCode, content);
	}
	#endregion
}
