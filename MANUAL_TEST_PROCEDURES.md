# 🧪 MANUAL TEST PROCEDURES
## TBS II - Step-by-step Testing Guide

**Purpose**: Reproduce test results and verify system functionality  
**Target Audience**: QA Engineers, Developers  
**Duration**: ~4 hours for complete test cycle

---

## SETUP PREREQUISITES

### Required
- [ ] Python 3.9+ installed
- [ ] Node.js 18+ installed  
- [ ] Git repository cloned
- [ ] SQLite database file present
- [ ] All dependencies installed

### Installation Steps

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Install Node dependencies (if using TypeScript backend)
npm install --prefix backend

# Install web/frontend dependencies
npm install --prefix web

# Generate Prisma client
npm run prisma:generate --prefix backend

# Create .env file
cp .env.template .env
# Edit .env with database URL and secrets
```

---

## TEST ENVIRONMENT STARTUP

### Start Backend API

```bash
# Python FastAPI backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# Uvicorn running on http://127.0.0.1:8000
# Application startup complete
```

### Start Frontend Development Server

```bash
# In another terminal
cd web
npm run dev

# Expected output:
# ▲ Next.js 16.2.11
# - Local: http://localhost:3000
# - Environments: .env
```

### Verify Both Are Running
```bash
# Test API (in another terminal)
curl http://localhost:8000/docs

# Test Frontend
curl http://localhost:3000
```

---

## AUTHENTICATION TESTS

### Test 1: Login with Valid Credentials

**Procedure**:
1. Navigate to `http://localhost:3000/login`
2. Enter Employee Code: `admin-001`
3. Enter Password: `Tbs2@Admin2026!`
4. Click "Login"

**Expected Result**:
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ User menu shows "admin-001"
- ✅ JWT token stored in localStorage

**Verify**:
```bash
# Check browser console (F12 → Console)
# Should see no errors

# Check localStorage
localStorage.getItem('access_token')  # Should return token
localStorage.getItem('user')          # Should return user object
```

---

### Test 2: Login with Invalid Credentials

**Procedure**:
1. Navigate to `http://localhost:3000/login`
2. Enter Employee Code: `admin-001`
3. Enter Password: `WrongPassword`
4. Click "Login"

**Expected Result**:
- ✅ Error message: "Mã nhân viên hoặc mật khẩu không đúng"
- ✅ Not redirected
- ✅ Stay on login page

---

### Test 3: Account Lockout (5 Failed Attempts)

**Procedure**:
1. Login page
2. Enter `admin-001` with wrong password 5 times
3. On 6th attempt, enter correct or wrong password

**Expected Result**:
- ✅ After 5 failed attempts, account locked
- ✅ Error message: "Tài khoản tạm khóa. Vui lòng thử lại sau 900 giây."
- ✅ Cannot login for 15 minutes

**Verify**:
```bash
# Check backend logs
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emp_code":"admin-001","password":"wrong"}'

# Should return 423 LOCKED after 5 attempts
```

---

### Test 4: Protected Route Access

**Procedure**:
1. Open new browser tab
2. Directly navigate to `http://localhost:3000/admin`
3. Don't login (close all other tabs to clear session)

**Expected Result**:
- ✅ Redirected to `/login?redirect_uri=/admin`
- ✅ Message about login required

**Verify**:
```bash
# Check if path shows in URL
# Expected: http://localhost:3000/login?redirect_uri=%2Fadmin
```

---

### Test 5: Token Refresh Flow

**Procedure**:
1. Login successfully
2. Wait for access token to expire (or manually expire it)
3. Try to access protected API endpoint

**Expected Result**:
- ✅ Automatic token refresh happens
- ✅ User remains logged in
- ✅ New access token issued

**Verify**:
```bash
# In browser console
fetch('/api/v1/incidents', {
  headers: { 'Authorization': `Bearer ${localStorage.access_token}` }
}).then(r => r.json()).then(console.log)

# Should return incidents list
```

---

## INCIDENT MANAGEMENT TESTS

### Test 6: Create Incident

**Procedure**:
1. Login as `admin-001`
2. Navigate to Incidents module
3. Click "Report Incident"
4. Fill form:
   - Machine: Select any machine
   - Priority: "HIGH"
   - Description: "Test incident - bearing noise"
5. Click "Submit"

**Expected Result**:
- ✅ Incident created
- ✅ Get unique incident ID
- ✅ Redirected to incident detail
- ✅ Status shows "OPEN"

