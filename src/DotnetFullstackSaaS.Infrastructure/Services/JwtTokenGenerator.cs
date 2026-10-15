using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DotnetFullstackSaaS.Infrastructure.Services;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "super_secret_enterprise_jwt_key_that_is_at_least_32_bytes_long_12345";
        var issuer = _configuration["Jwt:Issuer"] ?? "DotnetFullstackSaaS";
        var audience = _configuration["Jwt:Audience"] ?? "DotnetFullstackSaaSClient";
        var expiryMinutes = int.TryParse(_configuration["Jwt:ExpiryMinutes"], out var minutes) ? minutes : 1440;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
