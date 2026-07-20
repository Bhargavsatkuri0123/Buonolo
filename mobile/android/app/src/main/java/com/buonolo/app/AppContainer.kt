package com.buonolo.app

import android.content.Context
import com.buonolo.app.data.TokenStore
import com.buonolo.app.data.api.ApiClient
import com.buonolo.app.data.api.ApiService
import com.buonolo.app.data.ws.WsGateway

/** Small manual DI container — avoids pulling in a DI framework for an app this size. */
class AppContainer(context: Context) {
    private val httpBaseUrl: String = BuildConfig.API_BASE_URL
    private val wsBaseUrl: String = httpBaseUrl.replaceFirst("http", "ws")

    val tokenStore = TokenStore(context.applicationContext)
    val api: ApiService = ApiClient.create(httpBaseUrl, tokenStore)
    val wsGateway = WsGateway(wsBaseUrl)
}
