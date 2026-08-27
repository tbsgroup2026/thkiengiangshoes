using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace TBS2.Integration.Services
{
    public class ReportGenerator
    {
        public async Task GenerateWeeklyReportAsync(string outputDir)
        {
            Directory.CreateDirectory(outputDir);
            string filePath = Path.Combine(outputDir, $"BaoCao_BaoTri_TBS2_{DateTime.Now:yyyyMMdd}.csv");

            var sb = new StringBuilder();
            sb.AppendLine("Mã Sự Cố,Mã Máy,Khu Vực,Mức Ưu Tiên,Downtime (Phút),MTTR,Nguyên Nhân Lỗi,Trạng Thái");
            sb.AppendLine("INC-20260721-0001,TBS2-MCH-003,Xưởng May 1,CRITICAL,45,35,Chập bo mạch nguồn,DANG_SUA");
            sb.AppendLine("INC-20260721-0002,TBS2-MCH-004,Xưởng Gò 2,HIGH,35,30,Rò rỉ thủy lực,DANG_SUA");
            sb.AppendLine("INC-20260721-0003,TBS2-MCH-002,Xưởng May 1,MEDIUM,40,25,Gãy kim may,HOAN_THANH");

            await File.WriteAllTextAsync(filePath, sb.ToString(), Encoding.UTF8);
            Console.WriteLine($"[REPORT GENERATOR] Exported executive maintenance report to: {filePath}");
        }
    }
}
