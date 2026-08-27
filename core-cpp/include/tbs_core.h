#ifndef TBS_CORE_H
#define TBS_CORE_H

#ifdef __cplusplus
extern "C" {
#endif

// Shared Core C API Bridge for Android JNI and iOS Objective-C++
typedef struct {
    const char* user_id;
    const char* emp_code;
    const char* role_code;
    int role_level;
    const char* token;
} TBSUserSession;

// Core Lifecycle & Auth API
int tbs_core_init(const char* storage_path, const char* api_base_url);
int tbs_core_login(const char* emp_code, const char* password, TBSUserSession* out_session);
void tbs_core_logout(void);

// Offline Queue Maintenance Ticket API
int tbs_core_report_incident(const char* machine_code, const char* error_type, const char* description);
int tbs_core_get_pending_sync_count(void);
int tbs_core_sync_offline_tickets(void);

// Check if user has permission level for action
int tbs_core_has_min_role_level(int required_level);

#ifdef __cplusplus
}
#endif

#endif // TBS_CORE_H
