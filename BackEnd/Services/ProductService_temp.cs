using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Services;

public sealed class ProductService_temp : IProductService_temp
{
    private readonly IProductRepository_temp _repo;

    public ProductService_temp(IProductRepository_temp repo)
    {
        _repo = repo;
    }

    public Task<IReadOnlyList<ProductDto_temp>> GetAllAsync(CancellationToken ct = default)
    {
        return _repo.GetAllAsync(ct);
    }
}

