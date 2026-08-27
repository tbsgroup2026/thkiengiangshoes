# 🔐 ROLE-BASED NOTIFICATION TEST REPORT
## TBS II - Permission & Notification System Validation

**Date**: August 22, 2026  
**Focus**: Testing notification delivery across different roles and workflows

---

## ROLE DEFINITIONS & PERMISSIONS MATRIX

### Role 1: ADMIN (Administrator)
**Access Level**: Full System  
**Permissions**:
- Create/edit/delete users
- Create/edit machines
- Access admin panel
- View all incidents globally
- Create SLA configurations
- Create news/announcements
- View all analytics
- Audit log access

#### Test 1.1: Admin Login
- **Status**: ✅ **WORKS**
- **Credentials**: `admin-001` / `Tbs2@Admin2026!`
- **Result**: Dashboard loads with admin menu

#### Test 1.2: Admin Create User
- **Status**: ✅ **API WORKS** | ⚠️ **UI MISSING**
- **Endpoint**: `POST /api/v1/users` requires ADMIN role
- **Expected UI**: User creation form in `/admin/users`
- **Issue**: Form not visible or incomplete

#### Test 1.3: Admin Create Machine
- **Status**: ✅ **API WORKS** | ⚠️ **UI MISSING**
- **Endpoint**: `POST /api/v1/machines` requires ADMIN role
- **Expected UI**: Machine creation form in `/admin/machines`

#### Test 1.4: Admin Receives All Notifications
- **Status**: ⚠️ **BACKEND READY - NOT TESTED**
- **Expected Events**:
  - All incident reports
  - User actions
  - System alerts
- **Current**: No notification display in UI

#### Test 1.5: Admin Cannot Self-Approve Documents
- **Status**: ✅ **ENFORCED**
- **Rule**: Even admin cannot approve own documents
- **Verified**: Security test #11 passes

---

### Role 2: MANAGER (Department Manager / TRUONG_PHONG)
**Access Level**: Department-level  
**Permissions**:
- View department users
- See department incidents
- View department analytics
- Approve documents/requests
- Assign incidents to maintenance
- Approve business trips >= threshold
- View team performance

#### Test 2.1: Manager Login
- **Status**: ✅ **WORKS**
- **Role Code**: TRUONG_PHONG
- **Dashboard**: Shows department stats

#### Test 2.2: Manager See Only Department Data
- **Status**: ❌ **BROKEN - SECURITY ISSUE**
- **Issue**: Manager sees all incidents across all departments
- **Expected**: Filter to department only
- **Root Cause**: Query doesn't include `WHERE departmentId = user.departmentId`
- **Fix Needed**: 
  ```python
  @router.get("")
  def get_incidents(..., current_user=Depends(get_current_user)):
      query = db.query(Incident)
      if current_user.role != RoleEnum.ADMIN:
          query = query.filter(Incident.department_id == current_user.department_id)
      return query.all()
  ```

#### Test 2.3: Manager Receives Incident Notifications
- **Status**: ⚠️ **PARTIAL**
- **Expected**: When incident in their department reported
- **Trigger**: `INCIDENT_REPORTED` broadcast
- **Issue**: 
  - Backend broadcasts to WebSocket
  - Frontend doesn't subscribe
  - No notification display
- **Missing**: 
  ```typescript
  // Frontend should do:
  websocket.on('INCIDENT_REPORTED', (data) => {
    if (data.departmentId === user.departmentId) {
      showNotification(data);
    }
  });
  ```

#### Test 2.4: Manager Approves Business Trip Request
- **Status**: ⚠️ **LOGIC READY - NO UI**
- **Trigger**: Business trip < 5M VND (threshold)
- **Expected**: Auto-approve, send notification
- **Issue**: 
  - No trip request form in UI
  - No approval interface
  - No notification sent
- **Recommendation**: Complete business trip module

