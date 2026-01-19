namespace TechZone.Server.Services;

public interface IOpenAIService
{
    Task<string> GenerateResponseAsync(string userMessage, List<(string role, string content)>? conversationHistory = null);
    Task<string> GenerateResponseWithContextAsync(string userMessage, string systemContext);
}

