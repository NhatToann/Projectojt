using PetShop.Models;

namespace PetShop.Interfaces;

public interface IPetServiceService
{
    Task<IReadOnlyList<PetServiceDto>> GetAllAsync(CancellationToken ct = default);
}
