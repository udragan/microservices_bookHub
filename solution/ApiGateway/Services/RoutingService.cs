namespace ApiGateway.Services;

public class RoutingService
{
	#region Members
	private readonly HttpClient _httpClient;
	private readonly IConfiguration _config;
	#endregion

	#region Constructors
	public RoutingService(HttpClient httpClient, IConfiguration config)
	{

		_httpClient = httpClient;
		_config = config;
	}
	#endregion

	#region Public methods
	public async Task<HttpResponseMessage> ForwardRequestAsync(HttpRequest request)
	{
		var routeKey = request.Path.Value?.Split('/')[1];
		var baseUrl = _config[$"Routes:{routeKey}"];

		if (string.IsNullOrEmpty(baseUrl))
			return new HttpResponseMessage(System.Net.HttpStatusCode.BadRequest) { ReasonPhrase = "Invalid route" };

		var forwardUrl = baseUrl + request.Path.Value?.Substring(routeKey.Length + 1) + request.QueryString;

		var forwardRequest = new HttpRequestMessage(new HttpMethod(request.Method), forwardUrl)
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
