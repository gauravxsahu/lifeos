package com.lifeos

import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.facebook.react.bridge.*
import java.util.Locale

class TextToSpeechModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isInitialized = false

    init {
        tts = TextToSpeech(reactContext, this)
    }

    override fun getName(): String {
        return "TextToSpeechModule"
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true
            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {}
                override fun onDone(utteranceId: String?) {}
                override fun onError(utteranceId: String?) {}
            })
        } else {
            isInitialized = false
        }
    }

    @ReactMethod
    fun speak(text: String, langCode: String, rate: Float, promise: Promise) {
        if (!isInitialized || tts == null) {
            promise.reject("TTS_NOT_INITIALIZED", "Android TextToSpeech engine not ready")
            return
        }

        try {
            val locale = when (langCode.lowercase()) {
                "hi", "hinglish" -> Locale("hi", "IN")
                "bn" -> Locale("bn", "IN")
                "ta" -> Locale("ta", "IN")
                "te" -> Locale("te", "IN")
                "mr" -> Locale("mr", "IN")
                "gu" -> Locale("gu", "IN")
                "pa" -> Locale("pa", "IN")
                "kn" -> Locale("kn", "IN")
                "ml" -> Locale("ml", "IN")
                else -> Locale.US
            }

            tts?.language = locale
            tts?.setSpeechRate(rate)

            val utteranceId = "lifeos_${System.currentTimeMillis()}"
            val result = tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)

            if (result == TextToSpeech.SUCCESS) {
                promise.resolve(true)
            } else {
                promise.reject("TTS_SPEAK_FAILED", "Failed to enqueue speech")
            }
        } catch (e: Exception) {
            promise.reject("TTS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            tts?.stop()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("TTS_STOP_ERROR", e.message, e)
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        tts?.stop()
        tts?.shutdown()
    }
}
