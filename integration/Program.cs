using System;
using System.Net.Http;
using System.Threading.Tasks;
using TBS2.Integration.Services;

namespace TBS2.Integration
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("======================================================================");
            Console.WriteLine("       TBS II FACTORY - INTEGRATION SERVICE (.NET 8)");
            Console.WriteLine("======================================================================");

            using var httpClient = new HttpClient();
            var erpService = new ErpIntegrationService();
            var plcService = new PlcReaderService(httpClient);
            var reportService = new ReportGenerator();

            // 1. Run ERP Sync
            await erpService.SyncTimekeeperDataAsync();
            await erpService.SyncSparePartsInventoryAsync();

            // 2. Generate Weekly Performance Report
            await reportService.GenerateWeeklyReportAsync("./Reports");

            // 3. Start PLC Telemetry Listener Loop
            await plcService.StartMonitoringAsync();
        }
    }
}
