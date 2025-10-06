using System;
using System.Collections.Generic;

namespace TechZone.Server.Models.Domain;

public partial class CartDetail
{
    public int CartDetailId { get; set; }

    public int? CartId { get; set; }

    public int? ProductColorId { get; set; }

    public int Quantity { get; set; }

    public virtual Cart? Cart { get; set; }

    public virtual ProductColor? ProductColor { get; set; }
}
