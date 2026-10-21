package com.lifeos

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.Calendar

class UsageStatsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStatsModule"
    }

    /**
     * Checks whether PACKAGE_USAGE_STATS permission is authorized by the user.
     */
    @ReactMethod
    fun hasUsagePermission(promise: Promise) {
        try {
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactContext.packageName
            )
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.reject("PERMISSION_CHECK_ERROR", e.message, e)
        }
    }

    /**
     * Opens Android Settings allowing user to grant Usage Access to LIFEOS.
     */
    @ReactMethod
    fun openUsageSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_OPEN_ERROR", e.message, e)
        }
    }

    /**
     * Queries foreground accumulated usage between startTime and endTime.
     * Enforces data minimization: only returns packageName, totalTimeInForeground, and lastTimeUsed.
     */
    @ReactMethod
    fun queryDailyUsage(packageNames: ReadableArray, promise: Promise) {
        try {
            val usageStatsManager =
                reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
            val startOfDay = calendar.timeInMillis
            val now = System.currentTimeMillis()

            val statsMap: Map<String, UsageStats> =
                usageStatsManager.queryAndAggregateUsageStats(startOfDay, now)

            val resultArray = Arguments.createArray()
            val targetPackages = mutableSetOf<String>()
            for (i in 0 until packageNames.size()) {
                packageNames.getString(i)?.let { targetPackages.add(it) }
            }

            for (pkg in targetPackages) {
                val stats = statsMap[pkg]
                val itemMap = Arguments.createMap()
                itemMap.putString("packageName", pkg)
                if (stats != null) {
                    val foregroundMillis = stats.totalTimeInForeground
                    itemMap.putDouble("totalMinutes", (foregroundMillis / (1000.0 * 60.0)))
                    itemMap.putDouble("lastTimeUsed", stats.lastTimeUsed.toDouble())
                } else {
                    itemMap.putDouble("totalMinutes", 0.0)
                    itemMap.putDouble("lastTimeUsed", 0.0)
                }
                resultArray.pushMap(itemMap)
            }

            promise.resolve(resultArray)
        } catch (e: Exception) {
            promise.reject("USAGE_QUERY_ERROR", e.message, e)
        }
    }
}
