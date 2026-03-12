using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetShop.Data;
using PetShop.Models;

namespace PetShop.Controllers;

public sealed class ProductsPageController : Controller
{
    private readonly ShopPetDatabaseContext _db;

    public ProductsPageController(ShopPetDatabaseContext db)
    {
        _db = db;
    }

    [HttpGet("/")]
    [HttpGet("/products")]
    public async Task<IActionResult> Index([FromQuery] string? q, CancellationToken ct)
    {
        q = (q ?? string.Empty).Trim();

        var query = _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .AsQueryable();

        if (q.Length > 0)
        {
            query = query.Where(p =>
                (p.Name != null && p.Name.Contains(q)) ||
                (p.Description != null && p.Description.Contains(q)) ||
                (p.Category != null && p.Category.Name != null && p.Category.Name.Contains(q)) ||
                (p.Supplier != null && p.Supplier.NameCompany != null && p.Supplier.NameCompany.Contains(q)));
        }

        var items = await query
            .OrderBy(p => p.ProductId)
            .Select(p => new ProductDto_temp(
                p.ProductId,
                p.Name,
                p.Price,
                p.StockQuantity,
                p.Description,
                p.ImageUrl,
                p.CategoryId,
                p.Category != null ? p.Category.Name : null,
                p.SupplierId,
                p.Supplier != null ? p.Supplier.NameCompany : null
            ))
            .ToListAsync(ct);

        ViewData["q"] = q;
        return View(items);
    }

    [HttpGet("/products/{id:int}")]
    public async Task<IActionResult> Details([FromRoute] int id, CancellationToken ct)
    {
        var p = await _db.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Supplier)
            .Where(x => x.ProductId == id)
            .Select(x => new ProductDto_temp(
                x.ProductId,
                x.Name,
                x.Price,
                x.StockQuantity,
                x.Description,
                x.ImageUrl,
                x.CategoryId,
                x.Category != null ? x.Category.Name : null,
                x.SupplierId,
                x.Supplier != null ? x.Supplier.NameCompany : null
            ))
            .FirstOrDefaultAsync(ct);

        if (p is null) return NotFound("Không tìm thấy sản phẩm.");

        return View(p);
    }
}

