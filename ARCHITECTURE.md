# ARCHITECTURE – TBS KIÊN GIANG SHOES KAIZEN PORTAL

## System Overview

The **TBS Kiên Giang Shoes Kaizen Portal** is built as an independent, lightweight web platform dedicated to managing Kaizen proposals and Continuous Improvement (CI) workflows for Kiên Giang factories (KG 1, KG 2, KG 3).

```
                      +---------------------------------------+
                      |   TBS Kiên Giang Shoes Kaizen Portal   |
                      | (tbskiengiangshoeskaizen.workers.dev) |
                      +-------------------+-------------------+
                                          |
                                          v
+-----------------------+     +-----------------------+     +-----------------------+
|  Frontend UI (React)  | --> | Cloudflare Worker Api | --> |   Cloudflare D1 DB    |
|   (Static Export)     |     |   (public/_worker.js) |     | (vpchuoiskechers D1)  |
+-----------------------+     +-----------------------+     +-----------------------+
                                                                        ^
                                                                        |
                                                            Shared Data Source of Truth
                                                                        |
                                                            +-----------+-----------+
                                                            |  Central Main Platform|
                                                            |  (vpchuoiskechers)    |
                                                            +-----------------------+
```

## Architectural Components

1. **Frontend Layer**:
   - Next.js 16 + React 19 + TypeScript.
   - Tailored Tailwind CSS & Lucide/Tabler Icons.
   - Built via `next build` (`output: 'export'`), producing static assets in `out/`.

2. **Edge Execution Layer (Cloudflare Worker)**:
   - Worker script `public/_worker.js` handles HTTP requests at the edge.
   - Acts as both API router and static asset server via `env.ASSETS.fetch(request)`.

3. **Data Storage & Sync**:
   - Bound to shared Cloudflare D1 Database `ae3a7efd-ff5d-45c2-8c49-78d1518e3aa1`.
   - Ensures real-time data sync with central system `vpchuoiskechers.tbsgroup2026.workers.dev`.

4. **Data Isolation & Scope**:
   - Factory filter automatically applied to limit records strictly to **Kiên Giang 1**, **Kiên Giang 2**, and **Kiên Giang 3**.
