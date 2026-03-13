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

builder.Services.AddDbContext<PetShop.Data.ShopPetDatabaseContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DBDefault")));

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.IdleTimeout = TimeSpan.FromHours(8);
});

builder.Services.AddScoped<PetShop.Interfaces.IProductRepository_temp, PetShop.Repositories.ProductRepository_temp>();
builder.Services.AddScoped<PetShop.Interfaces.IProductService_temp, PetShop.Services.ProductService_temp>();

builder.Services.AddScoped<PetShop.Interfaces.IAuthRepository, PetShop.Repositories.AuthRepository>();
builder.Services.AddScoped<PetShop.Interfaces.IAuthService, PetShop.Services.AuthService>();
builder.Services.AddScoped<PetShop.Interfaces.IEmailService, PetShop.Services.EmailService>();

builder.Services.AddScoped<PetShop.Interfaces.IPetServiceRepository, PetShop.Repositories.PetServiceRepository>();
builder.Services.AddScoped<PetShop.Interfaces.IPetServiceService, PetShop.Services.PetServiceService>();

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
