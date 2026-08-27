# 🔴 CRITICAL FIXES REQUIRED
## TBS II - Priority Bug Fixes & Implementation Gaps

**Generated**: August 22, 2026  
**Total Critical Issues**: 6  
**Total High Priority Issues**: 8  
**Estimated Fix Time**: 2-3 weeks

---

## 🔴 CRITICAL ISSUES (BLOCK PRODUCTION)

### CRITICAL #1: Data Isolation - Users Seeing Cross-Department Data

**Severity**: 🔴 **CRITICAL - SECURITY VIOLATION**  
**Status**: ❌ **BROKEN**  
**Impact**: All roles can see data from other departments

#### Problem Description
Users can view incidents, documents, and employees from departments they don't belong to. This is a major security/privacy violation.

#### Root Cause
Backend queries don't filter by `user.department_id`. Example:
```python
@router.get("")
def get_incidents(...):
    query = db.query(Incident)  # ❌ No department filter!
    return query.all()
```

#### Evidence
- **Test**: Scenario 1 shows MANAGER seeing all incidents
- **Impact**: WORKER can see maintenance tickets in other branches
- **SQL**: Query missing `WHERE incident.department_id = user.department_id`

#### Affected Endpoints
| Endpoint | Module | Status |
|----------|--------|--------|
| GET /api/v1/incidents | Incidents | ❌ BROKEN |
| GET /api/v1/documents | Documents | ❌ BROKEN |
| GET /api/v1/users | Users | ❌ BROKEN |
| GET /api/v1/machines | Machines | ⚠️ MIXED* |
| GET /api/v1/orders | Orders | ❌ BROKEN |
| GET /api/v1/news | News | ✅ OK (company-wide) |
| GET /api/v1/jobs | Jobs | ⚠️ MIXED* |

*Mixed: May show department jobs only, need verification

#### Fix Required

**File**: `backend/routers/incidents.py`

```python
# BEFORE (❌ BROKEN)
@router.get("")
def get_incidents(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Incident)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    incidents = query.all()
    return incidents

# AFTER (✅ FIXED)
@router.get("")
def get_incidents(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Incident)
    
    # Add department filtering for non-admin
    if current_user.role != RoleEnum.ADMIN:
        query = query.filter(Incident.department_id == current_user.department_id)
    
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    
    incidents = query.all()
    return incidents
```

Apply this pattern to:
- `backend/routers/incidents.py` - All queries
- `backend/routers/documents.py` - All queries  
- `backend/routers/machines.py` - Filter by branch/zone
- `backend/routers/orders.py` - Filter by department
- `backend/src/routes/departments.ts` - Filter by user's department

#### Verification
```bash
# Test as WORKER in Dept A
curl -H "Authorization: Bearer $WORKER_TOKEN" \
  http://localhost:8000/api/v1/incidents

# Should only return incidents from Dept A
# Currently returns ALL incidents ❌
```

#### Timeline
- **Estimated Fix Time**: 4 hours
- **Testing Time**: 2 hours
- **Priority**: **DO THIS FIRST - blocks everything else**

---

### CRITICAL #2: No SLA Violation Alert System

**Severity**: 🔴 **CRITICAL - MAINTENANCE BLOCKER**  
**Status**: ❌ **NOT IMPLEMENTED**  
**Impact**: Maintenance can't see which incidents are about to breach SLA

#### Problem Description
SLA deadlines are calculated but there's no alert when:
- SLA deadline approaching (< 1 hour)
- SLA deadline breached
- Incident overdue for resolution

#### Root Cause
No scheduled job to check SLA deadlines. Backend only calculates at creation time.

#### Missing Components
1. ❌ Scheduled task (hourly check)
2. ❌ WebSocket broadcast for SLA events
3. ❌ UI notification display
4. ❌ UI countdown timer
5. ❌ SLA dashboard/report
6. ❌ Audit logging

#### Fix Required

**File**: `backend/main.py` or new `backend/services/sla_monitor.py`

