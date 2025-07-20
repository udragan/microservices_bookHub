namespace ApiGateway.Services;

public class RoutingService(HttpClient httpClient, IConfiguration config)
{
	#region Members
	private readonly HttpClient _httpClient = httpClient;
	private readonly IConfiguration _config = config;
	#endregion

	#region Public methods
	public async Task<HttpResponseMessage> ForwardRequestAsync(HttpRequest request)
	{
		string? routeKey = request.Path.Value?.Split('/')[1];
		string? baseUrl = _config[$"Routes:{routeKey}"];

		if (string.IsNullOrEmpty(baseUrl))
			return new HttpResponseMessage(System.Net.HttpStatusCode.BadRequest) { ReasonPhrase = "Invalid route" };

		string forwardUrl = baseUrl + request.Path.Value?[(routeKey!.Length + 1)..] + request.QueryString;

		HttpRequestMessage forwardRequest = new HttpRequestMessage(new HttpMethod(request.Method), forwardUrl)
		{
			Content = new StreamContent(request.Body)
		};

		foreach (var header in request.Headers)
		{
			forwardRequest.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
		}

		return await _httpClient.SendAsync(forwardRequest);
	}
	#endregion
}
