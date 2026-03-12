using System;
using System.Collections.Generic;

namespace PetShop.Models;

public partial class Notification
{
    public int NotificationId { get; set; }

    public int StaffId { get; set; }

    public string? Title { get; set; }

    public string? Message { get; set; }

    public bool? IsRead { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? RelatedRequestId { get; set; }

    public bool? IsHandled { get; set; }
}
