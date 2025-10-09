using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Repositories;
using TechZone.Server.Repositories.Implement;

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
builder.Services.AddHttpClient();  // Đăng ký IHttpClientFactory


builder.Services.AddMemoryCache();



builder.Services.AddScoped(typeof(ITechZoneRepository<>), typeof(TechZoneRepository<>));




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
