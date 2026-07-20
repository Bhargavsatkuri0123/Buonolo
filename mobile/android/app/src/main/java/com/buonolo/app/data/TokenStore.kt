package com.buonolo.app.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Refresh tokens are the long-lived credential, so they're kept in EncryptedSharedPreferences
 * (backed by the Android Keystore). The access token is short-lived and only ever kept in memory.
 */
class TokenStore(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "buonolo_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    @Volatile
    var accessToken: String? = null
        private set

    fun setAccessToken(token: String?) {
        accessToken = token
    }

    var refreshToken: String?
        get() = prefs.getString(KEY_REFRESH_TOKEN, null)
        set(value) {
            prefs.edit().putString(KEY_REFRESH_TOKEN, value).apply()
        }

    fun clear() {
        accessToken = null
        prefs.edit().remove(KEY_REFRESH_TOKEN).apply()
    }

    companion object {
        private const val KEY_REFRESH_TOKEN = "refresh_token"
    }
}
