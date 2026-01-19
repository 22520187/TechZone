using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Repositories;
using TechZone.Server.Repositories.Implement;
using TechZone.Server.Mapping;
using TechZone.Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<TechZoneDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("TechZone"), sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure();
    }));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", builder =>
    {
        builder.WithOrigins(
                   "https://localhost:3000",
                   "http://localhost:3000",
                   "http://localhost:5173",
                   "https://localhost:5173"
               )
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserRepository, SQLUserRepository>();
builder.Services.AddScoped<IStaffRepository, SQLStaffRepository>();
builder.Services.AddScoped<IOrderRepository, SQLOrderRepository>();
builder.Services.AddScoped<IOrderDetailRepository, SQLOrderDetailRepository>();
builder.Services.AddScoped<IReviewRepository, SQLReviewRepository>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IProductRepository, SQLProductRepository>();
builder.Services.AddScoped<IProductColorRepository, SQLProductColorRepository>();
builder.Services.AddScoped<IProductImageRepository, SQLProductImageRepository>();
builder.Services.AddScoped<ICategoryRepository, SQLCategoryRepository>();
builder.Services.AddScoped<IBrandRepository, SQLBrandRepository>();
builder.Services.AddScoped<ICartRepository, SQLCartRepository>();
builder.Services.AddScoped<ICartDetailRepository, SQLCartDetailRepository>();
builder.Services.AddScoped<IPromotionRepository, SQLPromotionRepository>();
builder.Services.AddScoped<IChatHistoryRepository, SQLChatHistoryRepository>();
builder.Services.AddScoped<IWarrantyRepository, SQLWarrantyRepository>();
builder.Services.AddScoped<IWarrantyClaimRepository, SQLWarrantyClaimRepository>();
builder.Services.AddScoped<VNPayService>();
//builder.Services.AddScoped<IGeminiService, GeminiService>();



builder.Services.AddScoped(typeof(ITechZoneRepository<>), typeof(TechZoneRepository<>));
builder.Services.AddHttpClient();  // Đăng ký IHttpClientFactory

builder.Services.AddAutoMapper(cfg => cfg.AddProfile<AutoMapperProfile>());
builder.Services.AddMemoryCache();



builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Handle circular references by ignoring cycles
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        // Use camelCase naming policy for JSON (JavaScript convention)
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowSpecificOrigins");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
