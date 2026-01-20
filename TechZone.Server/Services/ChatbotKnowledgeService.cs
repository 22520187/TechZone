using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Text;
using TechZone.Server.Models;
using TechZone.Server.Services.Models;

namespace TechZone.Server.Services;

public class ChatbotKnowledgeService : IChatbotKnowledgeService
{
    private readonly TechZoneDbContext _context;

    public ChatbotKnowledgeService(TechZoneDbContext context)
    {
        _context = context;
    }

    public async Task<string?> TryAnswerFromDatabaseAsync(string message, int? userId)
    {
        var m = ChatbotKnowledgeModels.Normalize(message);
        if (string.IsNullOrWhiteSpace(m)) return null;

        // Compare intent: "so sánh A và B", "A vs B"
        var compare = TryParseCompareQuery(m);
        if (compare != null)
        {
            var (left, right) = compare.Value;

            var leftProduct = await FindBestProductMatchAsync(left);
            var rightProduct = await FindBestProductMatchAsync(right);

            if (leftProduct == null && rightProduct == null)
            {
                return $"Mình không tìm thấy cả **{left}** và **{right}** trong database TechZone. Bạn thử gửi đúng tên sản phẩm như trong shop (hoặc gửi link/tên gần đúng hơn) nhé.";
            }

            if (leftProduct == null || rightProduct == null)
            {
                var found = leftProduct ?? rightProduct;
                var missing = leftProduct == null ? left : right;
                var foundBrand = found?.Brand?.BrandName ?? "N/A";
                var foundCategory = found?.Category?.CategoryName ?? "N/A";
                return
                    $"Mình chỉ tìm thấy **{found?.Name}** ({foundBrand} | {foundCategory}) với giá **{found?.Price:n0} đ**.\n" +
                    $"Còn **{missing}** thì mình chưa thấy trong database TechZone (có thể shop chưa có sản phẩm này / tên khác).";
            }

            var p1 = leftProduct;
            var p2 = rightProduct;

            var diff = p1.Price - p2.Price;
            var absDiff = Math.Abs(diff);
            var who = diff > 0 ? p1.Name : (diff < 0 ? p2.Name : "Cả hai");

            var sb = new StringBuilder();
            sb.AppendLine("So sánh giá (theo database TechZone):");
            sb.AppendLine($"- {p1.Name}: {p1.Price:n0} đ");
            sb.AppendLine($"- {p2.Name}: {p2.Price:n0} đ");
            if (diff == 0)
            {
                sb.AppendLine("=> Hai sản phẩm đang **bằng giá**.");
            }
            else
            {
                sb.AppendLine($"=> **{who}** đắt hơn **{absDiff:n0} đ**.");
            }
            sb.AppendLine("Bạn muốn mình so sánh thêm cấu hình/điểm mạnh yếu (nếu dữ liệu có trong hệ thống) không?");
            return sb.ToString().Trim();
        }

        // Warranty intent
        if (m.Contains("bảo hành") || m.Contains("warranty"))
        {
            if (userId == null)
            {
                return "Bạn vui lòng đăng nhập để mình kiểm tra thông tin bảo hành theo tài khoản của bạn.";
            }

            var warranties = await _context.Warranties
                .Include(w => w.OrderDetail!)
                    .ThenInclude(od => od.Order)
                .Include(w => w.OrderDetail!)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc!.Product)
                .Where(w => w.OrderDetail != null &&
                            w.OrderDetail.Order != null &&
                            w.OrderDetail.Order.UserId == userId)
                .OrderByDescending(w => w.CreatedAt)
                .Take(5)
                .ToListAsync();

            if (warranties.Count == 0)
            {
                return "Mình chưa thấy bảo hành nào trong hệ thống cho tài khoản này. Nếu bạn vừa hoàn tất đơn hàng, hãy thử vào lại sau hoặc cung cấp mã đơn để mình kiểm tra giúp.";
            }

            var sb = new StringBuilder();
            sb.AppendLine("Mình tìm thấy các bảo hành gần đây của bạn:");
            foreach (var w in warranties)
            {
                var productName = w.OrderDetail?.ProductColor?.Product?.Name ?? "(không rõ sản phẩm)";
                sb.AppendLine($"- #{w.WarrantyId}: {productName} | {w.StartDate:yyyy-MM-dd} → {w.EndDate:yyyy-MM-dd} | Trạng thái: {w.Status}");
            }
            return sb.ToString().Trim();
        }

