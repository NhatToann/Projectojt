using Microsoft.EntityFrameworkCore;
using PetShop.Data;
using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Repositories;

public sealed class ProductRepository_temp : IProductRepository_temp
{
    private readonly ShopPetDatabaseContext _db;

    public ProductRepository_temp(ShopPetDatabaseContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ProductDto_temp>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.Products
            .AsNoTracking()
            .OrderBy(p => p.ProductId)
            .Select(p => new ProductDto_temp(
                p.ProductId,
                p.Name,
                p.Price,
                p.StockQuantity,
                p.Description,
                p.ImageUrl,
                p.CategoryId,
                p.Category != null ? p.Category.Name : null,
                p.SupplierId,
                p.Supplier != null ? p.Supplier.NameCompany : null
            ))
            .ToListAsync(ct);
    }
}

