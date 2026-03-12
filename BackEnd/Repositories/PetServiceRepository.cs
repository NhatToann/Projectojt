using Microsoft.EntityFrameworkCore;
using PetShop.Data;
using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Repositories;

public sealed class PetServiceRepository : IPetServiceRepository
{
    private readonly ShopPetDatabaseContext _db;

    public PetServiceRepository(ShopPetDatabaseContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<PetServiceDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.PetServices
            .AsNoTracking()
            .OrderBy(s => s.ServiceType)
            .ThenBy(s => s.Name)
            .Select(s => new PetServiceDto(
                s.ServiceId,
                s.Name,
                s.Description,
                s.Price,
                s.Duration,
                s.ServiceType,
                s.Status,
                s.CreatedAt,
                s.UpdatedAt
            ))
            .ToListAsync(ct);
    }
}
