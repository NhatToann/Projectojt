using Microsoft.EntityFrameworkCore;
using PetShop.Data;
using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Repositories;

public sealed class SpaBookingRepository : ISpaBookingRepository
{
    private readonly ShopPetDatabaseContext _db;

    public SpaBookingRepository(ShopPetDatabaseContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<PetSummaryDto>> GetPetsByCustomerIdAsync(int customerId, CancellationToken ct = default)
    {
        return await _db.Pets
            .AsNoTracking()
            .Include(p => p.Breed)
            .ThenInclude(b => b.Species)
            .Where(p => p.CustomerId == customerId)
            .OrderByDescending(p => p.UpdatedAt ?? p.CreatedAt)
            .Select(p => new PetSummaryDto(
                p.Id,
                p.PetName,
                p.BreedId,
                p.Breed != null ? p.Breed.BreedName : null,
                p.Breed != null && p.Breed.Species != null ? p.Breed.Species.SpeciesName : null,
                p.WeightKg
            ))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<SpaServiceDto>> GetActiveSpaServicesAsync(CancellationToken ct = default)
    {
        return await _db.PetServices
            .AsNoTracking()
            .Where(s => s.ServiceType == "spa" && (s.Status == null || s.Status == "active"))
            .OrderBy(s => s.ServiceType)
            .ThenBy(s => s.Name)
            .Select(s => new SpaServiceDto(
                s.ServiceId,
                s.Name,
                s.Description,
                s.Price,
                s.Duration,
                s.ServiceType,
                s.Status
            ))
            .ToListAsync(ct);
    }

    public async Task<(decimal UnitPrice, int DurationMin, string ServiceName)?> GetServicePricingAsync(int serviceId, int? breedId, CancellationToken ct = default)
    {
        var service = await _db.PetServices
            .AsNoTracking()
            .Where(s => s.ServiceId == serviceId)
            .Select(s => new { s.Price, s.Duration, s.Name })
            .FirstOrDefaultAsync(ct);

        if (service == null)
        {
            return null;
        }

        decimal unitPrice = service.Price;

        if (breedId.HasValue)
        {
            var adjust = await _db.BreedPricings
                .AsNoTracking()
                .Where(bp => bp.ServiceId == serviceId && bp.BreedId == breedId.Value)
                .Select(bp => (decimal?)bp.PriceAdjust)
                .FirstOrDefaultAsync(ct);

            if (adjust.HasValue)
            {
                unitPrice = unitPrice + adjust.Value;
            }
        }

        return (unitPrice, service.Duration, service.Name);
    }

    public async Task<int> CountSpaBookingsInTimeSlotAsync(DateTime start, DateTime end, CancellationToken ct = default)
    {
        return await _db.Bookings
            .AsNoTracking()
            .Where(b => b.AppointmentStart < end && b.AppointmentEnd > start)
            .Where(b => b.Status != null && (b.Status == "Đã thanh toán" || b.Status == "Chờ xác nhận" || b.Status == "Đã xác nhận" || b.Status == "pending" || b.Status == "confirmed"))
            .Where(b => b.BookingServices.Any(bs => bs.Service.ServiceType == "spa"))
            .CountAsync(ct);
    }

    public async Task<int> CreateBookingAsync(Booking booking, CancellationToken ct = default)
    {
        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);
        return booking.BookingId;
    }

    public async Task AddBookingServiceAsync(BookingService bookingService, CancellationToken ct = default)
    {
        _db.BookingServices.Add(bookingService);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<SpaBookingDto>> GetSpaBookingsByCustomerIdAsync(int customerId, CancellationToken ct = default)
    {
        var bookings = await _db.Bookings
            .AsNoTracking()
            .Include(b => b.Pet)
            .Include(b => b.BookingServices)
            .ThenInclude(bs => bs.Service)
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.CreatedAt)
            .ThenByDescending(b => b.AppointmentStart)
            .ToListAsync(ct);

        return bookings
            .Where(b => b.BookingServices.Any(bs => bs.Service.ServiceType == "spa"))
            .Select(b => new SpaBookingDto(
                b.BookingId,
                b.PetId,
                b.Pet?.PetName ?? string.Empty,
                b.AppointmentStart,
                b.AppointmentEnd,
                b.Status,
                b.CreatedAt,
                b.BookingServices.Select(bs => new SpaBookingItemDto(
                    bs.ServiceId,
                    bs.Service.Name,
                    bs.Quantity,
                    bs.UnitPrice ?? 0m,
                    bs.DurationMin ?? 0
                )).ToList(),
                b.BookingServices.Sum(bs => (bs.UnitPrice ?? 0m) * bs.Quantity)
            ))
            .ToList();
    }

    public async Task<bool> UpdateBookingStatusAsync(int bookingId, string status, CancellationToken ct = default)
    {
        var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.BookingId == bookingId, ct);
        if (booking == null)
        {
            return false;
        }

        booking.Status = status;
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> HasCompletedBookingAsync(int customerId, int bookingId, int serviceId, CancellationToken ct = default)
    {
        return await _db.Bookings
            .AsNoTracking()
            .Where(b => b.BookingId == bookingId && b.CustomerId == customerId)
            .Where(b => b.Status == "Hoàn thành" || b.Status == "completed" || b.Status == "Đã thanh toán" || b.Status == "Chờ xác nhận" || b.Status == "Đã xác nhận")
            .AnyAsync(b => b.BookingServices.Any(bs => bs.ServiceId == serviceId), ct);
    }

    public async Task<int?> GetReviewIdAsync(int customerId, int bookingId, int serviceId, CancellationToken ct = default)
    {
        return await _db.Reviews
            .AsNoTracking()
            .Where(r => r.CustomerId == customerId && r.BookingId == bookingId && r.ServiceId == serviceId)
            .Select(r => (int?)r.ReviewId)
            .FirstOrDefaultAsync(ct);
    }

    public async Task AddReviewAsync(Review review, CancellationToken ct = default)
    {
        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateReviewAsync(Review review, CancellationToken ct = default)
    {
        _db.Reviews.Update(review);
        await _db.SaveChangesAsync(ct);
    }
}
