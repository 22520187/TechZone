using AutoMapper;
using System;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.ADD;

// using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.DTO.UPDATE;

namespace TechZone.Server.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<User, UserInfoDTO>()
                .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(src => src.AvatarImageUrl))
                .ReverseMap();
            CreateMap<Order, OrderDTO>().ReverseMap();
            CreateMap<OrderDetail, OrderDetailDTO>()
                .ForMember(dest => dest.ProductColor, opt => opt.MapFrom(src => src.ProductColor));
            
            // Map ProductColor to OrderDetailProductColorDTO (similar to CartItemDTO mapping)
            CreateMap<ProductColor, OrderDetailProductColorDTO>()
                .ForMember(dest => dest.ProductColorId, opt => opt.MapFrom(src => src.ProductColorId))
                .ForMember(dest => dest.Color, opt => opt.MapFrom(src => src.Color))
                .ForMember(dest => dest.ColorCode, opt => opt.MapFrom(src => src.ColorCode))
                .ForMember(dest => dest.StockQuantity, opt => opt.MapFrom(src => src.StockQuantity))
                .ForMember(dest => dest.Product, opt => opt.MapFrom(src => src.Product));
            CreateMap<Promotion, PromotionDTO>().ReverseMap();
            CreateMap<Review, ReviewDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : "Anonymous"))
                .ForMember(dest => dest.UserAvatar, opt => opt.MapFrom(src => src.User != null ? src.User.AvatarImageUrl : null))
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId))
                .ReverseMap();

            CreateMap<Product, CustomerProductDTO>()
                .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count))
                .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Reviews.Any() ? src.Reviews.Average(r => r.Rating ?? 0) : 0))
                .ForMember(dest => dest.ProductImages, opt => opt.MapFrom(src => src.ProductImages))
                .ForMember(dest => dest.Promotions, opt => opt.MapFrom(src => src.Promotions))
                .ForMember(dest => dest.Brand, opt => opt.MapFrom(src => src.Brand))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category))
                .ReverseMap();
            CreateMap<Product, CustomerDetailProductDTO>()
                .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count))
                .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Reviews.Any() ? src.Reviews.Average(r => r.Rating ?? 0) : 0))
                .ReverseMap();
            CreateMap<Product, AdminProductDTO>()
              .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count))
              .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Reviews.Any() ? src.Reviews.Average(r => r.Rating ?? 0) : 0))
              .ForMember(dest => dest.ProductColors, opt => opt.MapFrom(src => src.ProductColors))
              .ReverseMap();
            CreateMap<Product, AdminDetailProductDTO>()
              .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count))
              .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Reviews.Any() ? src.Reviews.Average(r => r.Rating ?? 0) : 0))
              .ReverseMap();
            CreateMap<AdminAddProductDTO, Product>()
        .ForMember(dest => dest.StockQuantity, opt => opt.MapFrom(src => src.Colors.Sum(c => c.StockQuantity))) // Map total stock quantity
        .ForMember(dest => dest.ProductImages, opt => opt.Ignore()) // Ignore ProductImages
        .ForMember(dest => dest.ProductColors, opt => opt.Ignore()) // Ignore ProductColors
        .ReverseMap();
            CreateMap<AdminUpdateProductDTO, Product>()
                   .ForMember(dest => dest.StockQuantity, opt => opt.MapFrom(src => src.Colors.Sum(c => c.StockQuantity))) // Map total stock quantity
                   .ForMember(dest => dest.ProductImages, opt => opt.MapFrom(src => src.ImageUrls.Select(url => new ProductImage { ImageUrl = url })))
                   .ForMember(dest => dest.ProductColors, opt => opt.MapFrom(src => src.Colors.Select(color => new ProductColor
                   {
                       Color = color.Color,
                       ColorCode = color.ColorCode,
                       StockQuantity = color.StockQuantity
                   })))
                   .ReverseMap();
            CreateMap<ProductImage, ProductImageDTO>().ReverseMap();
            CreateMap<ProductColor, ProductColorDTO>().ReverseMap();


            CreateMap<Category, CategoryDTO>().ReverseMap();
            CreateMap<Category, AdminCategoryDTO>().ReverseMap();
            CreateMap<Category, AdminAddCategoryDTO>().ReverseMap();
            CreateMap<Category, AdminUpdateCategoryDTO>().ReverseMap();

            CreateMap<Brand, BrandDTO>().ReverseMap();
            CreateMap<Brand, AdminBrandDTO>().ReverseMap();
            CreateMap<Brand, AdminAddBrandDTO>().ReverseMap();
            CreateMap<Brand, AdminUpdateBrandDTO>().ReverseMap();

            CreateMap<ChatHistory, ChatHistoryDTO>().ReverseMap();
            CreateMap<AddChatMessageDTO, ChatHistory>().ReverseMap();

            // Cart mappings
            CreateMap<AddItemToCartRequestDTO, CartDetail>()
                .ForMember(dest => dest.CartId, opt => opt.MapFrom(src => src.CartId))
                .ForMember(dest => dest.ProductColorId, opt => opt.MapFrom(src => src.ProductColorId))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.CartDetailId, opt => opt.Ignore())
                .ForMember(dest => dest.Cart, opt => opt.Ignore())
                .ForMember(dest => dest.ProductColor, opt => opt.Ignore());
            
            CreateMap<UpdateCartItemRequestDTO, CartDetail>()
                .ForMember(dest => dest.CartDetailId, opt => opt.MapFrom(src => src.CartDetailId))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.CartId, opt => opt.Ignore())
                .ForMember(dest => dest.ProductColorId, opt => opt.Ignore())
                .ForMember(dest => dest.Cart, opt => opt.Ignore())
                .ForMember(dest => dest.ProductColor, opt => opt.Ignore());

            CreateMap<CartDetail, CartItemDetailDTO>()
                .ForMember(dest => dest.CartDetailId, opt => opt.MapFrom(src => src.CartDetailId))
                .ForMember(dest => dest.CartId, opt => opt.MapFrom(src => src.CartId ?? 0))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.ProductColor, opt => opt.MapFrom(src => src.ProductColor));
            
            CreateMap<ProductColor, CartItemDTO>()
                .ForMember(dest => dest.ProductColorId, opt => opt.MapFrom(src => src.ProductColorId))
                .ForMember(dest => dest.Color, opt => opt.MapFrom(src => src.Color))
                .ForMember(dest => dest.ColorCode, opt => opt.MapFrom(src => src.ColorCode))
                .ForMember(dest => dest.StockQuantity, opt => opt.MapFrom(src => src.StockQuantity))
                .ForMember(dest => dest.Product, opt => opt.MapFrom(src => src.Product));

            // Order mappings
            CreateMap<CreateOrderRequestDTO, Order>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.PaymentMethod))
                .ForMember(dest => dest.PromotionId, opt => opt.MapFrom(src => src.PromotionId))
                .ForMember(dest => dest.ShippingAddress, opt => opt.MapFrom(src => src.ShippingAddress))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Phone))
                .ForMember(dest => dest.OrderId, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDate, opt => opt.MapFrom(src => DateTime.Now))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Pending"))
                .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => 
                    src.PaymentMethod == "cod" ? "COD" : "Unpaid"))
                .ForMember(dest => dest.TotalAmount, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDetails, opt => opt.Ignore())
                .ForMember(dest => dest.Promotion, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore());

            // Promotion mappings

            CreateMap<Promotion, AdminPromotionDTO>()
                .ForMember(dest => dest.ProductIDs, 
                    opt => opt.MapFrom(src => src.Products.Select(p => p.ProductId.ToString()).ToList()))
                .ReverseMap();

            CreateMap<AdminAddPromotionDTO, Promotion>()
                .ForMember(dest => dest.Products, opt => opt.Ignore())
                .ForMember(dest => dest.Orders, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<AdminUpdatePromotionDTO, Promotion>()
                .ForMember(dest => dest.Products, opt => opt.Ignore())
                .ForMember(dest => dest.Orders, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<Promotion, CustomerPromotionDTO>().ReverseMap();
            
            CreateMap<Promotion, CustomerProductPromotionDTO>().ReverseMap();

            //Profile mappings:

            CreateMap<User, AdminUserDTO>().ReverseMap();


            CreateMap<AdminAddUserDTO, User>()
                .ForMember(dest => dest.PasswordHash, 
                    opt => opt.MapFrom(src => BCrypt.Net.BCrypt.HashPassword(src.Password)))
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ReverseMap();

            CreateMap<AdminUpdateUserDTO, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Email, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<User, AdminStaffDTO>().ReverseMap();

            CreateMap<AdminAddStaffDTO, User>()
                .ForMember(dest => dest.PasswordHash, 
                    opt => opt.MapFrom(src => src.Password))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => "staff"))
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ReverseMap();

            CreateMap<AdminUpdateStaffDTO, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Email, opt => opt.Ignore())
                .ForMember(dest => dest.Role, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ReverseMap();
                
            // Warranty mappings
            CreateMap<Warranty, WarrantyDTO>()
                .ForMember(dest => dest.Product, opt => opt.MapFrom(src => src.Product))
                .ForMember(dest => dest.OrderDetail, opt => opt.MapFrom(src => src.OrderDetail))
                .ForMember(dest => dest.WarrantyClaims, opt => opt.MapFrom(src => src.WarrantyClaims))
                .ReverseMap();

            // WarrantyClaim mappings
            CreateMap<WarrantyClaim, WarrantyClaimDTO>()
                .ForMember(dest => dest.Warranty, opt => opt.MapFrom(src => src.Warranty))
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ReverseMap();

        }
    }
}