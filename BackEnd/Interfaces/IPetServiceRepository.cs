using PetShop.Models;

namespace PetShop.Interfaces;

public interface IPetServiceRepository
{
    Task<IReadOnlyList<PetServiceDto>> GetAllAsync(CancellationToken ct = default);
}
