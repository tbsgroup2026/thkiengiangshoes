using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace TBS2.Integration.Services
{
    public class PlcReaderService
    {
        private readonly HttpClient _httpClient;
        private readonly Random _random = new Random();
        private readonly string _plcApiKey = Environment.GetEnvironmentVariable("PLC_API_KEY") ?? "DEFAULT_PLC_KEY";

        public PlcReaderService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            // Configure secure API key header for telemetry authentication
            if (!_httpClient.DefaultRequestHeaders.Contains("X-API-KEY"))
            {
                _httpClient.DefaultRequestHeaders.Add("X-API-KEY", _plcApiKey);
            }
        }

        public async Task StartMonitoringAsync()
        {
            Console.WriteLine("[PLC READER] Service started monitoring factory machines with API Key security...");

            while (true)
            {
                int machineIndex = _random.Next(1, 7);
                string machineCode = $"TBS2-MCH-00{machineIndex}";
                double temperature = 45.0 + _random.NextDouble() * 40.0;
                double vibrationHz = 10.0 + _random.NextDouble() * 50.0;

                if (temperature > 80.0 || vibrationHz > 55.0)
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"[PLC WARNING] {machineCode} anomaly detected: Temp={temperature:F1}°C, Vibration={vibrationHz:F1}Hz");
                    Console.ResetColor();

                    try
                    {
                        var response = await _httpClient.PutAsync($"http://localhost:8000/api/v1/machines/{machineIndex}/status?status_str=WARNING", null);
                        if (response.IsSuccessStatusCode)
                        {
                            Console.WriteLine($"[PLC PUSH AUTH] Machine {machineCode} status set to WARNING in backend securely.");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[PLC API ERROR] Connection failed: {ex.Message}");
                    }
                }

                await Task.Delay(10000);
            }
        }
    }
}
