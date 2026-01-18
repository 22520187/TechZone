namespace TechZone.Server.Models.DTO.GET
{
    public class DashboardStatisticsDTO
    {
        public int TotalUsers { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalSales { get; set; }
        public int TotalPending { get; set; }
        public decimal UserGrowthPercentage { get; set; }
        public decimal OrderGrowthPercentage { get; set; }
        public decimal SalesGrowthPercentage { get; set; }
        public decimal PendingGrowthPercentage { get; set; }
    }
}
