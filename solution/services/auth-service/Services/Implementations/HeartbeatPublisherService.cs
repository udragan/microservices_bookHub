using System.Diagnostics;
using System.Text;
using System.Text.Json;
using AuthService.Models;
using Polly;
using Polly.Registry;
using RabbitMQ.Client;

namespace AuthService.Services.Implementations;

public class HeartbeatPublisherService : BackgroundService
{
	private readonly string _serviceId = "bookhub.auth-service";
	private readonly ConnectionFactory _connectionFactory;
	private readonly JsonSerializerOptions _serializerOptions;
	private readonly string _rabbitmqHeartbeatExchange;
	private readonly string _rabbitmqHost;
	private readonly ResiliencePipeline _pollyPipeline;

	public HeartbeatPublisherService(ResiliencePipelineProvider<string> pipelineProvider)
	{
		_rabbitmqHost = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? string.Empty;
		_rabbitmqHeartbeatExchange = Environment.GetEnvironmentVariable("RABBITMQ_HEARTBEAT_EXCHANGE") ?? string.Empty;
		_pollyPipeline = pipelineProvider.GetPipeline("rabbitmq-heartbeat-retry");
		_connectionFactory = new ConnectionFactory() { HostName = _rabbitmqHost };
		_serializerOptions = new()
		{
			PropertyNamingPolicy = JsonNamingPolicy.CamelCase
		};
	}

	protected override async Task ExecuteAsync(CancellationToken cancellationToken)
	{
		while (!cancellationToken.IsCancellationRequested)
		{
			try
			{
				await _pollyPipeline.ExecuteAsync(async token =>
				{
					using IConnection connection = await _connectionFactory.CreateConnectionAsync(token);
					using IChannel channel = await connection.CreateChannelAsync(cancellationToken: token);
					await channel.ExchangeDeclareAsync(_rabbitmqHeartbeatExchange, ExchangeType.Fanout, cancellationToken: token);

					while (!cancellationToken.IsCancellationRequested)
					{
						object payload = CreatePayload();
						byte[] body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload, _serializerOptions));

						await channel.BasicPublishAsync(
							exchange: _rabbitmqHeartbeatExchange,
							routingKey: string.Empty,
							body: body,
							cancellationToken: token);

						Console.WriteLine("[Heartbeat]: Published successfully.");
						await Task.Delay(10000, token);
					}
				}, cancellationToken);
			}
			catch (Exception ex)
			{
				Console.WriteLine($"[Heartbeat]: RabbitMQ retries exhausted: {ex.Message}, retrying in 1 minute..");
				await Task.Delay(60000, cancellationToken);
			}
		}
	}

	private ServiceHealthModel CreatePayload()
	{
		var process = Process.GetCurrentProcess();

		return new ServiceHealthModel
		{
			ServiceId = _serviceId,
			Status = "alive",
			Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.ffffffZ"),
			Stats = new
			{
				cpu = process.TotalProcessorTime.TotalMicroseconds,
				memory = process.WorkingSet64 / 1024 / 1024,
				uptime = (DateTime.UtcNow - process.StartTime.ToUniversalTime()).ToString()
			},
			Data = new
			{
				validAuthorizations = 23,
				invalidAuthorizations = 3
			}
		};
	}
}
