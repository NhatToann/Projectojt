using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
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

builder.Services.AddScoped<PetShop.Interfaces.IProductRepository_temp, PetShop.Repositories.ProductRepository_temp>();
builder.Services.AddScoped<PetShop.Interfaces.IProductService_temp, PetShop.Services.ProductService_temp>();

builder.Services.AddScoped<PetShop.Interfaces.IAuthRepository, PetShop.Repositories.AuthRepository>();
builder.Services.AddScoped<PetShop.Interfaces.IEmailService, PetShop.Services.EmailService>();
builder.Services.AddScoped<PetShop.Interfaces.IAuthService, PetShop.Services.AuthService>();

builder.Services.AddScoped<PetShop.Interfaces.IPetServiceRepository, PetShop.Repositories.PetServiceRepository>();
builder.Services.AddScoped<PetShop.Interfaces.IPetServiceService, PetShop.Services.PetServiceService>();

builder.Services.AddScoped<PetShop.Interfaces.ISpaBookingRepository, PetShop.Repositories.SpaBookingRepository>();
builder.Services.AddScoped<PetShop.Interfaces.ISpaBookingService, PetShop.Services.SpaBookingService>();

builder.Services.AddScoped<PetShop.Interfaces.IReviewRepository, PetShop.Repositories.ReviewRepository>();

builder.Services.Configure<PetShop.Models.PayOSOptions>(builder.Configuration.GetSection(PetShop.Models.PayOSOptions.SectionName));
builder.Services.AddHttpClient<PetShop.Interfaces.IPayOSService, PetShop.Services.PayOSService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("FrontendDev");

app.UseAuthorization();

app.MapControllers();

app.Run();