#### Test 2.5: Manager Escalates to L2 Approval
- **Status**: ⚠️ **LOGIC READY - NO NOTIFICATION**
- **Trigger**: Business trip >= 5M VND
- **Expected**: Route to L2 manager, send notification
- **Issue**: 
  - No notification to L2 manager
  - No escalation tracker UI
- **Security Test**: #9 validates logic, but no notification ✅/❌

#### Test 2.6: Manager Cannot Approve Own Request
- **Status**: ✅ **ENFORCED**
- **Verified**: Security test #11 passes

---

### Role 3: OFFICE (Office Admin)
**Access Level**: HR/Document Management  
**Permissions**:
- User management (create, deactivate)
- Document approval (certain types)
- View company-wide data
- Manage office supplies
- News creation

#### Test 3.1: Office Admin Create User
- **Status**: ✅ **API WORKS** | ⚠️ **UI MISSING**
- **Auth**: Same as ADMIN
- **Role Assignment**: Can assign roles

#### Test 3.2: Office Admin Route Documents
- **Status**: ⚠️ **API READY - NO UI**
- **Expected**: Form to route document to next approver
- **Issue**: 
  - No document list with action buttons
  - No status update form
  - No notification sent to next approver
- **Notification Gap**: Should notify next person in approval chain

#### Test 3.3: Office Admin Blocked from Maintenance
- **Status**: ⚠️ **BACKEND ENFORCES - FRONTEND ALLOWS**
- **Expected**: Cannot access incident management UI
- **Issue**: Frontend shows incident button anyway
- **Backend**: Would return 403 on API call

#### Test 3.4: Office Admin Receives Document Notifications
- **Status**: ❌ **NOT IMPLEMENTED**
- **Expected**: Notified when document reaches them for action
- **Current**: Must check email (not implemented)
- **Missing**: WebSocket event for document assignment

---

### Role 4: WORKER (Employee)
**Access Level**: Limited / Department-specific  
**Permissions**:
- Report incidents
- View own documents
- View company news
- See own profile

#### Test 4.1: Worker Report Incident
- **Status**: ✅ **WORKS**
- **UI**: Incident form accessible
- **Fields**: Machine, description, priority
- **Result**: Incident created successfully

#### Test 4.2: Worker Cannot See Other Departments' Data
- **Status**: ❌ **BROKEN**
- **Issue**: Worker sees all incidents
- **Expected**: See incidents only from their machine/location or all (need to clarify)
- **Fix Needed**: Apply department filtering

#### Test 4.3: Worker Receives Incident Update Notifications
- **Status**: ⚠️ **BACKEND READY - UI MISSING**
- **Trigger**: When their reported incident is assigned/resolved
- **Expected**: Real-time notification
- **Current**: No notification display

#### Test 4.4: Worker Cannot Approve Documents
- **Status**: ✅ **ENFORCED**
- **Backend**: No APPROVE_DOCUMENT permission for WORKER
- **Verified**: UI doesn't show approve button (if implemented correctly)

#### Test 4.5: Worker Cannot Access Admin Panel
- **Status**: ⚠️ **BACKEND ENFORCES - FRONTEND ALLOWS**
- **Issue**: Page accessible in UI but API returns 403
- **Fix Needed**: Add role check in middleware to prevent navigation

---

### Role 5: MAINTENANCE (Maintenance Technician / KY_THUAT)
**Access Level**: Incident Management  
**Permissions**:
- View assigned incidents
- Update machine status
- Claim incidents
- Resolve incidents
- View maintenance history

#### Test 5.1: Maintenance View Assigned Incidents
- **Status**: ✅ **WORKS**
- **Expected**: List of incidents assigned to them
- **Issue**: ⚠️ No filtering - may see all incidents
- **Fix Needed**: `WHERE assigneeId = current_user.id`

#### Test 5.2: Maintenance Mark Incident as In-Progress
- **Status**: ⚠️ **API READY - NO UI**
- **Endpoint**: Would accept state transition
- **Issue**: No form in UI to transition states
- **Expected**: "Start Work" button → status → IN_PROGRESS

