using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface ITokenService
    {
         string CreateJWTToken(User user, List<string> roles);
    }
}