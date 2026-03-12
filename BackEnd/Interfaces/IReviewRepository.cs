using PetShop.Models;

namespace PetShop.Interfaces;

public interface IReviewRepository
{
    Task<IReadOnlyList<ReviewDisplayDto>> GetServiceReviewsAsync(int serviceId, CancellationToken ct = default);
}
