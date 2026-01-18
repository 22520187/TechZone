namespace TechZone.Server.Models.DTO.GET
{
    public class SalesChartDataDTO
    {
        public List<SalesDataPointDTO> SalesData { get; set; } = new List<SalesDataPointDTO>();
    }

    public class SalesDataPointDTO
    {
        public string Date { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int OrderCount { get; set; }
    }
}
