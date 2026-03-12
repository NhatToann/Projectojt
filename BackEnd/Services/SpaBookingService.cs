using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Services;

public sealed class SpaBookingService : ISpaBookingService
{
    private readonly ISpaBookingRepository _repo;

    public SpaBookingService(ISpaBookingRepository repo)
    {
        _repo = repo;
    }

    public Task<IReadOnlyList<PetSummaryDto>> GetPetsAsync(int customerId, CancellationToken ct = default)
    {
        return _repo.GetPetsByCustomerIdAsync(customerId, ct);
    }

    public Task<IReadOnlyList<SpaServiceDto>> GetSpaServicesAsync(CancellationToken ct = default)
    {
        return _repo.GetActiveSpaServicesAsync(ct);
    }

    public async Task<SpaAvailabilityResponse> CheckAvailabilityAsync(DateTime start, int durationMin, int quantity, CancellationToken ct = default)
    {
        if (durationMin <= 0 || quantity <= 0)
        {
            return new SpaAvailabilityResponse(true, 0, 3);
        }

        var end = start.AddMinutes(durationMin);
        var existing = await _repo.CountSpaBookingsInTimeSlotAsync(start, end, ct);
        var maxCapacity = 3;
        var canBook = existing + quantity <= maxCapacity;
        return new SpaAvailabilityResponse(canBook, existing, maxCapacity);
    }

    public async Task<SpaBookingEstimateDto> EstimateAsync(int customerId, SpaBookingEstimateRequest request, CancellationToken ct = default)
    {
        if (request.PetIds == null || request.PetIds.Count == 0)
        {
            throw new ArgumentException("Vui lòng chọn pet.");
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            throw new ArgumentException("Giỏ dịch vụ trống.");
        }

        var pets = await _repo.GetPetsByCustomerIdAsync(customerId, ct);
        var selectedPets = pets.Where(p => request.PetIds.Contains(p.PetId)).ToList();

        if (selectedPets.Count == 0)
        {
            throw new InvalidOperationException("Không tìm thấy pet của khách hàng.");
        }

        var items = new List<SpaBookingEstimateItemDto>();
        int perPetDuration = 0;
        decimal totalPrice = 0m;

        foreach (var item in request.Items)
        {
            if (item.Quantity <= 0)
            {
                continue;
            }

            var pricing = await _repo.GetServicePricingAsync(item.ServiceId, selectedPets[0].BreedId, ct)
                ?? throw new InvalidOperationException("Dịch vụ không hợp lệ.");

            perPetDuration += pricing.DurationMin * item.Quantity;
        }

        foreach (var pet in selectedPets)
        {
            foreach (var item in request.Items)
            {
                if (item.Quantity <= 0)
                {
                    continue;
                }

                var pricing = await _repo.GetServicePricingAsync(item.ServiceId, pet.BreedId, ct)
                    ?? throw new InvalidOperationException("Dịch vụ không hợp lệ.");

                items.Add(new SpaBookingEstimateItemDto(
                    pet.PetId,
                    pet.PetName,
                    item.ServiceId,
                    pricing.ServiceName,
                    item.Quantity,
                    pricing.UnitPrice,
                    pricing.DurationMin
                ));

                totalPrice += pricing.UnitPrice * item.Quantity;
            }
        }

        int totalDuration = perPetDuration * selectedPets.Count;

        return new SpaBookingEstimateDto(items, perPetDuration, totalDuration, selectedPets.Count, totalPrice);
    }

