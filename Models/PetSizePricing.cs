using System;
using System.Collections.Generic;

namespace PetShop.Models;

public partial class PetSizePricing
{
    public string Species { get; set; } = null!;

    public string SizeGroupCode { get; set; } = null!;

    public string DisplayName { get; set; } = null!;

    public decimal? WeightMinKg { get; set; }

    public decimal? WeightMaxKg { get; set; }

    public decimal BathPriceMin { get; set; }

    public decimal BathPriceMax { get; set; }

    public decimal GroomPriceMin { get; set; }

    public decimal GroomPriceMax { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
