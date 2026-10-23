package com.lifeos

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class OverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private val handler = Handler(Looper.getMainLooper())
    private val autoDismissRunnable = Runnable { removeOverlay() }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            stopSelf()
            return START_NOT_STICKY
        }

        val title = intent?.getStringExtra("EXTRA_TITLE") ?: "Instagram (15-Min Reel Reminder)"
        val message = intent?.getStringExtra("EXTRA_MESSAGE")
            ?: "Hey dost! Aap 15 minute se Instagram dekh rahe hain. Chalo 20 min ka ek chhota break lete hain!"

        showOverlay(title, message)
        return START_NOT_STICKY
    }

    private fun showOverlay(title: String, message: String) {
        if (overlayView != null) {
            removeOverlay()
        }

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
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
            y = 80
        }

        // Programmatically construct modern dark floating card
        val density = resources.displayMetrics.density
        val dpToPx = { dp: Int -> (dp * density).toInt() }

        val rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dpToPx(16), dpToPx(16), dpToPx(16), dpToPx(16))
            val bg = GradientDrawable().apply {
                setColor(Color.parseColor("#1e293b"))
                cornerRadius = 24 * density
                setStroke(dpToPx(2), Color.parseColor("#10b981"))
            }
            background = bg
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(dpToPx(16), 0, dpToPx(16), 0)
            }
            elevation = 20 * density
        }

        // Tag / Badge
        val badge = TextView(this).apply {
            text = "🌱 LIFEOS GENTLE COMPANION"
            setTextColor(Color.parseColor("#34d399"))
            textSize = 11f
            paint.isFakeBoldText = true
            setPadding(0, 0, 0, dpToPx(4))
        }
        rootLayout.addView(badge)

        // Title
        val titleView = TextView(this).apply {
            text = title
            setTextColor(Color.WHITE)
            textSize = 15f
            paint.isFakeBoldText = true
            setPadding(0, 0, 0, dpToPx(6))
        }
        rootLayout.addView(titleView)

        // Friendly message
        val msgView = TextView(this).apply {
            text = message
            setTextColor(Color.parseColor("#e2e8f0"))
            textSize = 13f
            setLineSpacing(0f, 1.2f)
            setPadding(0, 0, 0, dpToPx(14))
        }
        rootLayout.addView(msgView)

        // Buttons container
        val btnContainer = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.END
        }

        // Dismiss Button
        val closeBtn = Button(this).apply {
            text = "Close"
            setTextColor(Color.parseColor("#94a3b8"))
            setBackgroundColor(Color.TRANSPARENT)
            textSize = 12f
            setOnClickListener { removeOverlay() }
        }
        btnContainer.addView(closeBtn)

        // Take a Break Button
        val focusBtn = Button(this).apply {
            text = "Take a Break ⏱️"
            setTextColor(Color.WHITE)
            textSize = 12f
            paint.isFakeBoldText = true
            val btnBg = GradientDrawable().apply {
                setColor(Color.parseColor("#10b981"))
                cornerRadius = 12 * density
            }
            background = btnBg
            setPadding(dpToPx(14), dpToPx(6), dpToPx(14), dpToPx(6))
            setOnClickListener {
                // Open LIFEOS
                val openIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                }
                if (openIntent != null) {
                    startActivity(openIntent)
                }
                removeOverlay()
            }
        }
        btnContainer.addView(focusBtn)
        rootLayout.addView(btnContainer)

        overlayView = rootLayout

        try {
            windowManager?.addView(overlayView, params)
            // Auto dismiss after 12 seconds so it never traps the user
            handler.postDelayed(autoDismissRunnable, 12000)
        } catch (e: Exception) {
            stopSelf()
        }
    }

    private fun removeOverlay() {
        handler.removeCallbacks(autoDismissRunnable)
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
