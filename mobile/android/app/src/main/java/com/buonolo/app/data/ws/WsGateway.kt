package com.buonolo.app.data.ws

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.concurrent.TimeUnit
import kotlin.math.min

data class WsEvent(val type: String, val payload: JsonElement)

/** Thin wrapper around the backend's plain-WebSocket gateway with exponential-backoff reconnect. */
class WsGateway(private val wsBaseUrl: String) {
    private val client = OkHttpClient.Builder().pingInterval(30, TimeUnit.SECONDS).build()
    private val json = Json { ignoreUnknownKeys = true }
    private var socket: WebSocket? = null
    private var retryDelayMs = 1000L
    private var stopped = false
    private var currentToken: String? = null

    private val _events = MutableSharedFlow<WsEvent>(extraBufferCapacity = 64)
    val events: SharedFlow<WsEvent> = _events

    fun connect(accessToken: String) {
        stopped = false
        currentToken = accessToken
        openSocket(accessToken)
    }

    private fun openSocket(accessToken: String) {
        val request = Request.Builder().url("$wsBaseUrl/ws?token=$accessToken").build()
        socket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: okhttp3.Response) {
                retryDelayMs = 1000
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                runCatching {
                    val obj = json.parseToJsonElement(text).jsonObject
                    val type = obj["type"]?.jsonPrimitive?.content ?: return
                    val payload = obj["payload"] ?: return
                    _events.tryEmit(WsEvent(type, payload))
                }
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                scheduleReconnect()
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: okhttp3.Response?) {
                scheduleReconnect()
            }
        })
    }

    private fun scheduleReconnect() {
        if (stopped) return
        val token = currentToken ?: return
        Thread {
            Thread.sleep(retryDelayMs)
            retryDelayMs = min(retryDelayMs * 2, 30_000)
            if (!stopped) openSocket(token)
        }.start()
    }

    fun disconnect() {
        stopped = true
        socket?.close(1000, "client closing")
        socket = null
    }
}
