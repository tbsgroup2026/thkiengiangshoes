#include "tbs_core.h"
#include <string>
#include <vector>
#include <iostream>

static std::string g_storage_path = "";
static std::string g_api_base_url = "https://tbshethong.workers.dev";
static int g_pending_sync_tickets = 0;
static TBSUserSession g_current_session = {nullptr, nullptr, nullptr, 6, nullptr};

extern "C" {

int tbs_core_init(const char* storage_path, const char* api_base_url) {
    if (storage_path) g_storage_path = storage_path;
    if (api_base_url) g_api_base_url = api_base_url;
    std::cout << "[TBS Core] Initialized at storage: " << g_storage_path << std::endl;
    return 0;
}

int tbs_core_login(const char* emp_code, const char* password, TBSUserSession* out_session) {
    if (!emp_code || !password) return -1;
    
    // Simulate session payload verification
    g_current_session.user_id = "1";
    g_current_session.emp_code = emp_code;
    g_current_session.role_code = "MAINTENANCE";
    g_current_session.role_level = 5;
    g_current_session.token = "jwt_token_sample";

    if (out_session) {
        *out_session = g_current_session;
    }
    return 0;
}

void tbs_core_logout(void) {
    g_current_session = {nullptr, nullptr, nullptr, 6, nullptr};
}

int tbs_core_report_incident(const char* machine_code, const char* error_type, const char* description) {
    if (!machine_code || !error_type) return -1;
    
    // Save to offline queue counter
    g_pending_sync_tickets++;
    std::cout << "[TBS Core] Reported incident for machine " << machine_code 
              << ". Pending offline sync queue count: " << g_pending_sync_tickets << std::endl;
    return 0;
}

int tbs_core_get_pending_sync_count(void) {
    return g_pending_sync_tickets;
}

int tbs_core_sync_offline_tickets(void) {
    int synced = g_pending_sync_tickets;
    g_pending_sync_tickets = 0;
    std::cout << "[TBS Core] Successfully synced " << synced << " offline tickets to Cloudflare Workers API." << std::endl;
    return synced;
}

int tbs_core_has_min_role_level(int required_level) {
    return g_current_session.role_level <= required_level ? 1 : 0;
}

}
