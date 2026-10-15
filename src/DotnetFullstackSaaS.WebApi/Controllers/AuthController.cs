using System.Security.Claims;
using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Application.Features.Auth.Dtos;
using DomainUser = DotnetFullstackSaaS.Domain.Entities.User;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DotnetFullstackSaaS.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;

    public AuthController(
        IApplicationDbContext dbContext,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await _registerValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var normalizedEmail = request.Email.ToLowerInvariant();
        var exists = await _dbContext.Users.AnyAsync(u => u.Email == normalizedEmail, cancellationToken);
        if (exists)
        {
            return Conflict(new { message = "User with this email already exists" });
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);
        var user = DomainUser.Create(normalizedEmail, passwordHash, request.FullName);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenGenerator.GenerateToken(user);
        return Ok(new AuthResponse(token, user.Id, user.Email, user.FullName, user.Role));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await _loginValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var normalizedEmail = request.Email.ToLowerInvariant();
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);
        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var token = _jwtTokenGenerator.GenerateToken(user);
        return Ok(new AuthResponse(token, user.Id, user.Email, user.FullName, user.Role));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponse>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }

        var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new UserProfileResponse(user.Id, user.Email, user.FullName, user.Role, user.CreatedAtUtc));
    }
}
