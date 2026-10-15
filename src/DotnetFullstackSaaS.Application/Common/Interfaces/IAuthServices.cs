using DotnetFullstackSaaS.Domain.Entities;

namespace DotnetFullstackSaaS.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}
