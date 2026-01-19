namespace TechZone.Server.Models.DTO.ADD
{
    public class AdminAddStaffDTO
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? Phone { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? AvatarImageUrl { get; set; }
    }
}
