using System.Security.Cryptography;
using AuthService.Services;
using AuthService.Services.Implementations;
using Microsoft.IdentityModel.Tokens;
using Polly;
using Polly.Retry;

Console.WriteLine("Environment variables:");
Console.WriteLine($"ASPNETCORE_ENVIRONMENT: {Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}");
Console.WriteLine($"JWT_AUDIENCE: {Environment.GetEnvironmentVariable("JWT_AUDIENCE")}");
Console.WriteLine($"RABBITMQ_HOST: {Environment.GetEnvironmentVariable("RABBITMQ_HOST")}");
Console.WriteLine($"RABBITMQ_HEARTBEAT_EXCHANGE: {Environment.GetEnvironmentVariable("RABBITMQ_HEARTBEAT_EXCHANGE")}");
Console.WriteLine("-------------------------------------------------");

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, options) =>
{
	if (int.TryParse(context.Configuration["HostPort"], out int port))
	{
		options.ListenAnyIP(port);
	}
});

// RSA key generation (for dev only — in prod, load from secure storage)
RSA rsa = RSA.Create(2048);
RsaSecurityKey rsaKey = new(rsa)
{
	KeyId = Guid.NewGuid().ToString()
};

// Add services to the container.
builder.Services.AddResiliencePipeline("rabbitmq-heartbeat-retry", builder =>
{
	builder.AddRetry(new RetryStrategyOptions
	{
		ShouldHandle = new PredicateBuilder().Handle<Exception>(),
		BackoffType = DelayBackoffType.Exponential,
		UseJitter = true,
		MaxRetryAttempts = 5,
		Delay = TimeSpan.FromSeconds(3),
		OnRetry = args =>
		{
			int attempt = args.AttemptNumber + 1;
			string exceptionMessage = args.Outcome.Exception?.Message ?? "Unknown error";
			Console.WriteLine($"[Heartbeat]: Retrying connection (Attempt {attempt}/5). Reason: {exceptionMessage}");

			return ValueTask.CompletedTask;
		}
	});
});
builder.Services.AddHostedService<HeartbeatPublisherService>();
builder.Services.AddSingleton(rsaKey);
builder.Services.AddSingleton(new TokenService(rsaKey, builder.Configuration["Jwt:Issuer"]!));
builder.Services.AddHttpClient();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IUserService, UserService>();

WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
