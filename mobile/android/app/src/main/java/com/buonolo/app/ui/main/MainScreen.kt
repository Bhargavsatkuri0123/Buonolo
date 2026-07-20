package com.buonolo.app.ui.main

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.buonolo.app.AppContainer
import com.buonolo.app.data.api.dto.ProfileDto
import com.buonolo.app.ui.SessionViewModel
import com.buonolo.app.ui.bot.BotScreen
import com.buonolo.app.ui.common.LambdaViewModelFactory
import com.buonolo.app.ui.community.CommunityScreen
import com.buonolo.app.ui.home.HomeScreen
import com.buonolo.app.ui.home.HomeViewModel
import com.buonolo.app.ui.me.MeScreen
import com.buonolo.app.ui.messenger.MessengerScreen
import com.buonolo.app.ui.roadmap.RoadmapScreen
import com.buonolo.app.ui.tools.ToolsScreen

private enum class Tab(val label: String) { Home("Home"), Roadmap("Roadmap"), Community("Community"), Tools("Tools"), Me("Me") }

@Composable
fun MainScreen(container: AppContainer, profile: ProfileDto, sessionViewModel: SessionViewModel) {
    var tab by remember { mutableStateOf(Tab.Home) }
    var showBot by remember { mutableStateOf(false) }
    var showMessenger by remember { mutableStateOf(false) }
    var messengerTargetUserId by remember { mutableStateOf<String?>(null) }

    val homeViewModel: HomeViewModel = viewModel(factory = LambdaViewModelFactory { HomeViewModel(container) })

    if (showBot) {
        BotScreen(container = container, onBack = { showBot = false })
        return
    }
    if (showMessenger) {
        MessengerScreen(
            container = container,
            currentUserId = profile.id,
            initialCounterpartId = messengerTargetUserId,
            onBack = { showMessenger = false; messengerTargetUserId = null },
        )
        return
    }

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(selected = tab == Tab.Home, onClick = { tab = Tab.Home }, icon = { Icon(Icons.Default.Home, null) }, label = { Text("Home") })
                NavigationBarItem(selected = tab == Tab.Roadmap, onClick = { tab = Tab.Roadmap }, icon = { Icon(Icons.Default.Map, null) }, label = { Text("Roadmap") })
                NavigationBarItem(selected = tab == Tab.Community, onClick = { tab = Tab.Community }, icon = { Icon(Icons.Default.Groups, null) }, label = { Text("Community") })
                NavigationBarItem(selected = tab == Tab.Tools, onClick = { tab = Tab.Tools }, icon = { Icon(Icons.Default.Handyman, null) }, label = { Text("Tools") })
                NavigationBarItem(selected = tab == Tab.Me, onClick = { tab = Tab.Me }, icon = { Icon(Icons.Default.Person, null) }, label = { Text("Me") })
            }
        },
    ) { padding ->
        Box(Modifier.padding(padding)) {
            when (tab) {
                Tab.Home -> HomeScreen(
                    container = container,
                    profile = profile,
                    viewModel = homeViewModel,
                    onOpenBot = { showBot = true },
                    onOpenMessenger = { showMessenger = true },
                )
                Tab.Roadmap -> RoadmapScreen(container = container, profile = profile)
                Tab.Community -> CommunityScreen(
                    container = container,
                    profile = profile,
                    onMessageUser = { userId -> messengerTargetUserId = userId; showMessenger = true },
                )
                Tab.Tools -> ToolsScreen(container = container, profile = profile)
                Tab.Me -> MeScreen(container = container, profile = profile, sessionViewModel = sessionViewModel)
            }
        }
    }
}
