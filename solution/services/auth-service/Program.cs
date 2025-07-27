using System.Security.Cryptography;
using AuthService.Services;
using AuthService.Services.Implementations;
using Microsoft.IdentityModel.Tokens;

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
builder.Services.AddSingleton(rsaKey);
builder.Services.AddSingleton(new TokenService(rsaKey, builder.Configuration["Jwt:Issuer"]!));
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

app.MapControllers();

app.Run();
