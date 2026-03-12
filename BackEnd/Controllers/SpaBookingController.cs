using Microsoft.AspNetCore.Mvc;
using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Controllers;

[ApiController]
[Route("api/spa-booking")]
public sealed class SpaBookingController : ControllerBase
{
    private readonly ISpaBookingService _service;

    public SpaBookingController(ISpaBookingService service)
    {
        _service = service;
    }

    [HttpGet("pets")]
    public async Task<ActionResult<IReadOnlyList<PetSummaryDto>>> GetPets([FromQuery] int customerId, CancellationToken ct)
    {
        var pets = await _service.GetPetsAsync(customerId, ct);
        return Ok(pets);
    }

    [HttpGet("services")]
    public async Task<ActionResult<IReadOnlyList<SpaServiceDto>>> GetServices(CancellationToken ct)
    {
        var services = await _service.GetSpaServicesAsync(ct);
        return Ok(services);
    }

    [HttpPost("availability")]
    public async Task<ActionResult<SpaAvailabilityResponse>> CheckAvailability([FromBody] SpaAvailabilityRequest request, CancellationToken ct)
    {
        var result = await _service.CheckAvailabilityAsync(request.Start, request.DurationMin, request.Quantity, ct);
        return Ok(result);
    }

    [HttpPost("estimate")]
    public async Task<ActionResult<SpaBookingEstimateDto>> Estimate([FromQuery] int customerId, [FromBody] SpaBookingEstimateRequest request, CancellationToken ct)
    {
        var result = await _service.EstimateAsync(customerId, request, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<SpaBookingDto>> Create([FromQuery] int customerId, [FromBody] CreateSpaBookingRequest request, CancellationToken ct)
    {
        var result = await _service.CreateBookingAsync(customerId, request, ct);
        return Ok(result);
    }

    [HttpGet("history")]
    public async Task<ActionResult<IReadOnlyList<SpaBookingDto>>> History([FromQuery] int customerId, CancellationToken ct)
    {
        var history = await _service.GetHistoryAsync(customerId, ct);
        return Ok(history);
    }

    [HttpPatch("{bookingId:int}/status")]
    public async Task<ActionResult<object>> UpdateStatus(int bookingId, [FromBody] UpdateBookingStatusRequest request, CancellationToken ct)
    {
        await _service.UpdateStatusAsync(bookingId, request.Status, ct);
        return Ok(new { message = "Updated" });
    }

    [HttpPost("review")]
    public async Task<ActionResult<object>> Review([FromQuery] int customerId, [FromBody] CreateSpaReviewRequest request, CancellationToken ct)
    {
        try
        {
            var reviewId = await _service.UpsertReviewAsync(customerId, request, ct);
            return Ok(new { reviewId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    public sealed record SpaAvailabilityRequest(DateTime Start, int DurationMin, int Quantity);

    public sealed record UpdateBookingStatusRequest(string Status);
}
