/**
 * Chuyển đổi số tiền VNĐ sang chữ tiếng Việt chuẩn.
 * Ví dụ: 6250000 -> "Sáu triệu hai trăm năm mươi nghìn đồng"
 */
export function convertNumberToWords(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) {
    return "Không đồng";
  }

  const num = Math.floor(Math.abs(amount));
  if (num === 0) return "Không đồng";

  const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

  function readGroup(n: number, hasHigherGroup: boolean): string {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;

    let res = "";

    if (h > 0 || hasHigherGroup) {
      res += digits[h] + " trăm ";
    }

    if (t > 1) {
      res += digits[t] + " mươi ";
      if (u === 1) res += "mốt";
      else if (u === 5) res += "lăm";
      else if (u > 0) res += digits[u];
    } else if (t === 1) {
      res += "mười ";
      if (u === 5) res += "lăm";
      else if (u > 0) res += digits[u];
    } else if (t === 0) {
      if (u > 0) {
        if (h > 0 || hasHigherGroup) res += "lẻ ";
        res += digits[u];
      }
    }

    return res.trim();
  }

  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
  let temp = num;
  let unitIdx = 0;
  const parts: string[] = [];

  while (temp > 0) {
    const triple = temp % 1000;
    temp = Math.floor(temp / 1000);
    const hasHigher = temp > 0;

    if (triple > 0) {
      const read = readGroup(triple, hasHigher);
      const unitName = units[unitIdx] || "";
      parts.unshift(`${read} ${unitName}`.trim());
    } else if (hasHigher && unitIdx === 3) {
      parts.unshift("tỷ");
    }
    unitIdx++;
  }

  let result = parts.join(" ").trim();
  if (!result) return "Không đồng";

  result = result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
  return result.replace(/\s+/g, " ");
}
