FROM mcr.microsoft.com/dotnet/sdk:7.0-alpine AS build
WORKDIR /src

COPY *.sln ./
COPY src/DotnetFullstackSaaS.Domain/*.csproj ./src/DotnetFullstackSaaS.Domain/
COPY src/DotnetFullstackSaaS.Application/*.csproj ./src/DotnetFullstackSaaS.Application/
COPY src/DotnetFullstackSaaS.Infrastructure/*.csproj ./src/DotnetFullstackSaaS.Infrastructure/
COPY src/DotnetFullstackSaaS.WebApi/*.csproj ./src/DotnetFullstackSaaS.WebApi/

RUN dotnet restore

COPY . .
WORKDIR /src/src/DotnetFullstackSaaS.WebApi
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:7.0-alpine AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DotnetFullstackSaaS.WebApi.dll"]
