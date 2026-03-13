using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var dbConnectionString = builder.Configuration.GetConnectionString("DBDefault");
if (string.IsNullOrWhiteSpace(dbConnectionString))
{
    throw new InvalidOperationException(
        "Missing connection string 'ConnectionStrings:DBDefault'. " +
        "Add it to appsettings.json/appsettings.Development.json, or set environment variable 'ConnectionStrings__DBDefault'.");
}

builder.Services.AddDbContext<PetShop.Data.ShopPetDatabaseContext>(options =>
    options.UseSqlServer(dbConnectionString));

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.IdleTimeout = TimeSpan.FromHours(8);
});

builder.Services.AddScoped<PetShop.Interfaces.IProductRepository_temp, PetShop.Repositories.ProductRepository_temp>();
builder.Services.AddScoped<PetShop.Interfaces.IProductService_temp, PetShop.Services.ProductService_temp>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("FrontendDev");

app.UseSession();

app.UseAuthorization();

app.MapControllers();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=ProductsPage}/{action=Index}/{id?}");

app.Run();