**Verify**:
```bash
# Check database
sqlite3 backend/prisma/tbs2_factory.db \
  "SELECT id, status, priority, description FROM Incident ORDER BY created_at DESC LIMIT 1;"

# Should show new incident with status OPEN
```

---

### Test 7: View Incident List

**Procedure**:
1. Login as `admin-001`
2. Navigate to Incidents page
3. View list of all incidents

**Expected Result**:
- ✅ List displays 5+ incidents
- ✅ Shows columns: ID, Machine, Priority, Status, Created
- ✅ Incidents sorted by date (newest first)

**Verify via API**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/incidents | jq '.[0:3]'

# Should return first 3 incidents with all fields
```

---

### Test 8: Get Incident Detail

**Procedure**:
1. From incident list, click on any incident
2. View detail page

**Expected Result**:
- ✅ Show full incident details
- ✅ Show machine information
- ✅ Show reporter name
- ✅ Show SLA deadline
- ✅ Show assignment status

**Verify**:
```bash
# Get specific incident
INCIDENT_ID=1
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/incidents/$INCIDENT_ID | jq '.'

# Should show all incident fields
```

---

## ROLE-BASED ACCESS TESTS

### Test 9: Admin Can Create User

**Procedure**:
1. Login as `admin-001` (admin role)
2. Go to Admin → Users
3. Click "Create User"
4. Fill form:
   - Employee Code: `test-emp-001`
   - Name: `Test Employee`
   - Department: Select any
   - Role: Select "WORKER"
5. Click "Create"

**Expected Result**:
- ✅ User created successfully
- ✅ See success message
- ✅ User appears in user list

**Alternative (API test)**:
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emp_code":"test-emp-001",
    "name":"Test Employee",
    "role_id":"worker",
    "department_id":"1"
  }'

# Should return 200 with user object
```

---

### Test 10: Worker Cannot Create User

**Procedure**:
1. Login as `wkr-001` (worker role)
2. Try to access Admin → Users
3. Or try API call

**Expected Result**:
- ✅ UI: Either no menu item or page shows "Unauthorized"
- ✅ API: Returns 403 Forbidden

**API Test**:
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Should return 403 Forbidden
```

---

### Test 11: Self-Approval Blocked

**Procedure**:
1. Create a document as WORKER
2. Try to approve it (if WORKER is approver)
3. System should block

**Expected Result**:
- ✅ Cannot approve own document
- ✅ Error message: "Cannot approve own documents"

**Verify in Code**:
```bash
# Check backend logic
grep -r "self.*approv" backend/

# Or via API
POST /api/v1/documents/{id}/approve
# Should return 403 if creator == approver
```

---

## DATA ISOLATION TEST

### Test 12: Department Data Scoping ⚠️ KNOWN ISSUE

**Procedure**:
1. Login as WORKER from Department A
2. Call API: `GET /api/v1/incidents`
3. Note incident IDs returned
4. Logout
5. Login as WORKER from Department B
6. Call API: `GET /api/v1/incidents`
7. Compare incident IDs

**Expected Result** (WHAT SHOULD HAPPEN):
- ✅ Department A worker sees only Dept A incidents
- ✅ Department B worker sees only Dept B incidents
- ✅ Incident IDs don't overlap between departments

**Current Result** (KNOWN BUG):
- ❌ Both see ALL incidents from all departments
- ❌ **This is a security issue**

**Verify**:
```bash
# Get incidents as worker from Dept A
WORKER_A_TOKEN=...
curl -H "Authorization: Bearer $WORKER_A_TOKEN" \
  http://localhost:8000/api/v1/incidents | jq '. | length'

# Get incidents as worker from Dept B  
WORKER_B_TOKEN=...
curl -H "Authorization: Bearer $WORKER_B_TOKEN" \
  http://localhost:8000/api/v1/incidents | jq '. | length'

# Both should return same count (BUG)
# They should return different counts after fix
```

---

## SLA CALCULATION TESTS

### Test 13: SLA Deadline Set Based on Priority

**Procedure**:
1. Create incident with Priority "CRITICAL"
2. View incident detail
3. Check SLA deadline

**Expected Result**:
- ✅ CRITICAL: SLA deadline ~2 hours from creation
- ✅ HIGH: SLA deadline ~8 hours from creation
- ✅ MEDIUM: SLA deadline ~24 hours from creation
- ✅ LOW: SLA deadline ~72 hours from creation

**Verify**:
```bash
# Create incident
curl -X POST http://localhost:8000/api/v1/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "machine_id":"1",
    "priority":"CRITICAL",
    "description":"Critical issue"
  }' | jq '.sla_deadline'