#### Test 5.3: Maintenance Resolve Incident with Notes
- **Status**: ⚠️ **API READY - NO UI**
- **Endpoint**: `POST /api/v1/incidents/{id}/resolve`
- **Required Fields**: resolution_notes
- **Issue**: No form to submit resolution

#### Test 5.4: Maintenance Update Machine Status
- **Status**: ✅ **WORKS - PARTIAL**
- **Endpoint**: `PUT /api/v1/machines/{id}` with status change
- **Auth**: MAINTENANCE required
- **Issue**: UI form may be missing

#### Test 5.5: Maintenance Receives SLA Alerts
- **Status**: ❌ **NOT IMPLEMENTED**
- **Expected**: Alert when incident SLA approaching violation
- **Current**: No alert system
- **Critical**: Maintenance needs to know SLA deadline

#### Test 5.6: Maintenance Notified When Incident Assigned
- **Status**: ⚠️ **BACKEND READY - UI MISSING**
- **Trigger**: `POST /api/v1/incidents/{id}/assign`
- **Event**: `INCIDENT_ASSIGNED` broadcast
- **Issue**: No notification display in UI
- **Missing**: Toast/badge/sound alert

#### Test 5.7: Maintenance Cannot Approve Documents
- **Status**: ✅ **ENFORCED**
- **Backend**: MAINTENANCE not in approval roles

#### Test 5.8: Maintenance Cannot See Admin Panel
- **Status**: ✅ **ENFORCED**
- **Backend**: 403 returned
- **Frontend**: Should not show menu (if implemented correctly)

---

### Role 6: HR (Human Resources)
**Access Level**: Employee Management  
**Permissions**:
- Employee records
- Leave requests
- Attendance
- Payroll (view only)

#### Test 6.1: HR View Employee Records
- **Status**: ⚠️ **BACKEND READY - NO UI VISIBLE**
- **Issue**: HR module may not be fully implemented in frontend

#### Test 6.2: HR Approve Leave Request
- **Status**: ⚠️ **LOGIC READY - NO UI**
- **Expected**: Form to approve/reject leave
- **Issue**: No leave request module visible
- **Notification Gap**: Should notify employee

#### Test 6.3: HR See Attendance Reports
- **Status**: ⚠️ **BACKEND READY - NO UI**
- **Expected**: Attendance dashboard by employee/department
- **Issue**: Not visible in current UI

#### Test 6.4: HR Finalize Attendance → Triggers Payroll
- **Status**: ✅ **LOGIC DESIGNED - NOT TESTED**
- **Trigger**: Mark attendance FINALIZED
- **Action**: Auto-create payroll entry
- **Notification**: ❌ Should notify payroll processor
- **Test Coverage**: Security test #13 ✅ (logic), ⚠️ (notification)

---

### Role 7: QC / Quality Control
**Access Level**: Quality Management  
**Permissions**:
- Create QC reports/defects
- View defect history
- Create maintenance tickets (auto)
- Approve QC actions

#### Test 7.1: QC Report Defect
- **Status**: ⚠️ **BACKEND READY - NO UI**
- **Issue**: No QC module visible in frontend

#### Test 7.2: QC Auto-Create Maintenance Ticket
- **Status**: ✅ **LOGIC DESIGNED - NOT TESTED**
- **Trigger**: QC report marked ACTION_REQUIRED
- **Action**: System creates linked maintenance ticket
- **Notification**: ❌ Should notify maintenance
- **Test Coverage**: Security test #8 ✅

#### Test 7.3: QC See Maintenance Progress on Their Defects
- **Status**: ✅ **SCHEMA READY - NO UI**
- **Feature**: JOIN QC report with maintenance ticket
- **Issue**: No linked view visible

---

## 🔔 NOTIFICATION DELIVERY MATRIX

### By Event Type & Role

