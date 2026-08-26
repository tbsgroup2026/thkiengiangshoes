# DEPLOYMENT GUIDE – TBS KIÊN GIANG SHOES KAIZEN

## Deployment Pipeline

Deployment is executed directly from `D:\Work\KG-KAIZEN` to Cloudflare Worker `tbskiengiangshoeskaizen`.

```
D:\Work\KG-KAIZEN
       ↓
  npm run build  (Generates out/ static export)
       ↓
  npx wrangler deploy
       ↓
Cloudflare Worker (tbskiengiangshoeskaizen.workers.dev)
```

## Step-by-Step Instructions

1. **Navigate to project directory**:
   ```powershell
   cd D:\Work\KG-KAIZEN
   ```

2. **Verify Dependencies**:
   ```powershell
   npm install
   ```

3. **Compile and Export Production Build**:
   ```powershell
   npm run build
   ```

4. **Deploy to Cloudflare Worker**:
   ```powershell
   npx wrangler deploy
   ```

5. **Deployment Verification**:
   Access [https://tbskiengiangshoeskaizen.workers.dev](https://tbskiengiangshoeskaizen.workers.dev) to confirm status and functionality.
