using System;
using System.Collections.Generic;

namespace PetShop.Models;

public sealed record PetSummaryDto(
    int PetId,
    string PetName,
    int? BreedId,
    string? BreedName,
    string? SpeciesName,
    decimal? WeightKg
);

public sealed record SpaServiceDto(
    int ServiceId,
    string Name,
    string? Description,
    decimal Price,
    int Duration,
    string ServiceType,
    string? Status
);

public sealed record SpaCartItemRequest(
    int ServiceId,
    int Quantity
);

public sealed record SpaBookingEstimateRequest(
    IReadOnlyList<int> PetIds,
    IReadOnlyList<SpaCartItemRequest> Items
);

public sealed record SpaBookingEstimateItemDto(
    int PetId,
    string PetName,
    int ServiceId,
    string ServiceName,
    int Quantity,
    decimal UnitPrice,
    int DurationMin
);

public sealed record SpaBookingEstimateDto(
    IReadOnlyList<SpaBookingEstimateItemDto> Items,
    int PerPetDurationMin,
    int TotalDurationMin,
    int PetCount,
    decimal TotalPrice
);

public sealed record CreateSpaBookingRequest(
    IReadOnlyList<int> PetIds,
    DateTime AppointmentStart,
    string? Note,
    IReadOnlyList<SpaCartItemRequest> Items
);

public sealed record SpaBookingItemDto(
    int ServiceId,
    string ServiceName,
    int Quantity,
    decimal UnitPrice,
    int DurationMin
);

public sealed record SpaBookingDto(
    int BookingId,
    int PetId,
    string PetName,
    DateTime AppointmentStart,
    DateTime AppointmentEnd,
    string? Status,
    DateTime? CreatedAt,
    IReadOnlyList<SpaBookingItemDto> Items,
    decimal TotalPrice
);

public sealed record SpaAvailabilityResponse(
    bool IsAvailable,
    int ExistingBookings,
    int MaxCapacity
);

public sealed record CreateSpaReviewRequest(
    int BookingId,
    int ServiceId,
    int Rating,
    string? Comment
);
