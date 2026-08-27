#include <jni.h>
#include <string>
#include "../../../../../core-cpp/include/tbs_core.h"

extern "C" JNIEXPORT jint JNICALL
Java_com_tbsgroup_app_TBSNativeBridge_initCore(
        JNIEnv* env,
        jobject /* this */,
        jstring storagePath,
        jstring apiBaseUrl) {
    const char* nativeStoragePath = env->GetStringUTFChars(storagePath, 0);
    const char* nativeApiUrl = env->GetStringUTFChars(apiBaseUrl, 0);

    int result = tbs_core_init(nativeStoragePath, nativeApiUrl);

    env->ReleaseStringUTFChars(storagePath, nativeStoragePath);
    env->ReleaseStringUTFChars(apiBaseUrl, nativeApiUrl);

    return result;
}

extern "C" JNIEXPORT jint JNICALL
Java_com_tbsgroup_app_TBSNativeBridge_reportIncident(
        JNIEnv* env,
        jobject /* this */,
        jstring machineCode,
        jstring errorType,
        jstring description) {
    const char* code = env->GetStringUTFChars(machineCode, 0);
    const char* err = env->GetStringUTFChars(errorType, 0);
    const char* desc = env->GetStringUTFChars(description, 0);

    int result = tbs_core_report_incident(code, err, desc);

    env->ReleaseStringUTFChars(machineCode, code);
    env->ReleaseStringUTFChars(errorType, err);
    env->ReleaseStringUTFChars(description, desc);

    return result;
}

extern "C" JNIEXPORT jint JNICALL
Java_com_tbsgroup_app_TBSNativeBridge_getPendingSyncCount(
        JNIEnv* env,
        jobject /* this */) {
    return tbs_core_get_pending_sync_count();
}

extern "C" JNIEXPORT jint JNICALL
Java_com_tbsgroup_app_TBSNativeBridge_syncOfflineTickets(
        JNIEnv* env,
        jobject /* this */) {
    return tbs_core_sync_offline_tickets();
}
