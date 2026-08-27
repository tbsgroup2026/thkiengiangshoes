#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface TBSAdminBridge : NSObject

+ (int)initCoreWithStoragePath:(NSString *)storagePath apiBaseUrl:(NSString *)apiBaseUrl;
+ (int)loginAdminWithEmpCode:(NSString *)empCode password:(NSString *)password;
+ (int)approveDocumentWithId:(int)docId status:(NSString *)status comments:(NSString *)comments;
+ (int)reassignIncidentTicketWithCode:(NSString *)ticketCode mechanicId:(int)mechanicId;
+ (int)getPendingSyncCount;

@end

NS_ASSUME_NONNULL_END
