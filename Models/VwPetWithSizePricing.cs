using System;
using System.Collections.Generic;

namespace PetShop.Models;

public partial class VwPetWithSizePricing
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public string PetName { get; set; } = null!;

    public string Species { get; set; } = null!;

    public decimal? WeightKg { get; set; }

    public string? SizeGroupCode { get; set; }

    public string? DisplayName { get; set; }

    public decimal? WeightMinKg { get; set; }

    public decimal? WeightMaxKg { get; set; }

    public decimal? BathPriceMin { get; set; }

    public decimal? BathPriceMax { get; set; }

    public decimal? GroomPriceMin { get; set; }

    public decimal? GroomPriceMax { get; set; }
}
