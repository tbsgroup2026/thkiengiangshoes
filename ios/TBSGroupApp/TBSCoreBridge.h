#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface TBSCoreBridge : NSObject

+ (int)initCoreWithStoragePath:(NSString *)storagePath apiBaseUrl:(NSString *)apiBaseUrl;
+ (int)reportIncidentWithMachineCode:(NSString *)machineCode errorType:(NSString *)errorType description:(NSString *)description;
+ (int)getPendingSyncCount;
+ (int)syncOfflineTickets;

@end

NS_ASSUME_NONNULL_END
