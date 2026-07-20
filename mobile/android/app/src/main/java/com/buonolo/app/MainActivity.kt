package com.buonolo.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.buonolo.app.ui.SessionState
import com.buonolo.app.ui.SessionViewModel
import com.buonolo.app.ui.auth.AuthNavHost
import com.buonolo.app.ui.common.LambdaViewModelFactory
import com.buonolo.app.ui.main.MainScreen
import com.buonolo.app.ui.theme.BuonoloTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.ui.Alignment

class MainActivity : ComponentActivity() {
    private val sessionViewModel: SessionViewModel by viewModels {
        LambdaViewModelFactory { SessionViewModel((application as BuonoloApplication).container) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val container = (application as BuonoloApplication).container
        setContent {
            BuonoloTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    Root(sessionViewModel, container)
                }
            }
        }
    }
}

@Composable
private fun Root(sessionViewModel: SessionViewModel, container: AppContainer) {
    val state by sessionViewModel.state.collectAsState()
    when (val s = state) {
        is SessionState.Loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        is SessionState.LoggedOut -> AuthNavHost(sessionViewModel, needsSetupProfile = null)
        is SessionState.NeedsSetup -> AuthNavHost(sessionViewModel, needsSetupProfile = s.profile)
        is SessionState.Ready -> MainScreen(container = container, profile = s.profile, sessionViewModel = sessionViewModel)
    }
}
