namespace DotnetFullstackSaaS.Application.Features.Auth.Dtos;

public record RegisterRequest(string Email, string Password, string FullName);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, Guid UserId, string Email, string FullName, string Role);
public record UserProfileResponse(Guid UserId, string Email, string FullName, string Role, DateTime CreatedAtUtc);
