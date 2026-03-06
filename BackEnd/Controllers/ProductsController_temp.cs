using Microsoft.AspNetCore.Mvc;
using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Controllers;

[ApiController]
[Route("api/products-temp")]
public sealed class ProductsController_temp : ControllerBase
{
    private readonly IProductService_temp _service;

    public ProductsController_temp(IProductService_temp service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto_temp>>> GetAll(CancellationToken ct)
    {
        var items = await _service.GetAllAsync(ct);
        return Ok(items);
    }
}

