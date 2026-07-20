package com.buonolo.app.ui.tools

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.buonolo.app.AppContainer
import com.buonolo.app.data.api.dto.HostInfoDto
import com.buonolo.app.data.api.dto.HostInfoToolItemDto
import com.buonolo.app.data.api.dto.ProfileDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ToolsScreen(container: AppContainer, profile: ProfileDto) {
    var hostInfo by remember { mutableStateOf<HostInfoDto?>(null) }
    var selectedTool by remember { mutableStateOf<HostInfoToolItemDto?>(null) }

    LaunchedEffect(profile.host, profile.city) {
        val host = profile.host ?: return@LaunchedEffect
        val city = profile.city ?: return@LaunchedEffect
        runCatching { container.api.hostInfo(host, city, profile.origin ?: "") }.onSuccess { hostInfo = it.hostInfo }
    }

    val tool = selectedTool
    if (tool != null) {
        Scaffold(topBar = {
            TopAppBar(
                title = { Text(tool.name) },
                navigationIcon = { IconButton(onClick = { selectedTool = null }) { Icon(androidx.compose.material.icons.Icons.AutoMirrored.Filled.ArrowBack, null) } },
            )
        }) { padding ->
            Column(Modifier.padding(padding).padding(16.dp)) {
                Text(tool.desc, style = MaterialTheme.typography.bodyLarge)
            }
        }
        return
    }

    Scaffold(topBar = { TopAppBar(title = { Text("Tools") }) }) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp)) {
            hostInfo?.toolSections?.forEach { section ->
                item {
                    Text(section.label, fontWeight = FontWeight.Bold, modifier = Modifier.padding(vertical = 8.dp))
                }
                items(section.items) { item ->
                    ElevatedCard(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                        onClick = { selectedTool = item },
                    ) {
                        Column(Modifier.padding(12.dp)) {
                            Text(item.name, fontWeight = FontWeight.Bold)
                            Text(item.desc, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}
