namespace ApiGateway.Middleware;

public class RequestLoggingMiddleware
{
	#region Members
	private readonly RequestDelegate _next;
	private readonly ILogger _logger;
	#endregion

	#region Constructors
	public RequestLoggingMiddleware(RequestDelegate next, ILoggerFactory loggerFactory)
	{
		_next = next;
		_logger = loggerFactory.CreateLogger<RequestLoggingMiddleware>();
	}
	#endregion

	#region Public methods
	public async Task Invoke(HttpContext context)
	{
		_logger.LogInformation($"Incoming request: {context.Request.Method} {context.Request.Path}");
		await _next(context);
	}
	#endregion
}
