namespace DotnetFullstackSaaS.Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public string Role { get; private set; } = "Developer";
    public DateTime CreatedAtUtc { get; private set; }

    private User() { }

    public static User Create(string email, string passwordHash, string fullName, string role = "Developer")
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            FullName = fullName,
            Role = role,
            CreatedAtUtc = DateTime.UtcNow
        };
    }
}
