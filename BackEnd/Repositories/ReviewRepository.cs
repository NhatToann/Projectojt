using Microsoft.EntityFrameworkCore;
using PetShop.Data;
using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Repositories;

public sealed class ReviewRepository : IReviewRepository
{
    private readonly ShopPetDatabaseContext _db;

    public ReviewRepository(ShopPetDatabaseContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ReviewDisplayDto>> GetServiceReviewsAsync(int serviceId, CancellationToken ct = default)
    {
        return await _db.Reviews
            .AsNoTracking()
            .Include(r => r.BookingService)
            .ThenInclude(bs => bs.Booking)
            .ThenInclude(b => b.Customer)
            .Where(r => r.ServiceId == serviceId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDisplayDto(
                r.ReviewId,
                r.ServiceId ?? 0,
                r.Rating,
                r.Comment,
                r.BookingId,
                r.CustomerId,
                r.BookingService != null && r.BookingService.Booking != null ? r.BookingService.Booking.Customer.Name : null,
                r.CreatedAt
            ))
            .ToListAsync(ct);
    }
}
