package com.lifeos

import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.facebook.react.bridge.*
import java.util.Locale

class TextToSpeechModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isInitialized = false

    override fun getName(): String {
        return "TextToSpeechModule"
    }

    private fun ensureTts() {
        if (tts == null) {
            try {
                tts = TextToSpeech(reactContext.applicationContext, this)
            } catch (e: Exception) {
                isInitialized = false
            }
        }
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
    fun speak(text: String, languageCode: String, speedRate: Float, promise: Promise) {
        ensureTts()
        if (tts == null) {
            promise.reject("TTS_NOT_AVAILABLE", "TTS Engine could not be created")
            return
        }

        try {
            val locale = when (languageCode.lowercase()) {
                "hi" -> Locale("hi", "IN")
                "hinglish" -> Locale("hi", "IN")
                "bn" -> Locale("bn", "IN")
                "ta" -> Locale("ta", "IN")
                "te" -> Locale("te", "IN")
                "mr" -> Locale("mr", "IN")
                "gu" -> Locale("gu", "IN")
                "pa" -> Locale("pa", "IN")
                "kn" -> Locale("kn", "IN")
                "ml" -> Locale("ml", "IN")
                else -> Locale.ENGLISH
            }

            tts?.language = locale
            tts?.setSpeechRate(speedRate)

            val utteranceId = "LIFEOS_REMINDER_${System.currentTimeMillis()}"
            val result = tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)

            if (result == TextToSpeech.SUCCESS) {
                promise.resolve(true)
            } else {
                promise.reject("TTS_SPEAK_ERROR", "Speech playback failed to queue")
            }
        } catch (e: Exception) {
            promise.reject("TTS_EXCEPTION", e.message, e)
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
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (e: Exception) {
            // Ignore on shutdown
        }
        super.onCatalystInstanceDestroy()
    }
}
