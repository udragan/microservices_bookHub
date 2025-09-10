using System.Text.Json;
using ApiGateway.Middleware;
using ApiGateway.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Json logging format
builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options =>
{
	options.IncludeScopes = false;
	options.TimestampFormat = "yyyy-MM-ddTHH:mm:ssffffZ ";
	options.JsonWriterOptions = new JsonWriterOptions { Indented = false };
});

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

// Jwt config from appsettings
IConfigurationSection jwtConfig = builder.Configuration.GetSection("Jwt");
string? authority = jwtConfig["Authority"];
string? audience = jwtConfig["Audience"];
string? issuer = jwtConfig["Issuer"];


// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAngularClient", policy =>
	{
		policy.AllowAnyOrigin()//WithOrigins("http://localhost:4200", "https://localhost:4200")
			.AllowAnyMethod()
			.AllowAnyHeader();
	});
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		options.Authority = authority;                  // base url
		options.Audience = audience;                    // must match 'aud' in jwt
		options.RequireHttpsMetadata = false;
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidIssuer = issuer,                       // must match 'iss' in jwt
			ValidateAudience = true,
			ValidAudience = audience,                   // must match 'aud' in jwt
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


app.UseCors("AllowAngularClient");
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseAuthorization();
app.MapControllers();

app.Run();
