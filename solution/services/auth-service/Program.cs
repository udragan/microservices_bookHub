using System.Security.Cryptography;
using AuthService.Services;
using AuthService.Services.Implementations;
using Microsoft.IdentityModel.Tokens;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
	if (int.TryParse(Environment.GetEnvironmentVariable("PORT"), out int port))
	{
		Console.WriteLine($"parsed port: {port}");

		options.ListenAnyIP(port);
	}
	else
	{
		Console.WriteLine("Service cannot be started!");
		return;
	}
});

// RSA key generation (for dev only — in prod, load from secure storage)
RSA rsa = RSA.Create(2048);
RsaSecurityKey rsaKey = new(rsa)
{
	KeyId = Guid.NewGuid().ToString()
};

// Add services to the container.
builder.Services.AddSingleton(rsaKey);
builder.Services.AddSingleton(new TokenService(rsaKey, "http://bookhub-auth"));
builder.Services.AddHttpClient();
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddScoped<IUserService, UserService>();

WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.MapOpenApi();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
