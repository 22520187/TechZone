using System.ComponentModel.DataAnnotations;

namespace TechZone.Server.Models.RequestModels
{
    public class ForgotResetPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Code { get; set; } = null!;

        [Required]
        public string NewPassword { get; set; } = null!;
    }
}

