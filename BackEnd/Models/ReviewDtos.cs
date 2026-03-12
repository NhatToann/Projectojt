using System;

namespace PetShop.Models;

public sealed record ReviewDisplayDto(
    int ReviewId,
    int ServiceId,
    int Rating,
    string? Comment,
    int? BookingId,
    int? CustomerId,
    string? CustomerName,
    DateTime CreatedAt
);
