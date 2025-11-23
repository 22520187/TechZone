using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface ICategoryRepository : ITechZoneRepository<Category>
    {
        Task<List<Category>> AdminGetAllCategoryAsync();
        Task<Category> AddCategoryAsync(Category category);
        Task<Category> DeleteCategoryAsync(int categoryId);
        Task<Category?> UpdateCategoryAsync(int categoryId, Category updatedCategory);
    }
}