        // Order intent
        if (m.Contains("đơn hàng") || m.Contains("order") || m.Contains("vận chuyển") || m.Contains("giao hàng"))
        {
            if (userId == null)
            {
                return "Bạn vui lòng đăng nhập để mình kiểm tra tình trạng đơn hàng theo tài khoản của bạn.";
            }

            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .ToListAsync();

            if (orders.Count == 0)
            {
                return "Mình chưa thấy đơn hàng nào của bạn trong hệ thống.";
            }

            var sb = new StringBuilder();
            sb.AppendLine("Đơn hàng gần đây của bạn:");
            foreach (var o in orders)
            {
                var itemCount = o.OrderDetails?.Count ?? 0;
                sb.AppendLine($"- Mã đơn #{o.OrderId} | {o.OrderDate:yyyy-MM-dd} | Trạng thái: {o.Status} | Số sản phẩm: {itemCount}");
            }
            sb.AppendLine("Nếu bạn muốn mình kiểm tra chi tiết 1 đơn, hãy gửi: \"mã đơn 123\".");
            return sb.ToString().Trim();
        }

        // Product price query intent: "giá của X", "giá X", "X giá bao nhiêu"
        var priceQuery = TryExtractProductNameForPrice(m);
        if (!string.IsNullOrWhiteSpace(priceQuery))
        {
            var product = await FindBestProductMatchAsync(priceQuery);
            if (product != null)
            {
                var brand = product.Brand?.BrandName ?? "N/A";
                var category = product.Category?.CategoryName ?? "N/A";
                return $"**{product.Name}** ({brand} | {category})\n" +
                       $"Giá: **{product.Price:n0} đ**\n" +
                       $"{(product.StockQuantity.HasValue ? $"Tồn kho: {product.StockQuantity} sản phẩm" : "")}";
            }
        }

