package com.buonolo.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.buonolo.app.AppContainer
import com.buonolo.app.data.api.dto.CreateGoalRequest
import com.buonolo.app.data.api.dto.LoginRequest
import com.buonolo.app.data.api.dto.NewGoalStep
import com.buonolo.app.data.api.dto.ProfileDto
import com.buonolo.app.data.api.dto.RefreshRequest
import com.buonolo.app.data.api.dto.RegisterRequest
import com.buonolo.app.data.api.dto.UpdateProfileRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface SessionState {
    data object Loading : SessionState
    data object LoggedOut : SessionState
    data class NeedsSetup(val profile: ProfileDto) : SessionState
    data class Ready(val profile: ProfileDto) : SessionState
}

class SessionViewModel(private val container: AppContainer) : ViewModel() {
    private val _state = MutableStateFlow<SessionState>(SessionState.Loading)
    val state: StateFlow<SessionState> = _state.asStateFlow()

    private val _authError = MutableStateFlow<String?>(null)
    val authError: StateFlow<String?> = _authError.asStateFlow()

    /** Real IDs the current user follows — used to render Follow/Following state in the feed. */
    val followingIds = mutableSetOf<String>()

    init {
        restoreSession()
    }

    private fun toState(profile: ProfileDto): SessionState =
        if (profile.needsSetup) SessionState.NeedsSetup(profile) else SessionState.Ready(profile)

    fun restoreSession() {
        viewModelScope.launch {
            val refreshToken = container.tokenStore.refreshToken
            if (refreshToken == null) {
                _state.value = SessionState.LoggedOut
                return@launch
            }
            runCatching {
                val auth = container.api.refresh(RefreshRequest(refreshToken))
                container.tokenStore.setAccessToken(auth.accessToken)
                auth.refreshToken?.let { container.tokenStore.refreshToken = it }
                auth.profile
            }.onSuccess { profile ->
                _state.value = toState(profile)
                connectRealtime()
            }.onFailure {
                container.tokenStore.clear()
                _state.value = SessionState.LoggedOut
            }
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _authError.value = null
            runCatching { container.api.login(LoginRequest(email, password)) }
                .onSuccess { auth ->
                    container.tokenStore.setAccessToken(auth.accessToken)
                    auth.refreshToken?.let { container.tokenStore.refreshToken = it }
                    _state.value = toState(auth.profile)
                    connectRealtime()
                }
                .onFailure { _authError.value = it.message ?: "Login failed" }
        }
    }

    fun register(email: String, password: String, fullName: String) {
        viewModelScope.launch {
            _authError.value = null
            runCatching { container.api.register(RegisterRequest(email, password, fullName)) }
                .onSuccess { auth ->
                    container.tokenStore.setAccessToken(auth.accessToken)
                    auth.refreshToken?.let { container.tokenStore.refreshToken = it }
                    _state.value = toState(auth.profile)
                }
                .onFailure { _authError.value = it.message ?: "Registration failed" }
        }
    }

    fun completeSetup(fullName: String, origin: String, host: String, city: String, situation: String, focus: String) {
        viewModelScope.launch {
            _authError.value = null
            runCatching {
                container.api.updateProfile(
                    UpdateProfileRequest(
                        fullName = fullName,
                        origin = origin,
                        host = host,
                        city = city,
                        bio = "Moving for $situation. Currently focused on $focus.",
                    )
                )
            }.onSuccess { envelope ->
                if (focus.isNotBlank() && focus != "General") {
                    val category = when (focus) {
                        "Anmeldung" -> "Documentation"
                        "Housing" -> "Housing"
                        else -> "General"
                    }
                    runCatching {
                        container.api.createGoal(
                            CreateGoalRequest(
                                title = "Start with $focus",
                                category = category,
                                steps = listOf(NewGoalStep(text = "Research $focus in $city", description = "Initial research step for $focus.")),
                            )
                        )
                    }
                }
                _state.value = toState(envelope.profile)
                connectRealtime()
            }.onFailure { _authError.value = it.message ?: "Failed to save profile" }
        }
    }

    fun refreshProfile() {
        viewModelScope.launch {
            runCatching { container.api.me() }.onSuccess { _state.value = toState(it.profile) }
        }
    }

    private fun connectRealtime() {
        container.tokenStore.accessToken?.let { container.wsGateway.connect(it) }
    }

    fun logout() {
        viewModelScope.launch {
            runCatching {
                container.tokenStore.refreshToken?.let { container.api.logout(RefreshRequest(it)) }
            }
            container.wsGateway.disconnect()
            container.tokenStore.clear()
            followingIds.clear()
            _state.value = SessionState.LoggedOut
        }
    }
}
