using AuthService.Models;
using AuthService.Models.FromRequests;

namespace AuthService.Services;

public interface IUserService
{
	Task<(bool success, string? message, User? user)> Verify(LoginRequest request);
}