        // Product intent (basic search)
        if (m.Contains("sản phẩm") || m.Contains("laptop") || m.Contains("điện thoại") || m.Contains("tai nghe") || m.Contains("chuột") || m.Contains("bàn phím") || m.Contains("giá") || m.Contains("recommend") || m.Contains("gợi ý"))
        {
            // Improved: extract product name more intelligently
            var query = ExtractProductQuery(m);

            var productsQuery = _context.Products
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query))
            {
                var qLower = query.ToLower();
                // Case-insensitive search
                productsQuery = productsQuery.Where(p =>
                    p.Name.ToLower().Contains(qLower) ||
                    (p.Brand != null && p.Brand.BrandName.ToLower().Contains(qLower)) ||
                    (p.Category != null && p.Category.CategoryName.ToLower().Contains(qLower)) ||
                    (p.Description != null && p.Description.ToLower().Contains(qLower)));
            }

            var products = await productsQuery
                .OrderByDescending(p => p.CreatedAt)
                .Take(10) // Increase to 10 for better matching
                .ToListAsync();

            if (products.Count == 0)
            {
                // Fallback: try fuzzy search with individual words
                if (!string.IsNullOrWhiteSpace(query))
                {
                    var tokens = query.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    if (tokens.Length > 0)
                    {
                        var fallbackQuery = _context.Products
                            .Include(p => p.Brand)
                            .Include(p => p.Category)
                            .AsQueryable();

                        foreach (var token in tokens)
                        {
                            var tLower = token.ToLower();
                            fallbackQuery = fallbackQuery.Where(p =>
                                p.Name.ToLower().Contains(tLower) ||
                                (p.Brand != null && p.Brand.BrandName.ToLower().Contains(tLower)));
                        }

                        products = await fallbackQuery
                            .OrderByDescending(p => p.CreatedAt)
                            .Take(5)
                            .ToListAsync();
                    }
                }

                if (products.Count == 0)
                {
                    return "Mình chưa tìm thấy sản phẩm phù hợp trong database. Bạn thử cho mình tên sản phẩm / hãng / danh mục cụ thể hơn nhé. Ví dụ: \"giá của iPhone 15 Pro\" hoặc \"Samsung Galaxy S24\".";
                }
            }

            var sb = new StringBuilder();
            if (products.Count == 1)
            {
                var p = products[0];
                var brand = p.Brand?.BrandName ?? "N/A";
                var category = p.Category?.CategoryName ?? "N/A";
                sb.AppendLine($"**{p.Name}** ({brand} | {category})");
                sb.AppendLine($"Giá: **{p.Price:n0} đ**");
                if (p.StockQuantity.HasValue)
                {
                    sb.AppendLine($"Tồn kho: {p.StockQuantity} sản phẩm");
                }
            }
            else
            {
                sb.AppendLine("Mình gợi ý một số sản phẩm trong hệ thống:");
                foreach (var p in products.Take(5))
                {
                    var brand = p.Brand?.BrandName ?? "N/A";
                    var category = p.Category?.CategoryName ?? "N/A";
                    sb.AppendLine($"- #{p.ProductId}: {p.Name} | {brand} | {category} | Giá: {p.Price:n0} đ");
                }
                sb.AppendLine("Bạn muốn mình lọc theo mức giá / hãng / nhu cầu (gaming, học tập, văn phòng) không?");
            }
            return sb.ToString().Trim();
        }

        // Unknown intent -> no DB answer
        return null;
    }

    public async Task<string> BuildDatabaseContextAsync(string message, int? userId, int maxProducts = 5, int maxOrders = 3)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Dữ liệu nội bộ TechZone (trích từ database):");

        // a small slice of catalog for grounding
        var products = await _context.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .OrderByDescending(p => p.CreatedAt)
            .Take(maxProducts)
            .ToListAsync();

        if (products.Count > 0)
        {
            sb.AppendLine("- Danh sách sản phẩm mới nhất:");
            foreach (var p in products)
            {
                sb.AppendLine($"  - #{p.ProductId}: {p.Name} | Brand={(p.Brand?.BrandName ?? "N/A")} | Category={(p.Category?.CategoryName ?? "N/A")} | Price={p.Price:n0} VND");
            }
        }

        if (userId != null)
        {
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .Take(maxOrders)
                .ToListAsync();

            if (orders.Count > 0)
            {
                sb.AppendLine("- Đơn hàng gần đây của user:");
                foreach (var o in orders)
                {
                    sb.AppendLine($"  - Order #{o.OrderId}: Status={o.Status}, OrderDate={o.OrderDate:yyyy-MM-dd}, PaymentStatus={o.PaymentStatus ?? "N/A"}");
                }
            }
        }

        sb.AppendLine("Yêu cầu: Trả lời chỉ dựa trên dữ liệu nội bộ ở trên. Nếu thiếu dữ liệu, hãy nói rõ không có trong hệ thống.");
        return sb.ToString();
    }

    private static string ExtractProductQuery(string normalizedMessage)
    {
        // Remove common question words and extract product name
        var stopWords = new[] { "giá", "giá tiền", "giá của", "giá bao nhiêu", "tìm", "search", "sản phẩm", "mình hỏi", "bạn", "cho", "mình", "biết", "về", "của", "là", "gì", "?", ".", ",", ":" };
        
        var cleaned = normalizedMessage;
        foreach (var word in stopWords)
        {
            cleaned = cleaned.Replace(word, " ");
        }
        
        var tokens = cleaned.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (tokens.Length == 0) return string.Empty;

        // Take meaningful tokens (skip very short ones)
        var meaningfulTokens = tokens.Where(t => t.Length >= 2).ToList();
        if (meaningfulTokens.Count == 0) return string.Empty;

        // Return up to 5 tokens (enough for product names like "Samsung Galaxy S24 Ultra")
        return string.Join(' ', meaningfulTokens.Take(5));
    }

    private static string? TryExtractProductNameForPrice(string normalizedMessage)
    {
        // Patterns: "giá của X", "giá X", "X giá bao nhiêu", "X có giá bao nhiêu"
        var patterns = new[]
        {
            new { Pattern = "giá của ", After = true },
            new { Pattern = "giá ", After = true },
            new { Pattern = " giá bao nhiêu", After = false },
            new { Pattern = " có giá bao nhiêu", After = false },
            new { Pattern = " giá là bao nhiêu", After = false }
        };

        foreach (var p in patterns)
        {
            if (normalizedMessage.Contains(p.Pattern))
            {
                string? extracted = null;
                if (p.After)
                {
                    var idx = normalizedMessage.IndexOf(p.Pattern);
                    if (idx >= 0)
                    {
                        extracted = normalizedMessage.Substring(idx + p.Pattern.Length).Trim();
                    }
                }
                else
                {
                    var idx = normalizedMessage.IndexOf(p.Pattern);
                    if (idx >= 0)
                    {
                        extracted = normalizedMessage.Substring(0, idx).Trim();
                    }
                }

                if (!string.IsNullOrWhiteSpace(extracted))
                {
                    // Clean up: remove question marks, common words
                    extracted = extracted
                        .Replace("?", "")
                        .Replace(".", "")
                        .Replace(",", "")
                        .Replace("của", "")
                        .Replace("là", "")
                        .Trim();
                    
                    var tokens = extracted.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                        .Where(t => t.Length >= 2)
                        .Take(5);
                    
                    var result = string.Join(' ', tokens);
                    if (result.Length >= 3) return result;
                }
            }
        }

        return null;
    }

    private (string left, string right)? TryParseCompareQuery(string normalizedMessage)
    {
        // normalize separators
        var s = normalizedMessage
            .Replace(" vs ", " vs ")
            .Replace(" với ", " với ")
            .Replace(" và ", " và ")
            .Replace(" so sánh ", " so sánh ");

        // Common patterns:
        // - "so sánh A và B"
        // - "A vs B"
        // - "A với B" (users sometimes use this to compare)
        string? left = null;
        string? right = null;

        if (s.Contains(" vs "))
        {
            var parts = s.Split(" vs ", StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
            {
                left = parts[0];
                right = parts[1];
            }
        }
        else if (s.Contains(" so sánh "))
        {
            // take portion after "so sánh"
            var after = s.Split(" so sánh ", StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
            if (!string.IsNullOrWhiteSpace(after))
            {
                if (after.Contains(" và "))
                {
                    var parts = after.Split(" và ", StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length >= 2)
                    {
                        left = parts[0];
                        right = parts[1];
                    }
                }
                else if (after.Contains(" với "))
                {
                    var parts = after.Split(" với ", StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length >= 2)
                    {
                        left = parts[0];
                        right = parts[1];
                    }
                }
            }
        }
        else if (s.Contains(" và ") && (s.Contains("giá") || s.Contains("so sánh")))
        {
            // fallback: "giá ... A và B"
            var parts = s.Split(" và ", StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
            {
                left = parts[0];
                right = parts[1];
            }
        }

        left = CleanProductQuery(left);
        right = CleanProductQuery(right);

        if (string.IsNullOrWhiteSpace(left) || string.IsNullOrWhiteSpace(right)) return null;

        // prevent absurdly short tokens
        if (left.Length < 3 || right.Length < 3) return null;

        return (left, right);
    }

    private static string? CleanProductQuery(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;

        var cleaned = s;
        // remove common filler words
        foreach (var w in new[] { "giá", "giá tiền", "so sánh", "mình hỏi", "giúp", "giữa", "của", "là", "và", "vs", "với" })
        {
            cleaned = cleaned.Replace(w, " ");
        }

        cleaned = cleaned
            .Replace("?", " ")
            .Replace(".", " ")
            .Replace(",", " ")
            .Replace(":", " ")
            .Replace(";", " ")
            .Trim();

        // collapse spaces
        cleaned = string.Join(' ', cleaned.Split(' ', StringSplitOptions.RemoveEmptyEntries));
        return cleaned;
    }

    private async Task<TechZone.Server.Models.Domain.Product?> FindBestProductMatchAsync(string query)
    {
        // query is normalized (lowercase). We need to compare against original Name.
        // Use case-insensitive Contains by lowering both sides (EF Core translates for SQL Server).
        var q = query.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(q)) return null;

        // Try exact-ish: contains all tokens
        var tokens = q.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(t => t.Length >= 2) // Skip very short tokens
            .ToList();
        if (tokens.Count == 0) return null;

        var productsQuery = _context.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .AsQueryable();

        // Strategy 1: All tokens must be present in product name (AND logic)
        foreach (var t in tokens)
        {
            var token = t;
            productsQuery = productsQuery.Where(p => p.Name.ToLower().Contains(token));
        }

        var candidates = await productsQuery
            .OrderByDescending(p => p.CreatedAt)
            .Take(10) // Get more candidates for better matching
            .ToListAsync();

        if (candidates.Count == 0)
        {
            // Strategy 2: Fallback - any token matches (OR logic, but prioritize products with more matches)
            // Simple approach: query all products and filter in memory (for small datasets)
            var allProducts = await _context.Products
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .ToListAsync();

            // Score products: count how many tokens match
            var scored = allProducts.Select(p => new
            {
                Product = p,
                Score = tokens.Count(t => 
                    p.Name.ToLower().Contains(t) ||
                    (p.Brand != null && p.Brand.BrandName.ToLower().Contains(t)) ||
                    (p.Description != null && p.Description.ToLower().Contains(t))
                )
            })
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .ThenBy(x => x.Product.Name.Length) // Prefer shorter names (more specific)
            .ThenByDescending(x => x.Product.CreatedAt)
            .Select(x => x.Product)
            .Take(10)
            .ToList();

            if (scored.Count > 0)
            {
                return scored.First();
            }
        }
        else
        {
            // Score candidates: products with more matching tokens rank higher
            var scored = candidates.Select(p => new
            {
                Product = p,
                Score = tokens.Count(t => p.Name.ToLower().Contains(t))
            })
            .OrderByDescending(x => x.Score)
            .ThenBy(x => x.Product.Name.Length) // Prefer shorter names (more specific)
            .Select(x => x.Product)
            .ToList();

            if (scored.Count > 0)
            {
                return scored.First();
            }
        }

        return null;
    }

}