```python
# Add this to requirements.txt
# APScheduler>=3.10.0

# New file: backend/services/sla_monitor.py
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from database import SessionLocal
from models import Incident
from services.websocket_manager import ws_manager

scheduler = BackgroundScheduler()

@scheduler.scheduled_job('interval', hours=1)
def check_sla_violations():
    """Check for SLA violations and broadcast alerts"""
    db = SessionLocal()
    
    try:
        # Get incidents that will breach SLA within 1 hour
        upcoming_breach = db.query(Incident).filter(
            Incident.sla_deadline <= datetime.now() + timedelta(hours=1),
            Incident.sla_deadline > datetime.now(),
            Incident.status != 'CLOSED'
        ).all()
        
        for incident in upcoming_breach:
            minutes_remaining = int(
                (incident.sla_deadline - datetime.now()).total_seconds() / 60
            )
            ws_manager.broadcast('SLA_APPROACHING', {
                'incident_id': incident.id,
                'priority': incident.priority,
                'assignee_id': incident.assignee_id,
                'minutes_remaining': minutes_remaining,
                'deadline': incident.sla_deadline.isoformat()
            })
            log_audit_event(
                db, incident.assignee_id, 'SLA_ALERT', 'Incident',
                f'SLA deadline approaching in {minutes_remaining} minutes for incident {incident.id}'
            )
        
        # Get breached incidents
        breached = db.query(Incident).filter(
            Incident.sla_deadline < datetime.now(),
            Incident.status != 'CLOSED'
        ).all()
        
        for incident in breached:
            hours_overdue = int(
                (datetime.now() - incident.sla_deadline).total_seconds() / 3600
            )
            ws_manager.broadcast('SLA_VIOLATED', {
                'incident_id': incident.id,
                'priority': incident.priority,
                'assignee_id': incident.assignee_id,
                'hours_overdue': hours_overdue,
                'deadline': incident.sla_deadline.isoformat()
            })
            log_audit_event(
                db, incident.assignee_id, 'SLA_VIOLATION', 'Incident',
                f'SLA VIOLATED for incident {incident.id} by {hours_overdue} hours',
                severity='CRITICAL'
            )
    finally:
        db.close()

def start_sla_monitor():
    scheduler.start()

def stop_sla_monitor():
    scheduler.shutdown()

# In main.py
from services.sla_monitor import start_sla_monitor, stop_sla_monitor

app = FastAPI(...)

@app.on_event("startup")
async def startup_event():
    start_sla_monitor()

@app.on_event("shutdown")
async def shutdown_event():
    stop_sla_monitor()
```