    public async Task<SpaBookingDto> CreateBookingAsync(int customerId, CreateSpaBookingRequest request, CancellationToken ct = default)
    {
        if (request.PetIds == null || request.PetIds.Count == 0)
        {
            throw new ArgumentException("Vui lòng chọn pet.");
        }

        var estimate = await EstimateAsync(customerId, new SpaBookingEstimateRequest(request.PetIds, request.Items), ct);

        var appointmentStart = request.AppointmentStart;
        if (appointmentStart.Kind == DateTimeKind.Unspecified)
        {
            appointmentStart = DateTime.SpecifyKind(appointmentStart, DateTimeKind.Local);
        }
        else if (appointmentStart.Kind == DateTimeKind.Utc)
        {
            appointmentStart = appointmentStart.ToLocalTime();
        }

        if (appointmentStart <= DateTime.Now)
        {
            throw new InvalidOperationException("Thời gian hẹn không được nằm trong quá khứ.");
        }

        var appointmentEnd = appointmentStart.AddMinutes(estimate.TotalDurationMin);

        var availability = await CheckAvailabilityAsync(appointmentStart, estimate.PerPetDurationMin, 1, ct);
        if (!availability.IsAvailable)
        {
            throw new InvalidOperationException("Khung giờ đã đầy. Vui lòng chọn thời gian khác.");
        }

        var pets = await _repo.GetPetsByCustomerIdAsync(customerId, ct);
        var selectedPets = pets.Where(p => request.PetIds.Contains(p.PetId)).ToList();

        if (selectedPets.Count == 0)
        {
            throw new InvalidOperationException("Không tìm thấy pet của khách hàng.");
        }

        var createdBookingId = 0;
        DateTime currentStart = appointmentStart;
        string? firstPetName = null;

        foreach (var pet in selectedPets)
        {
            DateTime currentEnd = currentStart.AddMinutes(estimate.PerPetDurationMin);

            var booking = new Booking
            {
                CustomerId = customerId,
                PetId = pet.PetId,
                AppointmentStart = currentStart,
                AppointmentEnd = currentEnd,
                Status = "Chưa thanh toán",
                Note = request.Note?.Trim(),
                CreatedAt = DateTime.Now
            };

            var bookingId = await _repo.CreateBookingAsync(booking, ct);
            if (createdBookingId == 0)
            {
                createdBookingId = bookingId;
                firstPetName = pet.PetName;
            }

            foreach (var item in request.Items)
            {
                if (item.Quantity <= 0)
                {
                    continue;
                }

                var pricing = await _repo.GetServicePricingAsync(item.ServiceId, pet.BreedId, ct)
                    ?? throw new InvalidOperationException("Dịch vụ không hợp lệ.");

                var bookingService = new BookingService
                {
                    BookingId = bookingId,
                    ServiceId = item.ServiceId,
                    Quantity = item.Quantity,
                    UnitPrice = pricing.UnitPrice,
                    DurationMin = pricing.DurationMin,
                    Note = string.Empty,
                    CreatedAt = DateTime.Now
                };

                await _repo.AddBookingServiceAsync(bookingService, ct);
            }

            currentStart = currentEnd;
        }

        return new SpaBookingDto(
            createdBookingId,
            selectedPets.First().PetId,
            firstPetName ?? string.Empty,
            appointmentStart,
            appointmentEnd,
            "Chưa thanh toán",
            DateTime.Now,
            estimate.Items.Select(i => new SpaBookingItemDto(i.ServiceId, i.ServiceName, i.Quantity, i.UnitPrice, i.DurationMin)).ToList(),
            estimate.TotalPrice
        );
    }

    public Task<IReadOnlyList<SpaBookingDto>> GetHistoryAsync(int customerId, CancellationToken ct = default)
    {
        return _repo.GetSpaBookingsByCustomerIdAsync(customerId, ct);
    }

    public async Task UpdateStatusAsync(int bookingId, string status, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            throw new ArgumentException("Trạng thái không hợp lệ.");
        }

        var ok = await _repo.UpdateBookingStatusAsync(bookingId, status.Trim(), ct);
        if (!ok)
        {
            throw new InvalidOperationException("Không tìm thấy booking để cập nhật trạng thái.");
        }
    }

    public async Task<int> UpsertReviewAsync(int customerId, CreateSpaReviewRequest request, CancellationToken ct = default)
    {
        if (request.Rating < 1 || request.Rating > 5)
        {
            throw new ArgumentException("Rating phải từ 1 đến 5.");
        }

        var canReview = await _repo.HasCompletedBookingAsync(customerId, request.BookingId, request.ServiceId, ct);
        if (!canReview)
        {
            throw new InvalidOperationException("Bạn chưa hoàn thành dịch vụ này.");
        }

        var existingReviewId = await _repo.GetReviewIdAsync(customerId, request.BookingId, request.ServiceId, ct);

        if (existingReviewId.HasValue)
        {
            var review = new Review
            {
                ReviewId = existingReviewId.Value,
                CustomerId = customerId,
                BookingId = request.BookingId,
                ServiceId = request.ServiceId,
                Rating = request.Rating,
                Comment = request.Comment?.Trim(),
                CreatedAt = DateTime.Now
            };

            await _repo.UpdateReviewAsync(review, ct);
            return review.ReviewId;
        }

        var newReview = new Review
        {
            CustomerId = customerId,
            BookingId = request.BookingId,
            ServiceId = request.ServiceId,
            Rating = request.Rating,
            Comment = request.Comment?.Trim(),
            CreatedAt = DateTime.Now
        };

        await _repo.AddReviewAsync(newReview, ct);
        return newReview.ReviewId;
    }
}
