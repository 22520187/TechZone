using System.Text.Json.Serialization;

namespace TechZone.Server.Models.DTO.ADD
{
    public class AddReviewRequestDTO
    {
        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        [JsonPropertyName("productId")]
        public int ProductId { get; set;}

        [JsonPropertyName("rating")]
        public int Rating { get; set; }

        [JsonPropertyName("comment")]
        public string? Comment { get; set; }
    }
}