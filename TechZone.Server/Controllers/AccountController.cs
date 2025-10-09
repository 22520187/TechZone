using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Repositories;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.RequestModels;
using TechZone.Server.Models.DTO;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class AccountController(IUserRepository userRepository, IMemoryCache cache, ITokenService tokenService) : ControllerBase
    {
        private readonly IUserRepository _userRepository = userRepository;
        private readonly ITokenService _tokenService = tokenService;
        // private readonly IMapper _mapper = mapper;
        private readonly IMemoryCache _memoryCache = cache;

        [HttpPost("register")]

        public async Task<IActionResult> Register([FromBody] RegisterRequests request)
        {
            // Kiểm tra email đã tồn tại chưa
            bool isEmailExits = await _userRepository.IsEmailExistsAsync(request.Email);
            if (isEmailExits)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Email already exists."
                });
            }

            var hashPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var user = new User
            {
                Email = request.Email,
                PasswordHash = hashPassword
            };

            var result = await userRepository.RegisterUserAsync(user);
            return Ok(result);
        }

        [HttpPost("login")]

        public async Task<IActionResult> Login([FromBody] LoginRequests request)
        {
            var user = await userRepository.AuthenticateAsync(request.Email, request.Password);
            if (user != null)
            {
                var role = await userRepository.GetUserRole(user.UserId);
                if (role != null)
                {
                    // create token
                    var jwttoken = tokenService.CreateJWTToken(user, role.ToList());
                    var loginResponse = new LoginRespondDto
                    {
                        UserId = user.UserId,
                        JwtToken = jwttoken,
                    };
                    return Ok(loginResponse);
                }
            }
            return BadRequest("Username or password incorrect");
        }
        
    }
}