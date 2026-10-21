package com.lifeos

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView

class OverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            stopSelf()
            return START_NOT_STICKY
        }

        val message = intent?.getStringExtra("EXTRA_MESSAGE") ?: "Hey friend! Take a small breath."

        showOverlay(message)
        return START_NOT_STICKY
    }

    private fun showOverlay(message: String) {
        if (overlayView != null) return

        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val layoutParamsType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutParamsType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP
            y = 120
        }

        // Programmatically build small, clean non-blocking card view
        val card = View.inflate(this, android.R.layout.simple_list_item_2, null)
        // Add listener to dismiss
        card.setOnClickListener {
            removeOverlay()
        }

        overlayView = card
        try {
            windowManager?.addView(overlayView, params)
        } catch (e: Exception) {
            stopSelf()
        }
    }

    private fun removeOverlay() {
        if (overlayView != null && windowManager != null) {
            try {
                windowManager?.removeView(overlayView)
            } catch (e: Exception) {}
            overlayView = null
        }
        stopSelf()
    }

    override fun onDestroy() {
        super.onDestroy()
        removeOverlay()
    }
}
