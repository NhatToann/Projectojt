using Microsoft.EntityFrameworkCore;
using PetShop.Data;
using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Repositories;

public sealed class AuthRepository : IAuthRepository
{
    private readonly ShopPetDatabaseContext _db;

    public AuthRepository(ShopPetDatabaseContext db)
    {
        _db = db;
    }

    public Task<Customer?> GetCustomerByEmailAsync(string email, CancellationToken ct = default)
    {
        var normalizedEmail = email.Trim().ToLower();

        return _db.Customers
            .FirstOrDefaultAsync(x => x.Email != null && x.Email.ToLower() == normalizedEmail, ct);
    }

    public async Task<Customer> CreateCustomerAsync(Customer customer, CancellationToken ct = default)
    {
        await _db.Customers.AddAsync(customer, ct);
        await _db.SaveChangesAsync(ct);
        return customer;
    }

    public async Task UpdateCustomerAsync(Customer customer, CancellationToken ct = default)
    {
        _db.Customers.Update(customer);
        await _db.SaveChangesAsync(ct);
    }
}
