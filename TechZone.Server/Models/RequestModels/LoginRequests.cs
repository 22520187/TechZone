using System.ComponentModel.DataAnnotations;

namespace TechZone.Server.Models.RequestModels
{
    public class LoginRequests
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}