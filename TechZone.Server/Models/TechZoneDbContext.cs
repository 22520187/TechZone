using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models.Domain;

namespace TechZone.Server.Models;

public partial class TechZoneDbContext : DbContext
{
    public TechZoneDbContext()
    {
    }

    public TechZoneDbContext(DbContextOptions<TechZoneDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Brand> Brands { get; set; }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<CartDetail> CartDetails { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductColor> ProductColors { get; set; }

    public virtual DbSet<ProductImage> ProductImages { get; set; }

    public virtual DbSet<Promotion> Promotions { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<ChatHistory> ChatHistories { get; set; }

    public virtual DbSet<Warranty> Warranties { get; set; }

    public virtual DbSet<WarrantyClaim> WarrantyClaims { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Brand>(entity =>
        {
            entity.HasKey(e => e.BrandId).HasName("PK__Brand__DAD4F05EAF4A6C50");

            entity.ToTable("Brand");

            entity.Property(e => e.BrandImageUrl).HasMaxLength(500);
            entity.Property(e => e.BrandName).HasMaxLength(255);
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.CartId).HasName("PK__Cart__51BCD7B7A7979352");

            entity.ToTable("Cart");

            entity.HasOne(d => d.User).WithMany(p => p.Carts)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Cart__UserId__619B8048");
        });

        modelBuilder.Entity<CartDetail>(entity =>
        {
            entity.HasKey(e => e.CartDetailId).HasName("PK__CartDeta__01B6A6B456F274AD");

            entity.ToTable("CartDetail");

            entity.HasOne(d => d.Cart).WithMany(p => p.CartDetails)
                .HasForeignKey(d => d.CartId)
                .HasConstraintName("FK__CartDetai__CartI__6477ECF3");

            entity.HasOne(d => d.ProductColor).WithMany(p => p.CartDetails)
                .HasForeignKey(d => d.ProductColorId)
                .HasConstraintName("FK__CartDetai__Produ__656C112C");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Category__19093A0B8557D092");

            entity.ToTable("Category");

            entity.Property(e => e.CategoryName).HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(1000);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Order__C3905BCF7F66A025");

            entity.ToTable("Order");

            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.OrderDate).HasColumnType("datetime");
            entity.Property(e => e.PaymentMethod).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.ShippingAddress).HasMaxLength(500);
            entity.Property(e => e.Status).HasMaxLength(100);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Promotion).WithMany(p => p.Orders)
                .HasForeignKey(d => d.PromotionId)
                .HasConstraintName("FK__Order__Promotion__693CA210");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Order__UserId__68487DD7");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__OrderDet__D3B9D36C662B419F");

            entity.ToTable("OrderDetail");

            entity.Property(e => e.DiscountPercentage).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__OrderDeta__Order__6C190EBB");

            entity.HasOne(d => d.ProductColor).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.ProductColorId)
                .HasConstraintName("FK__OrderDeta__Produ__6D0D32F4");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Product__B40CC6CD65205CE0");

            entity.ToTable("Product");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.WarrantyTerms).HasMaxLength(2000);

            entity.HasOne(d => d.Brand).WithMany(p => p.Products)
                .HasForeignKey(d => d.BrandId)
                .HasConstraintName("FK__Product__BrandId__52593CB8");

            entity.HasOne(d => d.Category).WithMany(p => p.Products)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__Product__Categor__5165187F");

            entity.HasMany(d => d.Promotions).WithMany(p => p.Products)
                .UsingEntity<Dictionary<string, object>>(
                    "ProductPromotion",
                    r => r.HasOne<Promotion>().WithMany()
                        .HasForeignKey("PromotionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__ProductPr__Promo__5EBF139D"),
                    l => l.HasOne<Product>().WithMany()
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__ProductPr__Produ__5DCAEF64"),
                    j =>
                    {
                        j.HasKey("ProductId", "PromotionId").HasName("PK__ProductP__512084315C364BF6");
                        j.ToTable("ProductPromotion");
                    });
        });

        modelBuilder.Entity<ProductColor>(entity =>
        {
            entity.HasKey(e => e.ProductColorId).HasName("PK__ProductC__C5DB683E50FE1A77");

            entity.ToTable("ProductColor");

            entity.Property(e => e.Color).HasMaxLength(100);
            entity.Property(e => e.ColorCode).HasMaxLength(50);

            entity.HasOne(d => d.Product).WithMany(p => p.ProductColors)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__ProductCo__Produ__5535A963");
        });

        modelBuilder.Entity<ProductImage>(entity =>
        {
            entity.HasKey(e => e.ImageId).HasName("PK__ProductI__7516F70C348ED5A5");

            entity.ToTable("ProductImage");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.ImageUrl).HasMaxLength(500);

            entity.HasOne(d => d.Product).WithMany(p => p.ProductImages)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__ProductIm__Produ__5812160E");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__52C42FCF4F0A3E51");

            entity.ToTable("Promotion");

            entity.HasIndex(e => e.PromotionCode, "UQ__Promotio__A617E4B60C719C16").IsUnique();

            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.DiscountPercentage).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.PromotionCode).HasMaxLength(100);
            entity.Property(e => e.StartDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__Review__74BC79CE7B1D452F");

            entity.ToTable("Review");

            entity.Property(e => e.Comment).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Product).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__Review__ProductI__70DDC3D8");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Review__UserId__6FE99F9F");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__User__1788CC4C27B426D3");

            entity.ToTable("User");

            entity.HasIndex(e => e.Email, "UQ__User__A9D105346425D7C5").IsUnique();

            entity.Property(e => e.AvatarImageUrl).HasMaxLength(500);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.District).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.PasswordHash).HasMaxLength(500);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Role)
                .HasMaxLength(50)
                .HasDefaultValue("user");
            entity.Property(e => e.Ward).HasMaxLength(100);
        });

        modelBuilder.Entity<ChatHistory>(entity =>
        {
            entity.HasKey(e => e.ChatHistoryId).HasName("PK__ChatHist__A0C2A90912345678");

            entity.ToTable("ChatHistory");

            entity.Property(e => e.Message).HasMaxLength(2000);
            entity.Property(e => e.Response).HasMaxLength(2000);
            entity.Property(e => e.MessageType).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.User).WithMany(p => p.ChatHistories)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__ChatHisto__UserI__7A672E12")
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Warranty>(entity =>
        {
            entity.HasKey(e => e.WarrantyId).HasName("PK__Warranty__1234567890ABCDEF");

            entity.ToTable("Warranty");

            entity.Property(e => e.WarrantyType).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.StartDate).HasColumnType("datetime");
            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.Warranties)
                .HasForeignKey(d => d.OrderDetailId)
                .HasConstraintName("FK__Warranty__OrderD__7B5B524B")
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Product).WithMany(p => p.Warranties)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__Warranty__Produ__7C4F7684")
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<WarrantyClaim>(entity =>
        {
            entity.HasKey(e => e.WarrantyClaimId).HasName("PK__Warranty__1234567890FEDCBA");

            entity.ToTable("WarrantyClaim");

            entity.Property(e => e.IssueDescription).HasMaxLength(2000);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.SubmittedAt).HasColumnType("datetime");
            entity.Property(e => e.ResolvedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Warranty).WithMany(p => p.WarrantyClaims)
                .HasForeignKey(d => d.WarrantyId)
                .HasConstraintName("FK__WarrantyC__Warranty__7D439ABD")
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.User).WithMany(p => p.WarrantyClaims)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__WarrantyC__UserI__7E37BEF6")
                .OnDelete(DeleteBehavior.SetNull);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
