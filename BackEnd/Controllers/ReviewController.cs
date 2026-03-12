using Microsoft.AspNetCore.Mvc;
using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Controllers;

[ApiController]
[Route("api/reviews")]
public sealed class ReviewController : ControllerBase
{
    private readonly IReviewRepository _repo;

    public ReviewController(IReviewRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("services/{serviceId:int}")]
    public async Task<ActionResult<IReadOnlyList<ReviewDisplayDto>>> GetServiceReviews(int serviceId, CancellationToken ct)
    {
        var reviews = await _repo.GetServiceReviewsAsync(serviceId, ct);
        return Ok(reviews);
    }
}
