using System.Text;

namespace ApiGateway.Services;

public class RoutingService(HttpClient _httpClient, IConfiguration _config)
{
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
		using StreamReader reader = new(request.Body, Encoding.UTF8, leaveOpen: true);
		string jsonData = await reader.ReadToEndAsync();
		request.Body.Position = 0;

		HttpRequestMessage forwardRequest = new(new HttpMethod(request.Method), forwardUrl)
		{
			Content = new StringContent(jsonData, Encoding.UTF8, request.ContentType ?? "application/json")
		};

		foreach (var header in request.Headers)
		{
			forwardRequest.Headers.TryAddWithoutValidation(header.Key, [.. header.Value]);
		}

		return await _httpClient.SendAsync(forwardRequest);
	}
	#endregion
}
