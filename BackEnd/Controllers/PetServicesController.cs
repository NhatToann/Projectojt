using Microsoft.AspNetCore.Mvc;
using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Controllers;

[ApiController]
[Route("api/pet-services")]
public sealed class PetServicesController : ControllerBase
{
    private readonly IPetServiceService _service;

    public PetServicesController(IPetServiceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PetServiceDto>>> GetAll(CancellationToken ct)
    {
        var items = await _service.GetAllAsync(ct);
        return Ok(items);
    }
}
