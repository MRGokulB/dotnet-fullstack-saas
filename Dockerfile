FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["src/DotnetFullstackSaaS.Domain/DotnetFullstackSaaS.Domain.csproj", "src/DotnetFullstackSaaS.Domain/"]
COPY ["src/DotnetFullstackSaaS.Application/DotnetFullstackSaaS.Application.csproj", "src/DotnetFullstackSaaS.Application/"]
COPY ["src/DotnetFullstackSaaS.Infrastructure/DotnetFullstackSaaS.Infrastructure.csproj", "src/DotnetFullstackSaaS.Infrastructure/"]
COPY ["src/DotnetFullstackSaaS.WebApi/DotnetFullstackSaaS.WebApi.csproj", "src/DotnetFullstackSaaS.WebApi/"]
RUN dotnet restore "src/DotnetFullstackSaaS.WebApi/DotnetFullstackSaaS.WebApi.csproj"

COPY . .
WORKDIR "/src/src/DotnetFullstackSaaS.WebApi"
RUN dotnet build "DotnetFullstackSaaS.WebApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DotnetFullstackSaaS.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DotnetFullstackSaaS.WebApi.dll"]
