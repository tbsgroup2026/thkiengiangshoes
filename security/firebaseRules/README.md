# TBS II — Firebase Security Rules

## Cach trien khai

### 1. Cai dat Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Storage Rules
```bash
firebase deploy --only storage:rules
```

### 4. Kiem tra rules
```bash
firebase firestore:indexes
```

## Nguyen tac thiet ke

1. **Default DENY** — Moi collection deu mac dinh `allow read, write: if false`
2. **Least Privilege** — Chi cap quyen toi thieu can thiet cho tung role
3. **Data Isolation** — Worker chi thay incident cua minh, maintenance chi thay ticket duoc giao
4. **Soft Delete** — Khong xoa cung, dung `deleted_at` flag
5. **Audit Trail** — Admin logs chi doc, khong ghi tu client

## Custom Claims (set trong Firebase Auth)

Claims can duoc set khi tao user:
```javascript
// Admin SDK — set custom claims
await admin.auth().setCustomUserClaims(uid, {
  role: 'MAINTENANCE',
  department: 'Doi Bao Tri 1',
  branch_id: 1,
  emp_code: 'BT001'
});
```

## Kiem tra rules truoc khi deploy

```bash
# Firestore
firebase firestore:rules-test security/firebaseRules/firestore.rules

# Storage
firebase storage:rules-test security/firebaseRules/storage.rules
```
