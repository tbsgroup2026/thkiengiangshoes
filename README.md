# TBS KIÊN GIANG SHOES – KAIZEN PORTAL

Cổng thông tin và quản lý đề xuất cải tiến Kaizen dành riêng cho nhóm nhà máy **TBS Kiên Giang Shoes** (Kiên Giang 1, Kiên Giang 2, Kiên Giang 3).

## System Information

- **Local Path**: `D:\Work\KG-KAIZEN`
- **GitHub Repository**: [tbsgroup2026/tbskiengiangshoes](https://github.com/tbsgroup2026/tbskiengiangshoes)
- **Cloudflare Worker Deployment**: [tbskiengiangshoeskaizen.workers.dev](https://tbskiengiangshoeskaizen.workers.dev)
- **Central Platform**: [vpchuoiskechers.tbsgroup2026.workers.dev/work/kaizen](https://vpchuoiskechers.tbsgroup2026.workers.dev/work/kaizen)
- **Database**: Cloudflare D1 (`ae3a7efd-ff5d-45c2-8c49-78d1518e3aa1`) - Shared Data Source of Truth

## Features

1. **Focused Factory Scope**: Exclusively displays and submits Kaizen proposals for **Kiên Giang 1**, **Kiên Giang 2**, and **Kiên Giang 3**.
2. **Cascading Organizational Filter**: 5-level cascading filtering (Nhà máy → Xưởng → Line → Chuyền → Tổ).
3. **Public QR Registration**: Public-facing submission forms with MSNV auto-fill lookup.
4. **Independent Build & Deploy**: Next.js static export + Cloudflare Worker asset handler.

## Local Development & Build Commands

```powershell
# Navigate to local project root
cd D:\Work\KG-KAIZEN

# Install dependencies
npm install

# Run local development server
npm run dev

# Build project for Cloudflare export
npm run build

# Deploy to Cloudflare Worker
npm run deploy
```
