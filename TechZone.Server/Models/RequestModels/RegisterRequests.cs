using System.ComponentModel.DataAnnotations;

namespace TechZone.Server.Models.RequestModels
{
    public class RegisterRequests
    {
        [Required, EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }
}
