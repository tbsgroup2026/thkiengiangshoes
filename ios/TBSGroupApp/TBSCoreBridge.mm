#import "TBSCoreBridge.h"
#include "../../core-cpp/include/tbs_core.h"

@implementation TBSCoreBridge

+ (int)initCoreWithStoragePath:(NSString *)storagePath apiBaseUrl:(NSString *)apiBaseUrl {
    const char *path = [storagePath UTF8String];
    const char *url = [apiBaseUrl UTF8String];
    return tbs_core_init(path, url);
}

+ (int)reportIncidentWithMachineCode:(NSString *)machineCode errorType:(NSString *)errorType description:(NSString *)description {
    const char *code = [machineCode UTF8String];
    const char *err = [errorType UTF8String];
    const char *desc = [description UTF8String];
    return tbs_core_report_incident(code, err, desc);
}

+ (int)getPendingSyncCount {
    return tbs_core_get_pending_sync_count();
}

+ (int)syncOfflineTickets {
    return tbs_core_sync_offline_tickets();
}

@end
