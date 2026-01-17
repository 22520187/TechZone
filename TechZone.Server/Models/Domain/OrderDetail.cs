using System;
using System.Collections.Generic;

namespace TechZone.Server.Models.Domain;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public int? OrderId { get; set; }

    public int? ProductColorId { get; set; }

    public int Quantity { get; set; }

    public decimal? Price { get; set; }

    public decimal? DiscountPercentage { get; set; }

    public virtual Order? Order { get; set; }

    public virtual ProductColor? ProductColor { get; set; }

    public virtual ICollection<Warranty> Warranties { get; set; } = new List<Warranty>();
}
