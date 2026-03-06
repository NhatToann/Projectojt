using PetShop.Models;

namespace PetShop.Interfaces;

public interface IProductService_temp
{
    Task<IReadOnlyList<ProductDto_temp>> GetAllAsync(CancellationToken ct = default);
}

