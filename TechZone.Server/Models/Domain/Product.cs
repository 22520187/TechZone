using System;
using System.Collections.Generic;

namespace TechZone.Server.Models.Domain;

public partial class Product
{
    public int ProductId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string? LongDescription { get; set; }

    public decimal Price { get; set; }

    public int? StockQuantity { get; set; }

    public int? CategoryId { get; set; }

    public int? BrandId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? WarrantyPeriodMonths { get; set; }

    public string? WarrantyTerms { get; set; }

    public virtual Brand? Brand { get; set; }

    public virtual Category? Category { get; set; }

    public virtual ICollection<ProductColor> ProductColors { get; set; } = new List<ProductColor>();

    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();

    public virtual ICollection<Warranty> Warranties { get; set; } = new List<Warranty>();
}
