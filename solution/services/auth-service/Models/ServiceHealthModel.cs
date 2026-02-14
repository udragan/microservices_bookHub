namespace AuthService.Models;

public class ServiceHealthModel
{
	public string ServiceId { get; set; } = string.Empty;
	public string Status { get; set; } = string.Empty;
	public string Timestamp { get; set; } = string.Empty;
	public object Stats { get; set; } = default!;
	public object Data { get; set; } = default!;
}
