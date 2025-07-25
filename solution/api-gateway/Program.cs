using ApiGateway.Middleware;
using ApiGateway.Services;

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
builder.Services.AddHttpClient();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
app.UseAuthorization();
app.MapControllers();

app.Run();
