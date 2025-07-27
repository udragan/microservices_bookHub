using System.Net;
using System.Text;
using System.Text.Json;
using AuthService.Models;
using AuthService.Models.FromRequests;

namespace AuthService.Services.Implementations
{
	public class UserService(IConfiguration _config, HttpClient _httpClient) : IUserService
	{
		public async Task<(bool success, string? message, User? user)> Verify(LoginRequest request)
		{
			string? userServiceUrl = _config["Services:UserServiceUrl"];
			string? requestUrl = string.Join("/", userServiceUrl, "internal/verify");
			string jsonData = JsonSerializer.Serialize(request);
			StringContent content = new(jsonData, Encoding.UTF8, "application/json");

			try
			{
				HttpResponseMessage response = await _httpClient.PostAsync(requestUrl, content);

				if (response.StatusCode == HttpStatusCode.Unauthorized)
				{
					return (false, "Invalid credentials", null);
				}

				response.EnsureSuccessStatusCode(); // Throws for 400–599 (except 401, which we already caught)

				string responseJson = await response.Content.ReadAsStringAsync();

				User user = JsonSerializer.Deserialize<User>(responseJson)!;

				return (true, null, user);
			}
			catch (HttpRequestException ex)
			{
				return (false, $"Request error: {ex.Message}", null);
			}
		}
	}
}
