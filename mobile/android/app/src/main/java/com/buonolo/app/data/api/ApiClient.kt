package com.buonolo.app.data.api

import com.buonolo.app.BuildConfig
import com.buonolo.app.data.TokenStore
import kotlinx.serialization.json.Json
import okhttp3.Authenticator
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Route
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Builds the shared Retrofit/OkHttp client. Access tokens live only in memory (TokenStore);
 * a 401 triggers a synchronous refresh-and-retry via OkHttp's Authenticator, which is the
 * standard place for this pattern since it runs on the network thread already holding the lock
 * for this route, avoiding races between concurrent requests that all hit 401 at once.
 */
object ApiClient {
    private val json = Json { ignoreUnknownKeys = true }

    fun create(baseUrl: String, tokenStore: TokenStore): ApiService {
        val plainClient = OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build()

        fun doRefresh(): Boolean {
            val refreshToken = tokenStore.refreshToken ?: return false
            val body = """{"refreshToken":"$refreshToken"}""".toRequestBody("application/json".toMediaType())
            val request = Request.Builder().url("$baseUrl/api/auth/refresh").post(body).build()
            return try {
                plainClient.newCall(request).execute().use { resp ->
                    if (!resp.isSuccessful) return false
                    val text = resp.body?.string() ?: return false
                    val parsed = json.decodeFromString(com.buonolo.app.data.api.dto.AuthResponse.serializer(), text)
                    tokenStore.setAccessToken(parsed.accessToken)
                    parsed.refreshToken?.let { tokenStore.refreshToken = it }
                    true
                }
            } catch (e: Exception) {
                false
            }
        }

        val authClient = OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .addInterceptor { chain ->
                val original = chain.request()
                val withAuth = tokenStore.accessToken?.let {
                    original.newBuilder().addHeader("Authorization", "Bearer $it").build()
                } ?: original
                chain.proceed(withAuth)
            }
            .authenticator(object : Authenticator {
                override fun authenticate(route: Route?, response: okhttp3.Response): Request? {
                    // Never loop forever: if we've already retried once for this request, give up.
                    if (responseCount(response) >= 2) return null
                    if (!doRefresh()) return null
                    val newToken = tokenStore.accessToken ?: return null
                    return response.request.newBuilder()
                        .header("Authorization", "Bearer $newToken")
                        .build()
                }
            })
            .apply {
                if (BuildConfig.DEBUG) {
                    addInterceptor(HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BASIC))
                }
            }
            .build()

        val contentType = "application/json".toMediaType()
        val retrofit = Retrofit.Builder()
            .baseUrl(if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/")
            .client(authClient)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()

        return retrofit.create(ApiService::class.java)
    }

    private fun responseCount(response: okhttp3.Response): Int {
        var count = 1
        var prior = response.priorResponse
        while (prior != null) {
            count++
            prior = prior.priorResponse
        }
        return count
    }
}
