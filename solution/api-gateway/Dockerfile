# Use the official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app

COPY . .
RUN dotnet restore "./ApiGateway.sln"
RUN dotnet publish "./ApiGateway.csproj" -c Release -o out


# Use ASP.NET runtime image for final image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app

COPY --from=build /app/out .

# Copy certificate into container
COPY Cert/dev-certificate.pfx /https/dev-certificate.pfx

EXPOSE ${PORT}

ENTRYPOINT ["dotnet", "ApiGateway.dll"]
