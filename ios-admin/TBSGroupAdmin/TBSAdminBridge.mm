#import "TBSAdminBridge.h"
#include "../../core-cpp/include/tbs_core.h"

@implementation TBSAdminBridge

+ (int)initCoreWithStoragePath:(NSString *)storagePath apiBaseUrl:(NSString *)apiBaseUrl {
    const char *path = [storagePath UTF8String];
    const char *url = [apiBaseUrl UTF8String];
    return tbs_core_init(path, url);
}

+ (int)loginAdminWithEmpCode:(NSString *)empCode password:(NSString *)password {
    const char *code = [empCode UTF8String];
    const char *pass = [password UTF8String];
    TBSUserSession session;
    return tbs_core_login(code, pass, &session);
}

+ (int)approveDocumentWithId:(int)docId status:(NSString *)status comments:(NSString *)comments {
    // Admin C++ approval queue handler
    return 0;
}

+ (int)reassignIncidentTicketWithCode:(NSString *)ticketCode mechanicId:(int)mechanicId {
    // Admin ticket reassign handler
    return 0;
}

+ (int)getPendingSyncCount {
    return tbs_core_get_pending_sync_count();
}

@end