**Frontend**: `web/src/components/SLAAlert.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useWebSocket } from '@/lib/websocket';

export function SLAAlert() {
  const [alerts, setAlerts] = useState<SLAAlert[]>([]);
  const ws = useWebSocket();
  
  useEffect(() => {
    ws.on('SLA_APPROACHING', (data) => {
      setAlerts(prev => [...prev, {
        type: 'approaching',
        ...data
      }]);
      // Show toast
      toast.warning(`⏰ SLA deadline in ${data.minutes_remaining} minutes for incident #${data.incident_id}`);
    });
    
    ws.on('SLA_VIOLATED', (data) => {
      setAlerts(prev => [...prev, {
        type: 'violated',
        ...data
      }]);
      // Show critical toast
      toast.error(`🚨 SLA VIOLATED for incident #${data.incident_id}!`);
    });
  }, []);
  
  return (
    <div className="fixed top-4 right-4 space-y-2">
      {alerts.map(alert => (
        <div key={alert.incident_id} 
          className={alert.type === 'violated' ? 'bg-red-500' : 'bg-yellow-500'}>
          {alert.type === 'violated' ? '🚨' : '⏰'} 
          Incident #{alert.incident_id} - {alert.minutes_remaining || alert.hours_overdue} 
          {alert.type === 'approaching' ? ' minutes' : ' hours'} 
          {alert.type === 'violated' ? 'OVERDUE' : 'remaining'}
        </div>
      ))}
    </div>
  );
}
```

#### Timeline
- **Estimated Fix Time**: 6 hours
- **Testing Time**: 2 hours
- **Priority**: **HIGH - Do after #1**

---

### CRITICAL #3: Document Workflow Has No Notifications

**Severity**: 🔴 **CRITICAL - WORKFLOW BLOCKER**  
**Status**: ❌ **NOT IMPLEMENTED**  
**Impact**: Document approvals don't notify next person in chain

#### Problem Description
Documents are routed through approval chain but approvers don't get notified. They must manually check the system.

#### Missing Components
1. ❌ WebSocket event on document routing
2. ❌ WebSocket event on approval/rejection
3. ❌ UI notification display
4. ❌ Pending approvals badge/counter
5. ❌ Audit logging of events

#### Affected Flows
- [ ] Document created → Route to L1 (❌ no notification)
- [ ] L1 approved → Route to L2 (❌ no notification)  
- [ ] L2 approved → Document approved (❌ creator not notified)
- [ ] Document rejected → Creator notified (❌ no notification)
- [ ] Document delayed → Stakeholders notified (❌ no notification)

#### Fix Required

**File**: `backend/routers/office_docs.py`

```python
@router.put("/{doc_id}/route")
async def route_document(
    doc_id: str,
    next_approver_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Route document to next approver"""
    document = db.query(Document).filter(Document.id == doc_id).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Update document
    document.currentAssigneeId = next_approver_id
    document.state = "SENT"
    db.add(document)
    
    # Create history entry
    history = DocumentHistory(
        documentId=doc_id,
        userId=current_user.id,
        action="ROUTED",
        metadata={"to": next_approver_id}
    )
    db.add(history)
    db.commit()
    
    # ✅ ADD THIS: Broadcast notification
    ws_manager.broadcast('DOCUMENT_ROUTED', {
        'document_id': doc_id,
        'document_type': document.documentType,
        'assignee_id': next_approver_id,
        'routed_by': current_user.id,
        'routed_at': datetime.now().isoformat(),
        'title': document.title
    })
    
    log_audit_event(
        db, current_user.id, 'DOCUMENT_ROUTED', 'Document',
        f'Document {doc_id} routed to {next_approver_id}'
    )
    
    return DocumentOut.from_orm(document)

@router.put("/{doc_id}/approve")
async def approve_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve document and route to next step"""
    document = db.query(Document).filter(Document.id == doc_id).first()
    
    if not document:
        raise HTTPException(status_code=404)
    
    if document.currentAssigneeId != current_user.id:
        raise HTTPException(status_code=403, detail="Not assigned to you")
    
    document.state = "APPROVED"
    db.add(document)
    db.commit()
    
    # ✅ ADD THIS: Broadcast approval notification
    ws_manager.broadcast('DOCUMENT_APPROVED', {
        'document_id': doc_id,
        'approved_by': current_user.id,
        'document_type': document.documentType,
        'title': document.title,
        'approved_at': datetime.now().isoformat()
    })
    
    # Notify creator
    ws_manager.send_to_user(document.creatorId, 'DOCUMENT_APPROVED', {
        'document_id': doc_id,
        'message': f'Your document "{document.title}" has been approved'
    })
    
    log_audit_event(db, current_user.id, 'DOCUMENT_APPROVED', 'Document', f'Document {doc_id} approved')
    
    return DocumentOut.from_orm(document)
```

#### Timeline
- **Estimated Fix Time**: 4 hours
- **Testing Time**: 2 hours

---

### CRITICAL #4: Chat System Not Connected to UI

**Severity**: 🔴 **CRITICAL - REAL-TIME FEATURE BLOCKER**  
**Status**: ⚠️ **BACKEND READY - UI INCOMPLETE**  
**Impact**: Real-time chat doesn't work

#### Problem Description
WebSocket infrastructure exists but frontend chat component doesn't connect or display messages.

#### Missing Components
1. ❌ WebSocket connection in frontend
2. ❌ Chat component rendering
3. ❌ Message input form
4. ❌ Message history display
5. ❌ Real-time message delivery

#### Fix Required

**Frontend**: Create `web/src/components/ChatRoom.tsx`

```typescript
'use client';

import { useEffect, useState, useRef } from 'react';
import { useWebSocket } from '@/lib/websocket';
import { getCurrentUser } from '@/lib/auth';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  roomId: string;
}