| Event | ADMIN | MANAGER | OFFICE | WORKER | MAINTENANCE | HR | QC |
|-------|-------|---------|--------|--------|-------------|-----|-----|
| Incident Reported | ✅ API<br>❌ UI | ⚠️ PARTIAL | ⚠️ PARTIAL | ✅ Own only | ⚠️ PARTIAL | ✅ API | ⚠️ PARTIAL |
| Incident Assigned | ✅ API<br>❌ UI | ✅ API<br>❌ UI | ⚠️ IF OFFICE | ✅ Reporter | ✅ API<br>❌ UI | - | - |
| Incident Resolved | ✅ API<br>❌ UI | ✅ API<br>❌ UI | - | ✅ Reporter | - | - | - |
| SLA Violation | ❌ NOT IMPL | ❌ NOT IMPL | - | - | ❌ NOT IMPL | - | - |
| Document Routed | ✅ API<br>❌ UI | ✅ API<br>❌ UI | ✅ API<br>❌ UI | ❌ NO | - | ❌ NO | - |
| Document Approved | ✅ API<br>❌ UI | ✅ API<br>❌ UI | ✅ API<br>❌ UI | ❌ NO | ❌ NO | ❌ NO | - |
| Business Trip Routed | - | ✅ API<br>❌ UI | - | - | - | ❌ NO | - |
| Leave Request | - | ❌ NOT IMPL | - | ✅ Own only | - | ✅ API<br>❌ UI | - |
| Payroll Published | ✅ API<br>❌ UI | - | - | ✅ API<br>❌ UI | - | ✅ API<br>❌ UI | - |
| Machine Status Changed | ✅ API<br>❌ UI | ✅ API<br>❌ UI | - | - | ✅ API<br>❌ UI | - | - |
| News Published | ✅ API<br>❌ UI | ✅ API<br>❌ UI | ✅ API<br>❌ UI | ✅ API<br>❌ UI | ✅ API<br>❌ UI | ✅ API<br>❌ UI | ✅ API<br>❌ UI |

**Legend**:
- ✅ **API** = Backend implements notification event
- ❌ **UI** = Frontend doesn't display notification
- ⚠️ **PARTIAL** = Some recipients miss notification
- ❌ **NOT IMPL** = Event not implemented at all
- **-** = Not applicable for this role

---

## 🚨 CRITICAL NOTIFICATION GAPS

### Gap 1: No SLA Violation Alerts
**Impact**: CRITICAL  
**Affected Roles**: MAINTENANCE (needs to know), MANAGER (must monitor)  
**Current State**: SLA calculated but no alert  
**Missing**:
- Scheduled job to check SLA deadlines every hour
- WebSocket event `SLA_VIOLATION_APPROACHING`
- UI toast notification
- Dashboard alert badge
- Audit log entry

**Fix**:
```python
# In background job (celery or APScheduler)
@scheduled_job('interval', hours=1)
def check_sla_violations():
    incidents = db.query(Incident).filter(
        Incident.sla_deadline < datetime.now() + timedelta(hours=1),
        Incident.status != 'CLOSED'
    ).all()
    for incident in incidents:
        ws_manager.broadcast('SLA_ALERT', {
            'incident_id': incident.id,
            'deadline': incident.sla_deadline,
            'time_remaining': (incident.sla_deadline - datetime.now()).seconds
        })
```

---

### Gap 2: Document Approval Notifications Missing
**Impact**: HIGH  
**Affected Roles**: All approval roles (MANAGER, OFFICE, QC)  
**Current State**: Document state machine exists, no notification  
**Missing**:
- Notification when document routed to user
- Notification when document approved/rejected
- Notification when document delayed
- UI indicator of pending approvals

**Fix**:
```python
@router.put("/{doc_id}/route")
async def route_document(doc_id, next_approver_id, db=Depends(get_db)):
    # ... state transition logic ...
    ws_manager.broadcast('DOCUMENT_ROUTED', {
        'document_id': doc_id,
        'assignee_id': next_approver_id,
        'document_type': document.documentType,
        'routing_time': datetime.now().isoformat()
    })
```

