package com.lifeos

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.*
import java.util.concurrent.TimeUnit

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action == Intent.ACTION_BOOT_COMPLETED || 
            intent?.action == "android.intent.action.QUICKBOOT_POWERON") {
            val workRequest = PeriodicWorkRequestBuilder<UsageEvaluationWorker>(
                15, TimeUnit.MINUTES
            ).build()
            WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(
                    "lifeos_usage_eval",
                    ExistingPeriodicWorkPolicy.KEEP,
                    workRequest
                )
        }
    }
}
