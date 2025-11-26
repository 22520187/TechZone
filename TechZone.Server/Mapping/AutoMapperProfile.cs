using AutoMapper;
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
            CreateMap<OrderDetail, OrderDetailDTO>().ReverseMap();
            CreateMap<Promotion, PromotionDTO>().ReverseMap();
            CreateMap<Review, ReviewDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : "Anonymous"))
                .ForMember(dest => dest.UserAvatar, opt => opt.MapFrom(src => src.User != null ? src.User.AvatarImageUrl : null))
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId))
                .ReverseMap();

            CreateMap<Product, CustomerProductDTO>()
           .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count))
           .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Reviews.Any() ? src.Reviews.Average(r => r.Rating ?? 0) : 0))
           .ReverseMap();
            CreateMap<Product, CustomerDetailProductDTO>()
                .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count))
                .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Reviews.Any() ? src.Reviews.Average(r => r.Rating ?? 0) : 0))
                .ReverseMap();
            CreateMap<Product, AdminProductDTO>()
              .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count))
              .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.Reviews.Any() ? src.Reviews.Average(r => r.Rating ?? 0) : 0))
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

        }
    }
}