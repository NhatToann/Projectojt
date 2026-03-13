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
    public IActionResult Index()
    {
        // Dùng React làm trang chính: chuyển sang frontend /products
        return Redirect("http://localhost:5173/products");
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

