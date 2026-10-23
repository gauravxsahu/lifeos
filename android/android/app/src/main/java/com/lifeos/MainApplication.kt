package com.lifeos

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.shell.MainReactPackage
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                listOf(
                    MainReactPackage(),
                    LifeOSPackage()
                )

            override fun getJSMainModuleName(): String = "index"
            override fun getBundleAssetName(): String = "index.android.bundle"
            override fun getUseDeveloperSupport(): Boolean = false
            override val isNewArchEnabled: Boolean = false
            override val isHermesEnabled: Boolean = true
        }

    override fun onCreate() {
        super.onCreate()
        try {
            SoLoader.init(this, OpenSourceMergedSoMapping)
        } catch (e: Exception) {
            SoLoader.init(this, false)
        }
    }
}