export function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const ws = useWebSocket();
  
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Load chat history
    fetchChatHistory(roomId);
    
    // Subscribe to new messages in this room
    ws.on('CHAT_MESSAGE', (data) => {
      if (data.roomId === roomId) {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      }
    });
    
    // Join room
    ws.emit('JOIN_ROOM', { roomId });
    
    return () => {
      ws.emit('LEAVE_ROOM', { roomId });
    };
  }, [roomId]);
  
  const fetchChatHistory = async (rid: string) => {
    const res = await fetch(`/api/v1/chat/rooms/${rid}/messages`);
    const history = await res.json();
    setMessages(history);
    scrollToBottom();
  };
  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      content: input,
      timestamp: new Date(),
      roomId
    };
    
    // Send via WebSocket
    ws.emit('SEND_MESSAGE', message);
    
    // Also save to DB
    await fetch('/api/v1/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    
    setInput('');
  };
  
  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md ${
              msg.userId === user?.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-black'
            } rounded-lg p-3`}>
              {msg.userId !== user?.id && <p className="text-sm font-semibold">{msg.userName}</p>}
              <p>{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>
      
      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

#### Timeline
- **Estimated Fix Time**: 4 hours
- **Testing Time**: 2 hours

---

### CRITICAL #5: No Incident Status Update UI Form

**Severity**: 🔴 **CRITICAL - CORE FEATURE MISSING**  
**Status**: ❌ **NO UI FORM**  
**Impact**: Maintenance can't update incident status through UI

#### Problem Description
API endpoint exists for state transitions but there's no form in UI to transition states.

#### Missing Components
1. ❌ Status update modal/form
2. ❌ State transition validation UI
3. ❌ Resolution notes textarea
4. ❌ State change confirmation

#### Fix Required

**Frontend**: Create `web/src/components/IncidentStatusForm.tsx`

```typescript
import { useState } from 'react';
import { Incident, IncidentStatus } from '@/types';

interface IncidentStatusFormProps {
  incident: Incident;
  onStatusChange: (status: IncidentStatus, notes?: string) => Promise<void>;
}

export function IncidentStatusForm({ incident, onStatusChange }: IncidentStatusFormProps) {
  const [newStatus, setNewStatus] = useState<IncidentStatus>(incident.status);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  const getNextStates = (current: IncidentStatus): IncidentStatus[] => {
    const transitions = {
      OPEN: ['ASSIGNED'],
      ASSIGNED: ['IN_PROGRESS'],
      IN_PROGRESS: ['RESOLVED'],
      RESOLVED: ['CLOSED'],
      CLOSED: []
    };
    return transitions[current] || [];
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onStatusChange(newStatus, notes);
      setNotes('');
    } finally {
      setLoading(false);
    }
  };
  
  const nextStates = getNextStates(incident.status);
  
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-2">
          Current Status: <span className="text-blue-600">{incident.status}</span>
        </label>
      </div>
      
      {nextStates.length > 0 && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Update Status</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as IncidentStatus)}
              className="w-full border rounded px-3 py-2"
            >
              <option value={incident.status}>{incident.status}</option>
              {nextStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          {newStatus === 'RESOLVED' && (
            <div>
              <label className="block text-sm font-medium mb-2">Resolution Notes *</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Describe the resolution and work performed..."
                className="w-full border rounded px-3 py-2 h-24"
                required
              />
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={loading || !notes && newStatus === 'RESOLVED'}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </>
      )}
      
      {nextStates.length === 0 && (
        <p className="text-gray-600">This incident cannot be transitioned further.</p>
      )}
    </div>
  );
}
```

#### Timeline
- **Estimated Fix Time**: 2 hours
- **Testing Time**: 1 hour

---

### CRITICAL #6: Frontend Doesn't Check Roles Before Showing Admin Pages

**Severity**: 🔴 **CRITICAL - SECURITY**  
**Status**: ⚠️ **BACKEND ENFORCES - FRONTEND ALLOWS**  
**Impact**: Users see admin menu even though API will reject

#### Problem Description
Frontend shows admin navigation to non-admin users. While API rejects requests, this is confusing and bad UX.

#### Fix Required

**Frontend**: Update `web/src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);
const ADMIN_ROUTES = ['/admin', '/admin/*'];
const PROTECTED_ROUTES = ['/dashboard', '/incidents', '/maintenance'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('access_token')?.value;
  
  // Check if route is admin
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    pathname.startsWith(route.replace('*', ''))
  );
  
  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (!token) {
    if (isProtectedRoute || isAdminRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
  
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const roleCode = verified.payload.roleCode as string;
    
    // ✅ ADD THIS: Block admin access for non-admins
    if (isAdminRoute && !['ADMIN', 'OFFICE'].includes(roleCode)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Add role to request headers for components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-role', roleCode);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/incidents/:path*', '/maintenance/:path*']
};
```

#### Timeline
- **Estimated Fix Time**: 1 hour
- **Testing Time**: 30 minutes

---

## 🟠 HIGH PRIORITY ISSUES (DO BEFORE LAUNCH)

### HIGH #1: Rate Limiting Not Enforced

**Status**: ⚠️ **CONFIGURED - NOT ACTIVE**

#### Problem
Rate limiting config exists but no middleware to enforce it.

#### Fix
```python
pip install python-ratelimit

# In main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# On endpoints
@app.get("/api/v1/incidents")
@limiter.limit("100/minute")
def get_incidents(...):
    pass
```

**Time**: 2 hours

---

### HIGH #2: Missing Database Indexes

**Status**: ❌ **NO INDEXES**

#### Problem
Queries without indexes will be slow with large datasets.

#### Add to `backend/prisma/schema.prisma`:
```prisma
model Incident {
  // ... fields ...
  
  @@index([status])
  @@index([priority])
  @@index([departmentId])
  @@index([createdAt])
  @@index([slaDeadline])
}

model Document {
  @@index([state])
  @@index([departmentId])
  @@index([creatorId])
  @@index([updatedAt])
}

model Machine {
  @@index([status])
  @@index([zoneId])
  @@index([branchId])
}

model User {
  @@index([email])
  @@index([roleId])
  @@index([departmentId])
}
```

Then run: `prisma migrate dev --name add_indexes`

**Time**: 1 hour

---

### HIGH #3: No Content-Security-Policy Header

**Status**: ❌ **MISSING**

#### Fix
```python
# In main.py
@app.middleware("http")
async def add_csp_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' wss: https:"
    )
    return response
