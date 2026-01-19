using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace TechZone.Server.Services;

public class OpenAIService : IOpenAIService
{
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;
    private readonly ILogger<OpenAIService> _logger;
    private readonly string _baseUrl = "https://api.openai.com/v1/chat/completions";
    private readonly string _model = "gpt-3.5-turbo"; // Có thể thay đổi thành gpt-4 nếu muốn

    public OpenAIService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<OpenAIService> logger)
    {
        _apiKey = configuration["OpenAI:ApiKey"] ?? throw new ArgumentNullException("OpenAI API key not found in configuration");
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
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

            // Build messages array for OpenAI API
            var messages = new List<object>();

            // Add system message
            messages.Add(new
            {
                role = "system",
                content = systemPrompt
            });

            // Add conversation history if available
            if (conversationHistory != null && conversationHistory.Count > 0)
            {
                foreach (var (role, content) in conversationHistory.TakeLast(10)) // OpenAI supports more history
                {
                    if (!string.IsNullOrWhiteSpace(content))
                    {
                        messages.Add(new
                        {
                            role = role == "user" ? "user" : "assistant",
                            content = content
                        });
                    }
                }
            }

            // Add current user message
            messages.Add(new
            {
                role = "user",
                content = userMessage
            });

            // Create request payload for OpenAI
            var requestBody = new
            {
                model = _model,
                messages = messages,
                temperature = 0.7,
                max_tokens = 1000
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            _logger.LogInformation("========================================");
            _logger.LogInformation($"🔍 Calling OpenAI API");
            _logger.LogInformation($"📡 API URL: {_baseUrl}");
            _logger.LogInformation($"🤖 Model: {_model}");
            _logger.LogInformation($"📤 Request Body: {jsonContent}");

            var response = await _httpClient.PostAsync(_baseUrl, httpContent);
            var responseContent = await response.Content.ReadAsStringAsync();

            _logger.LogInformation($"📥 Response Status: {response.StatusCode}");
            _logger.LogInformation($"📄 Response Body: {responseContent}");

            if (response.IsSuccessStatusCode)
            {
                var openAIResponse = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);
                var generatedText = openAIResponse?.Choices?.FirstOrDefault()?.Message?.Content;

                if (!string.IsNullOrEmpty(generatedText))
                {
                    _logger.LogInformation($"✅ SUCCESS - Generated text length: {generatedText.Length} chars");
                    return generatedText.Trim();
                }
                else
                {
                    _logger.LogWarning($"⚠️ Success but no text generated. Full response: {responseContent}");
                    return "Xin lỗi, tôi không thể tạo phản hồi lúc này. Vui lòng thử lại sau.";
                }
            }
            else
            {
                _logger.LogError($"❌ OpenAI API Error");
                _logger.LogError($"Status Code: {response.StatusCode}");
                _logger.LogError($"Response: {responseContent}");
                
                // Try to parse error message
                try
                {
                    var errorResponse = JsonSerializer.Deserialize<OpenAIErrorResponse>(responseContent);
                    _logger.LogError($"Error Message: {errorResponse?.Error?.Message}");
                }
                catch { }

                return "Xin lỗi, hệ thống AI đang bận. Tôi sẽ cố gắng hỗ trợ bạn sớm nhất. Vui lòng thử lại sau hoặc liên hệ hotline để được hỗ trợ trực tiếp.";
            }
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
            var messages = new List<object>
            {
                new { role = "system", content = systemContext },
                new { role = "user", content = userMessage }
            };

            var requestBody = new
            {
                model = _model,
                messages = messages,
                temperature = 0.7,
                max_tokens = 1000
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(_baseUrl, httpContent);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"OpenAI API Error: {response.StatusCode} - {errorContent}");
                return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var openAIResponse = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);

            var generatedText = openAIResponse?.Choices?.FirstOrDefault()?.Message?.Content;

            return generatedText?.Trim() ?? "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error generating OpenAI response: {ex.Message}");
            return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
        }
    }
}

// Response models for OpenAI API
public class OpenAIResponse
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("object")]
    public string? Object { get; set; }

    [JsonPropertyName("created")]
    public long? Created { get; set; }

    [JsonPropertyName("model")]
    public string? Model { get; set; }

    [JsonPropertyName("choices")]
    public List<OpenAIChoice>? Choices { get; set; }

    [JsonPropertyName("usage")]
    public OpenAIUsage? Usage { get; set; }
}

public class OpenAIChoice
{
    [JsonPropertyName("index")]
    public int? Index { get; set; }

    [JsonPropertyName("message")]
    public OpenAIMessage? Message { get; set; }

    [JsonPropertyName("finish_reason")]
    public string? FinishReason { get; set; }
}

public class OpenAIMessage
{
    [JsonPropertyName("role")]
    public string? Role { get; set; }

    [JsonPropertyName("content")]
    public string? Content { get; set; }
}

public class OpenAIUsage
{
    [JsonPropertyName("prompt_tokens")]
    public int? PromptTokens { get; set; }

    [JsonPropertyName("completion_tokens")]
    public int? CompletionTokens { get; set; }

    [JsonPropertyName("total_tokens")]
    public int? TotalTokens { get; set; }
}

public class OpenAIErrorResponse
{
    [JsonPropertyName("error")]
    public OpenAIError? Error { get; set; }
}

public class OpenAIError
{
    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("code")]
    public string? Code { get; set; }
}

