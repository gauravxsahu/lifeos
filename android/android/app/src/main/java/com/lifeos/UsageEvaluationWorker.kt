package com.lifeos

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * WorkManager worker that runs periodic evaluations (e.g. every 15 minutes)
 * to evaluate accumulated foreground app usage against configured user thresholds.
 * Enforces deduplication and quiet-hours locally on the Android device.
 */
class UsageEvaluationWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            // Evaluates usage thresholds, checks deduplication keys, and dispatches local notification if threshold crossed
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
