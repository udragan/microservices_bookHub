using System.Text;

namespace ApiGateway.Services;

public class RoutingService(HttpClient _httpClient, IConfiguration _config, ILoggerFactory _loggerFactory)
{
	#region Members
	private readonly ILogger<RoutingService> _logger = _loggerFactory.CreateLogger<RoutingService>();
	#endregion

	#region Public methods
	public async Task<HttpResponseMessage> ForwardRequestAsync(HttpRequest request)
	{
		string? routeKey = request.Path.Value?.Split('/')[1];
		string? baseUrl = _config[$"Routes:{routeKey}"];

		if (string.IsNullOrEmpty(baseUrl))
			return new HttpResponseMessage(System.Net.HttpStatusCode.BadRequest) { ReasonPhrase = "Invalid route" };

		string forwardUrl = baseUrl + request.Path.Value?[(routeKey!.Length + 1)..] + request.QueryString;

		request.EnableBuffering(); // must be called for further reads!
		request.Body.Position = 0;

		HttpRequestMessage forwardRequest = new(new HttpMethod(request.Method), forwardUrl);

		if (request.ContentType != null && request.ContentType.Contains("multipart/form-data"))
		{
			IFormCollection form = await request.ReadFormAsync();

			// Create a new MultipartFormDataContent with the same boundary as the original request
			string boundary = request.ContentType.Split("boundary=")[1];
			MultipartFormDataContent multipartContent = new($"----{boundary}");

			foreach (var field in form)
			{
				multipartContent.Add(new StringContent(field.Value, Encoding.UTF8), field.Key);
			}

			foreach (var file in form.Files)
			{
				StreamContent fileContent = new(file.OpenReadStream());
				fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
				multipartContent.Add(fileContent, file.Name, file.FileName);
			}

			forwardRequest.Content = multipartContent;
		}
		else
		{
			using StreamReader reader = new(request.Body, Encoding.UTF8, leaveOpen: true);
			string bodyContent = await reader.ReadToEndAsync();
			request.Body.Position = 0;

			forwardRequest.Content = new StringContent(bodyContent, Encoding.UTF8, request.ContentType ?? "application/json");
		}

		foreach (var header in request.Headers)
		{
			if (header.Key.Equals("Content-Type", StringComparison.OrdinalIgnoreCase) ||
				header.Key.Equals("Content-Length", StringComparison.OrdinalIgnoreCase))
				continue;

			forwardRequest.Headers.TryAddWithoutValidation(header.Key, [.. header.Value]);
		}

		return await _httpClient.SendAsync(forwardRequest);
	}
	#endregion
}