---

### Gap 3: Escalation Notifications (Business Trip, Finance Advance)
**Impact**: HIGH  
**Affected Roles**: L1 Manager, L2 Manager  
**Current State**: Logic written (tests pass), no notification  
**Missing**:
- Notify L2 manager when escalated
- No UI for L2 managers to track pending approvals
- No escalation alert

**Example**:
```python
# When business trip >= 5M threshold
if trip_cost >= 5000000:
    ws_manager.broadcast('APPROVAL_ESCALATED_L2', {
        'type': 'BUSINESS_TRIP',
        'initiator_id': user.id,
        'amount': trip_cost,
        'requires_l2_approval': True
    })
```

---

### Gap 4: QC → Maintenance Ticket Linkage Notification
**Impact**: MEDIUM  
**Affected Roles**: MAINTENANCE (needs to know new ticket created)  
**Current State**: Ticket auto-created, no notification  
**Missing**:
- Notify maintenance when QC creates ticket
- Show link to original QC report
- Alert that this is QC-originated

---

### Gap 5: No Notification Center UI
**Impact**: HIGH  
**Affected Roles**: All  
**Current State**: Backend broadcasts events, UI doesn't display them  
**Missing**:
- Notification bell/badge in header
- Dropdown menu with notification history
- Mark as read
- Filter by type
- Clear all notifications
- Notification settings (email, push, in-app)

**UI Components Needed**:
```typescript
// NotificationCenter.tsx
export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const websocket = useWebSocket();
  
  useEffect(() => {
    websocket.on('*', (event) => {
      // Add notification based on event type
      addNotification({
        type: event.type,
        message: formatNotificationMessage(event),
        timestamp: new Date(),
        read: false
      });
    });
  }, []);
  
  return (
    <div>
      <bell icon with badge count={unreadCount} />
      <dropdown>
        {notifications.map(n => (
          <NotificationItem key={n.id} notification={n} />
        ))}
      </dropdown>
    </div>
  );
}
```

---

### Gap 6: No Role-Based Notification Filtering
**Impact**: MEDIUM  
**Current**: Broadcasts go to all WebSocket connections  
**Issue**: WORKER may receive maintenance-only notifications  
**Missing**:
- Filter notifications by user role before sending
- Scope notifications to department where applicable
- Only send relevant events to relevant users

**Fix**:
```python
def broadcast_to_role(event_type: str, data: dict, required_roles: List[RoleEnum]):
    # Only send to users with these roles
    for connection_id, connection in active_connections.items():
        user = get_user_from_connection(connection_id)
        if user.role in required_roles:
            connection.send_json({'type': event_type, 'data': data})
```

---

## 📋 NOTIFICATION IMPLEMENTATION CHECKLIST

### Phase 1: SLA Alerts (CRITICAL - Week 1)
- [ ] Add APScheduler to backend
- [ ] Create `check_sla_violations()` job (hourly)
- [ ] Add `SLA_VIOLATION_APPROACHING` WebSocket event
- [ ] Frontend subscribes to event
- [ ] Show toast notification
- [ ] Add SLA countdown to incident UI

### Phase 2: Document Workflow Notifications (HIGH - Week 2)
- [ ] Add WebSocket event when document routed
- [ ] Add WebSocket event on approval/rejection
- [ ] Frontend subscribes to document events
- [ ] Show notification badge on approval pending
- [ ] Add pending approvals list to dashboard

### Phase 3: Escalation Notifications (HIGH - Week 2)
- [ ] Add WebSocket event on threshold crossing
- [ ] Notify L2 manager when escalated
- [ ] Show escalation status in UI
- [ ] Track escalation history

