namespace TechZone.Server.Services.Models;

public static class ChatbotKnowledgeModels
{
    public static string Normalize(string s)
        => (s ?? string.Empty).Trim().ToLowerInvariant();
}


