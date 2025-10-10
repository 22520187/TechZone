using AutoMapper;
using TechZone.Server.Models.Domain;
// using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.DTO.UPDATE;

namespace TechZone.Server.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<User, UserInfoDTO>().ReverseMap();
        }
    }
}