# Calculate hours difference
# (sla_deadline - created_at) should be 2 hours = 7200 seconds
```

---

### Test 14: SLA Violation Alerts ❌ NOT IMPLEMENTED

**Procedure**:
1. Create incident with CRITICAL priority
2. Wait (or manually set created_at to 3 hours ago in database)
3. Check for alert

**Expected Result**:
- ❌ **Currently: NO ALERT** (known issue)
- ✅ After fix: Should see alert/notification

**Current Status**:
```
No scheduled job checks SLA deadlines.
No WebSocket event broadcasts SLA violations.
No UI shows SLA alerts.
See CRITICAL_FIXES_REQUIRED.md for fix.
```

---

## API ENDPOINT TESTS

### Test 15: List All Machines

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/machines | jq '.[] | {id, name, status}'

# Expected output:
# {
#   "id": 1,
#   "name": "Assembly Line A",
#   "status": "RUNNING"
# }
# ...
```

---

### Test 16: Generate QR Code for Machine

```bash
MACHINE_ID=1
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/machines/$MACHINE_ID/qr | jq '.qr_code_base64'

# Expected output:
# "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
```

---

### Test 17: Update Machine Status

```bash
curl -X PUT http://localhost:8000/api/v1/machines/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"MAINTENANCE"}' | jq '.status'

# Expected output:
# "MAINTENANCE"
```

---

### Test 18: Create News Article

```bash
curl -X POST http://localhost:8000/api/v1/news \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"New Safety Protocol",
    "content":"All employees must...",
    "category":"HR"
  }' | jq '.id'

# Expected output:
# "news_123" or similar ID
```

---

## WEBSOCKET TESTS

### Test 19: Connect to WebSocket

**Procedure**:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Run WebSocket connection code

```javascript
// In browser console
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`);

ws.onopen = () => console.log('Connected');
ws.onerror = (err) => console.error('Error', err);
ws.onmessage = (event) => console.log('Message:', event.data);

// Expected output:
// "Connected"
```

---

### Test 20: Receive Real-time Notifications (NOT WORKING)

**Procedure**:
1. Connect to WebSocket (Test 19)
2. In another browser tab, create an incident
3. Check first tab for notification

**Current Status**:
- ❌ Backend broadcasts message
- ❌ Frontend doesn't display notification
- See CRITICAL_FIXES_REQUIRED.md for fix

---

## FRONTEND FUNCTIONALITY TESTS

### Test 21: Dashboard Loads

**Procedure**:
1. Login as admin
2. Navigate to `/`
3. Check dashboard

**Expected Result**:
- ✅ Dashboard loads without errors
- ✅ Shows incident count
- ✅ Shows machine status summary
- ✅ Shows recent news

**Check Browser Console**:
```javascript
// In browser console (F12 → Console)
// Should show no red errors
// May show warnings but no critical issues

// Check network tab (F12 → Network)
// All API calls should return 200 OK
```

---

### Test 22: Incident Form Validation

**Procedure**:
1. Go to create incident
2. Try to submit without filling Machine
3. Try to submit with machine but no description

**Expected Result**:
- ✅ Form shows validation errors
- ✅ Prevents submission without required fields
- ✅ Error messages clear and helpful

---

## PERFORMANCE TESTS

### Test 23: Page Load Time

**Procedure**:
1. Open DevTools (F12)
2. Go to Performance tab
3. Click record
4. Navigate to `/incidents`
5. Stop recording
6. Check "Time to Interactive" (TTI)

**Expected Result**:
- ✅ TTI < 3 seconds (good)
- ⚠️ TTI 3-5 seconds (acceptable)
- ❌ TTI > 5 seconds (slow)

---

### Test 24: API Response Time

**Procedure**:
```bash
time curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/incidents

# Look for "real" time
```

**Expected Result**:
- ✅ < 500ms (excellent)
- ⚠️ 500ms-1s (acceptable)
- ❌ > 1s (slow)

---

## DATABASE TESTS

### Test 25: Verify Database Integrity

```bash
# Check incidents table
sqlite3 backend/prisma/tbs2_factory.db \
  ".tables"

