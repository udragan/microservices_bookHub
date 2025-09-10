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
	public async Task InvokeAsync(HttpContext context)
	{
		// Capture the response using a buffer
		var originalBody = context.Response.Body;
		using var memoryStream = new MemoryStream();
		context.Response.Body = memoryStream;

		await _next(context); // Proceed to the next middleware

		// Check the status code after the response
		memoryStream.Seek(0, SeekOrigin.Begin);
		await memoryStream.CopyToAsync(originalBody);
		context.Response.Body = originalBody;

		if (context.Response.StatusCode == 401 || context.Response.StatusCode == 403)
		{
			_logger.LogWarning("Unauthorized request {Method} {Path} {StatusCode}",
				context.Request.Method,
				context.Request.Path,
				context.Response.StatusCode);
		}
	}
	#endregion
}
