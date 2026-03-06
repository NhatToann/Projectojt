using PetShop.Models;

namespace PetShop.Interfaces;

public interface IProductRepository_temp
{
    Task<IReadOnlyList<ProductDto_temp>> GetAllAsync(CancellationToken ct = default);
}

