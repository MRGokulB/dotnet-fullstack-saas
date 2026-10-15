using DotnetFullstackSaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DotnetFullstackSaaS.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Order> Orders { get; }
    DbSet<User> Users { get; }
    DbSet<Product> Products { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
