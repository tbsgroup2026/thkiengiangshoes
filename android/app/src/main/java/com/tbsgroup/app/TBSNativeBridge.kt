package com.tbsgroup.app

object TBSNativeBridge {
    init {
        System.loadLibrary("tbs_core")
    }

    external fun initCore(storagePath: String, apiBaseUrl: String): Int
    external fun reportIncident(machineCode: String, errorType: String, description: String): Int
    external fun getPendingSyncCount(): Int
    external fun syncOfflineTickets(): Int
}
