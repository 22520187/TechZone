using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Repositories;
using TechZone.Server.Repositories.Implement;
using TechZone.Server.Mapping;

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
                   "http://localhost:3000"
               )
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserRepository, SQLUserRepository>();
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
builder.Services.AddScoped<IChatHistoryRepository, SQLChatHistoryRepository>();





builder.Services.AddScoped(typeof(ITechZoneRepository<>), typeof(TechZoneRepository<>));
builder.Services.AddHttpClient();  // Đăng ký IHttpClientFactory

builder.Services.AddAutoMapper(cfg => cfg.AddProfile<AutoMapperProfile>());
builder.Services.AddMemoryCache();



builder.Services.AddControllers();
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