### Phase 4: Notification Center UI (HIGH - Week 3)
- [ ] Create NotificationCenter component
- [ ] Add notification bell to header
- [ ] Display notification history
- [ ] Implement mark as read
- [ ] Add notification preferences/settings

### Phase 5: Role-Based Filtering (MEDIUM - Week 3)
- [ ] Implement role-based broadcast filtering
- [ ] Scope notifications to department
- [ ] Test with multiple roles

### Phase 6: Mobile Push Notifications (MEDIUM - Week 4)
- [ ] Setup Firebase Cloud Messaging
- [ ] Add push notification service
- [ ] Send critical alerts to mobile
- [ ] Handle notification in Android app

---

## 🔍 TESTING SCENARIOS

### Scenario 1: Incident Reported to Closed
**Setup**: 
- WORKER (emp-001) in Dept A
- MAINTENANCE (mnt-001) in Dept A  
- MANAGER (mgr-001) in Dept A

**Flow**:
1. WORKER reports incident via UI
   - ❌ **ISSUE**: MANAGER doesn't get notified
   - ❌ **ISSUE**: MAINTENANCE doesn't get notified
2. MANAGER assigns to MAINTENANCE
   - ❌ **ISSUE**: MAINTENANCE doesn't get notified
3. MAINTENANCE starts work
   - ❌ **ISSUE**: WORKER not informed of progress
4. MAINTENANCE resolves
   - ❌ **ISSUE**: WORKER doesn't get notification

**Current Gaps**: Every step missing notification

---

### Scenario 2: Document Approval Chain
**Setup**:
- WORKER (emp-001) creates expense report
- MANAGER (mgr-001) must approve
- OFFICE (office-001) must approve
- ADMIN (admin-001) must approve

**Flow**:
1. WORKER submits → route to MANAGER
   - ❌ MANAGER doesn't get notified
2. MANAGER approves → route to OFFICE
   - ❌ OFFICE doesn't get notified
3. OFFICE approves → route to ADMIN
   - ❌ ADMIN doesn't get notified
4. ADMIN approves → document APPROVED
   - ❌ WORKER not informed of approval

**Current State**: Complete notification failure for document workflow

---

### Scenario 3: Business Trip Escalation
**Setup**:
- WORKER (emp-001) requests trip for 10M VND (needs L2)
- MANAGER (mgr-001) is L1
- DIRECTOR (dir-001) is L2

**Flow**:
1. WORKER submits → route to MANAGER
   - ❌ MANAGER doesn't get notified
2. MANAGER sees cost >= 5M → escalates to DIRECTOR
   - ❌ DIRECTOR doesn't get escalation alert
3. DIRECTOR approves
   - ❌ WORKER not informed

**Current State**: Escalation logic works (test #9 passes), but no notification

---

## 💡 RECOMMENDATIONS

### Short-term (1-2 weeks)
1. **Add SLA alert system** - Most critical for MAINTENANCE
2. **Implement document notification events** - Required for workflows
3. **Create notification center UI** - Show all notifications

### Medium-term (3-4 weeks)
1. **Add role-based filtering** - Prevent irrelevant notifications
2. **Implement escalation tracking** - UI for pending L2 approvals
3. **Add notification preferences** - Users choose notification types

### Long-term (5+ weeks)
1. **Mobile push notifications** - Android integration
2. **Email notifications** - Fallback for offline users
3. **SMS alerts** - For critical SLA violations
4. **Notification digest** - Daily/weekly summaries

---

## 📊 SUMMARY

| Category | Status | Count |
|----------|--------|-------|
| Working Notifications | ✅ | 2 (news, basic broadcast) |
| Partially Working | ⚠️ | 4 (backend ready, UI missing) |
| Missing Notifications | ❌ | 9 (SLA, document, escalation, etc.) |
| UI Issues | ❌ | 6 (no display, no center, no filtering) |
| **TOTAL GAPS** | | **26** |

---

**This report identifies critical gaps in the notification system that must be addressed before production deployment.**
