namespace TechZone.Server.Models.DTO.ADD;

public class AddChatMessageDTO
{
    public int? UserId { get; set; }
    
    public string Message { get; set; } = string.Empty;
    
    public string Response { get; set; } = string.Empty;
    
    public string MessageType { get; set; } = "user"; // "user" or "bot"
}