```

**Time**: 30 minutes

---

### HIGH #4: Department-Level Frontend Routing

**Status**: ❌ **MISSING**

#### Problem
Frontend doesn't restrict navigation based on role/department.

#### Fix
Create `web/src/lib/rbac.ts`:
```typescript
export const ROLE_ROUTES = {
  ADMIN: ['/admin', '/dashboard', '/incidents', '/machines', '/documents', '/analytics'],
  OFFICE: ['/dashboard', '/documents', '/users', '/news'],
  MANAGER: ['/dashboard', '/incidents', '/analytics', '/documents'],
  WORKER: ['/dashboard', '/incidents', '/news'],
  MAINTENANCE: ['/dashboard', '/incidents', '/maintenance'],
  HR: ['/dashboard', '/hr', '/attendance', '/payroll'],
  QC: ['/dashboard', '/qc', '/incidents']
};

export function canAccess(roleCode: string, pathname: string): boolean {
  const routes = ROLE_ROUTES[roleCode] || [];
  return routes.some(route => pathname.startsWith(route));
}
```

**Time**: 2 hours

---

## 🎯 IMPLEMENTATION ORDER

### Week 1 (Critical Fixes)
1. **Monday**: Fix #1 (Data isolation) - 6 hours
2. **Tuesday-Wednesday**: Fix #2 (SLA alerts) - 8 hours  
3. **Thursday-Friday**: Fix #3 (Document notifications) + #4 (Chat) - 8 hours

### Week 2 (High Priority)
1. **Monday**: Fix #5 (Incident status form) - 3 hours
2. **Tuesday**: Fix #6 (Frontend role checks) - 1.5 hours
3. **Wednesday-Friday**: High priority fixes #1-4 - 8 hours

### Week 3 (Testing & QA)
1. End-to-end testing
2. Performance testing
3. Security audit
4. Mobile app testing

---

## ✅ VERIFICATION CHECKLIST

After each fix, verify:

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] No new warnings/errors in console
- [ ] Tested with multiple roles
- [ ] Tested with cross-department access
- [ ] Notification received correctly
- [ ] Database updated correctly
- [ ] Audit log created

---

**This document is the priority action plan for production deployment.**