# Should show:
# Document        Incident        JobApplication  
# Line           Machine         News
# ...

# Check incident count
sqlite3 backend/prisma/tbs2_factory.db \
  "SELECT COUNT(*) FROM Incident;"

# Should return number > 0
```

---

### Test 26: Check Foreign Keys

```bash
# Get incident with machine info
sqlite3 backend/prisma/tbs2_factory.db \
  "SELECT i.id, i.description, m.name FROM Incident i JOIN Machine m ON i.machine_id = m.id LIMIT 1;"

# Should return incident with machine name
```

---

## SECURITY TESTS

### Test 27: SQL Injection Attempt

**Procedure**:
```bash
# Try to inject SQL
curl -X POST http://localhost:8000/api/v1/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "machine_id":"1",
    "description":"Test; DROP TABLE Incident; --",
    "priority":"HIGH"
  }'
```

**Expected Result**:
- ✅ Incident created normally
- ✅ Malicious SQL sanitized/escaped
- ✅ No error from database
- ✅ Incident saved with safe description

---

### Test 28: XSS Injection Attempt

**Procedure**:
```bash
# Try to inject JavaScript
curl -X POST http://localhost:8000/api/v1/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "machine_id":"1",
    "description":"<script>alert(\"XSS\")</script>",
    "priority":"HIGH"
  }'

# Then view the incident in UI
```

**Expected Result**:
- ✅ Script tag displayed as text (not executed)
- ✅ No JavaScript alert appears
- ✅ HTML properly escaped

---

## TEST DATA UTILITIES

### Create Demo Data

```bash
# Run seed script (if available)
cd backend
python -c "from utils.seed import seed_database; seed_database()"

# Or manually create incident
curl -X POST http://localhost:8000/api/v1/incidents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "machine_id":"1",
    "priority":"CRITICAL",
    "description":"Demo incident for testing"
  }'
```

---

### Export Test Results

```bash
# Test API response time (many requests)
for i in {1..10}; do
  curl -s -w "Time: %{time_total}s\n" \
    -o /dev/null \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:8000/api/v1/incidents
done

# Average the times
```

---

## TROUBLESHOOTING

### API Not Responding

```bash
# Check if server running
curl http://localhost:8000/docs

# If no response, start server
cd backend
uvicorn main:app --reload
```

### Frontend Not Loading

```bash
# Check if dev server running
curl http://localhost:3000

# If no response, start frontend
cd web
npm run dev
```

### Authentication Token Invalid

```bash
# Check token in localStorage
# In browser console:
localStorage.getItem('access_token')

# If empty, login again
# If present, verify it's valid
```

### Database File Missing

```bash
# Create database
cd backend
python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"

# Or restore backup
# cp Backup/tbs2_factory.db backend/prisma/tbs2_factory.db
```

---

## TEST REPORT TEMPLATE

Use this to document test results:

```
TEST DATE: __/__/____
TESTER: ________________
ENVIRONMENT: Windows / Mac / Linux

TEST CASE: ____________
Procedure: ____________
Expected: ____________
Actual: ____________
Status: ✅ PASS / ⚠️ PARTIAL / ❌ FAIL

Issues Found:
- Issue 1
- Issue 2

Notes:
```

---

## AUTOMATED TEST SCRIPTS

### Run Backend Tests (When Available)

```bash
cd backend
pip install pytest
pytest tests/ -v
```

### Run Frontend Tests (When Available)

```bash
cd web
npm install --save-dev jest @types/jest
npm test
```

---

## QUICK TEST CHECKLIST

- [ ] Backend API starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can login with demo credentials
- [ ] Can view incidents
- [ ] Can create incident
- [ ] Can see user dashboard
- [ ] No console errors (F12)
- [ ] API responses within 1 second
- [ ] All navigation links work
- [ ] Logout works correctly

---

## NEXT STEPS

After completing these manual tests:
1. Document any failures
2. Compare with COMPREHENSIVE_SYSTEM_TEST_REPORT.md
3. File GitHub issues for any new problems
4. Assign fixes based on CRITICAL_FIXES_REQUIRED.md
5. Schedule fix implementation

---

**Manual Testing Guide Complete**

For automated testing, see project test files:
- `web/src/__tests__/*.test.ts`
- `backend/tests/` (when available)

For full test analysis, see COMPREHENSIVE_SYSTEM_TEST_REPORT.md
