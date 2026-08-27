#include <gtest/gtest.h>
#include "tbs_core.h"

TEST(TBSCoreTest, Initialization) {
    int status = tbs_core_init("/tmp/tbs_db", "https://tbshethong.workers.dev");
    EXPECT_EQ(status, 0);
}

TEST(TBSCoreTest, AuthLogin) {
    TBSUserSession session;
    int res = tbs_core_login("EMP-004", "Password123", &session);
    EXPECT_EQ(res, 0);
    EXPECT_STREQ(session.emp_code, "EMP-004");
    EXPECT_EQ(session.role_level, 5);
}

TEST(TBSCoreTest, OfflineQueueReportAndSync) {
    EXPECT_EQ(tbs_core_get_pending_sync_count(), 0);
    
    tbs_core_report_incident("MC-MAY-04", "Đứt chỉ", "Kẹt ổ chao");
    tbs_core_report_incident("MC-CAT-02", "Mất nguồn", "Hỏng biến áp");
    
    EXPECT_EQ(tbs_core_get_pending_sync_count(), 2);
    
    int synced = tbs_core_sync_offline_tickets();
    EXPECT_EQ(synced, 2);
    EXPECT_EQ(tbs_core_get_pending_sync_count(), 0);
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
