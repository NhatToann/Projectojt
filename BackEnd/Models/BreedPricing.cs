using System;
using System.Collections.Generic;

namespace PetShop.Models;

public partial class BreedPricing
{
    public int BreedPricingId { get; set; }

    public int ServiceId { get; set; }

    public int BreedId { get; set; }

    public decimal PriceAdjust { get; set; }

    public virtual Breed Breed { get; set; } = null!;

    public virtual PetService Service { get; set; } = null!;
}
