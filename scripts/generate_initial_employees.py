import json

with open("mapping_370_employees.json", "r", encoding="utf-8") as f:
    data = json.load(f)

mapped = []
for idx, item in enumerate(data):
    msnv = item.get("msnv", "")
    name = item.get("name", "")
    dept = item.get("phong_ban_new") or "NHÂN SỰ-HC"
    role = "SUPER_ADMIN" if msnv in ["202608001", "202608002"] else "CBCNV"
    
    mapped.append({
        "id": f"emp_370_{idx+1}",
        "empCode": msnv,
        "name": name,
        "email": f"{msnv.lower()}@tbsgroup.vn" if msnv else "nv@tbsgroup.vn",
        "phone": "0988 000 000",
        "title": "Cán Bộ Công Nhân Viên",
        "department": dept,
        "roleCode": role,
        "status": "ACTIVE",
        "ngayVao": "2026-08-01",
        "vtcvHienTai": "NV",
        "phongBanHienTai": dept,
        "vtcvSap": "NV",
        "vtcvSapXep": "NV",
        "phongBanSapXep": dept,
        "boPhoanMoi": dept,
        "phongBanMoi": dept,
        "ghiChu": ""
    })

ts_content = """export interface EmployeeAccount {
  id: string;
  empCode: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  roleCode: string;
  status: "ACTIVE" | "LOCKED";
  ngayVao?: string;
  vtcvHienTai?: string;
  phongBanHienTai?: string;
  vtcvSap?: string;
  vtcvSapXep?: string;
  phongBanSapXep?: string;
  boPhoanMoi?: string;
  phongBanMoi?: string;
  ghiChu?: string;
}

export const INITIAL_370_EMPLOYEES: EmployeeAccount[] = """ + json.dumps(mapped, ensure_ascii=False, indent=2) + ";\n"

with open("web/src/lib/initialEmployees.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"✅ Generated web/src/lib/initialEmployees.ts with {len(mapped)} employee accounts.")
