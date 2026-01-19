using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace TechZone.Server.Services;

public class GeminiService : IGeminiService
{
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;
    private readonly ILogger<GeminiService> _logger;

    public GeminiService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<GeminiService> logger)
    {
        _apiKey = configuration["Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini API key not found in configuration");
        _httpClient = httpClientFactory.CreateClient();
        _logger = logger;
    }

    public async Task<string> GenerateResponseAsync(string userMessage, List<(string role, string content)>? conversationHistory = null)
    {
        try
        {
            // Build system prompt with TechZone context
            var systemPrompt = @"Bạn là AI Assistant của TechZone - một cửa hàng công nghệ chuyên cung cấp các sản phẩm điện tử, điện thoại, laptop, phụ kiện công nghệ.

Nhiệm vụ của bạn:
- Tư vấn khách hàng về sản phẩm công nghệ
- Giúp khách hàng chọn sản phẩm phù hợp với nhu cầu
- Cung cấp thông tin về giá cả, bảo hành, giao hàng
- Giải đáp các thắc mắc về sản phẩm và dịch vụ
- Hỗ trợ quy trình mua hàng

Thông tin về TechZone:
- Miễn phí giao hàng cho đơn hàng trên 500.000đ
- Thời gian giao hàng: 1-3 ngày làm việc
- Bảo hành chính hãng: 12-24 tháng tùy sản phẩm
- Chính sách đổi trả trong 7 ngày
- Hỗ trợ trả góp 0% cho đơn hàng trên 3.000.000đ

Hãy trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp và hữu ích.";

            // Build conversation context
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine(systemPrompt);

            // Add conversation history if available
            if (conversationHistory != null && conversationHistory.Count > 0)
            {
                promptBuilder.AppendLine("\nLịch sử hội thoại:");
                foreach (var (role, messageContent) in conversationHistory.TakeLast(5))
                {
                    if (!string.IsNullOrWhiteSpace(messageContent))
                    {
                        promptBuilder.AppendLine($"{(role == "user" ? "Khách hàng" : "AI")}: {messageContent}");
                    }
                }
            }

            // Add current message
            promptBuilder.AppendLine($"\nKhách hàng: {userMessage}");

            var prompt = promptBuilder.ToString();

            // Create request payload - SIMPLIFIED structure
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            // Try multiple model endpoints
            var modelEndpoints = new[]
            {
                "gemini-1.5-flash",
            };

            foreach (var model in modelEndpoints)
            {
                try
                {
                    var requestUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={_apiKey}";
                    _logger.LogInformation($"========================================");
                    _logger.LogInformation($"🔍 Trying Gemini model: {model}");
                    _logger.LogInformation($"📡 API URL: {requestUrl.Replace(_apiKey, "***API_KEY***")}");
                    _logger.LogInformation($"📤 Request Body: {jsonContent}");

                    var response = await _httpClient.PostAsync(requestUrl, httpContent);
                    var responseContent = await response.Content.ReadAsStringAsync();

                    _logger.LogInformation($"📥 Response Status: {response.StatusCode}");
                    _logger.LogInformation($"📄 Response Body: {responseContent}");
                    _logger.LogInformation($"📋 Response Headers: {string.Join(", ", response.Headers.Select(h => $"{h.Key}={string.Join(",", h.Value)}"))}");

                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation($"✅ SUCCESS with model: {model}");
                        var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);
                        var generatedText = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

                        if (!string.IsNullOrEmpty(generatedText))
                        {
                            _logger.LogInformation($"✨ Generated text length: {generatedText.Length} chars");
                            return generatedText;
                        }
                        else
                        {
                            _logger.LogWarning($"⚠️ Success but no text generated. Full response: {responseContent}");
                        }
                    }
                    else
                    {
                        _logger.LogError($"❌ Model {model} FAILED");
                        _logger.LogError($"Status Code: {response.StatusCode}");
                        _logger.LogError($"Response: {responseContent}");
                        _logger.LogError($"Reason: {response.ReasonPhrase}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"💥 EXCEPTION with model {model}");
                    _logger.LogError($"Message: {ex.Message}");
                    _logger.LogError($"Stack Trace: {ex.StackTrace}");
                    _logger.LogError($"Inner Exception: {ex.InnerException?.Message}");
                }
                
                _logger.LogInformation($"========================================");
            }

            // If all models failed, return friendly error
            _logger.LogError($"🚫 ALL MODELS FAILED - No successful response from any Gemini model");
            _logger.LogError($"API Key (first 10 chars): {_apiKey.Substring(0, Math.Min(10, _apiKey.Length))}...");
            _logger.LogError($"Tried models: {string.Join(", ", modelEndpoints)}");
            
            return "Xin lỗi, hệ thống AI đang bận. Tôi sẽ cố gắng hỗ trợ bạn sớm nhất. Vui lòng thử lại sau hoặc liên hệ hotline để được hỗ trợ trực tiếp.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"💥 FATAL ERROR in GenerateResponseAsync");
            _logger.LogError($"Error: {ex.Message}");
            _logger.LogError($"Stack trace: {ex.StackTrace}");
            _logger.LogError($"Inner Exception: {ex.InnerException?.Message}");
            
            return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau hoặc liên hệ hotline để được hỗ trợ trực tiếp.";
        }
    }

    public async Task<string> GenerateResponseWithContextAsync(string userMessage, string systemContext)
    {
        try
        {
            var prompt = $"{systemContext}\n\nKhách hàng: {userMessage}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            // Try gemini-pro first
            var requestUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={_apiKey}";
            var response = await _httpClient.PostAsync(requestUrl, httpContent);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Gemini API Error: {response.StatusCode} - {errorContent}");
                return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);

            var generatedText = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

            return generatedText ?? "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error generating Gemini response: {ex.Message}");
            return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
        }
    }
}

// Response models for Gemini API
public class GeminiResponse
{
    [JsonPropertyName("candidates")]
    public List<Candidate>? Candidates { get; set; }
}

public class Candidate
{
    [JsonPropertyName("content")]
    public Content? Content { get; set; }
}

public class Content
{
    [JsonPropertyName("parts")]
    public List<Part>? Parts { get; set; }
}

public class Part
{
    [JsonPropertyName("text")]
    public string? Text { get; set; }
}
