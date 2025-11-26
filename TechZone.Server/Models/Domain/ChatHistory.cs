using System;

namespace TechZone.Server.Models.Domain;

public partial class ChatHistory
{
    public int ChatHistoryId { get; set; }
    
    public int? UserId { get; set; }
    
    public string Message { get; set; } = string.Empty;
    
    public string Response { get; set; } = string.Empty;
    
    public string MessageType { get; set; } = "user"; // "user" or "bot"
    
    public DateTime CreatedAt { get; set; }
    
    public virtual User? User { get; set; }
}

