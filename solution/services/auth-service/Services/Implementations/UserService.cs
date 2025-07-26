using System.Net;
using System.Text;
using System.Text.Json;
using AuthService.Models;
using AuthService.Models.FromRequests;

namespace AuthService.Services.Implementations
{
	public class UserService(HttpClient httpClient) : IUserService
	{
		#region Members
		private readonly HttpClient _httpClient = httpClient;
		#endregion

		public async Task<(bool success, string? message, User? user)> Verify(LoginRequest request)
		{
			string? requestUrl = Environment.GetEnvironmentVariable("USER_SERVICE_URL");
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
