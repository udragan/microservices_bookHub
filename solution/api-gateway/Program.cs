using ApiGateway.Middleware;
using ApiGateway.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
	var certPath = Environment.GetEnvironmentVariable("CERT_PATH");
	var certPassword = Environment.GetEnvironmentVariable("CERT_PASSWORD");

	if (!string.IsNullOrEmpty(certPath) && !string.IsNullOrEmpty(certPassword))
	{
		Console.WriteLine("Certificate loaded");

		if (int.TryParse(Environment.GetEnvironmentVariable("PORT"), out int port))
		{
			Console.WriteLine($"parsed port: {port}");

			options.ListenAnyIP(port, listenOptions =>
			{
				listenOptions.UseHttps(certPath, certPassword);
			});
		}
		else
		{
			Console.WriteLine("Service cannot be started!");
			return;
		}
	}
});


// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		options.Authority = "http://localhost:8001";    // base url
		options.Audience = "bookhub-api-gateway";       // must match 'aud' in jwt
		options.RequireHttpsMetadata = false;
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidIssuer = "http://localhost:8001",      // must match 'iss' in jwt
			ValidateAudience = true,
			ValidAudience = "bookhub-api-gateway",      // must match 'aud' in jwt
			ValidateLifetime = true,
			ValidateIssuerSigningKey = true
		};
	});
builder.Services.AddAuthorizationBuilder()
	.SetFallbackPolicy(new AuthorizationPolicyBuilder()
		.RequireAuthenticatedUser()
		.Build());
builder.Services.AddHttpClient();

builder.Services.AddSingleton<RoutingService>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseMiddleware<RequestLoggingMiddleware>();

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
