package com.buonolo.app.ui.me

import android.content.Intent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import com.buonolo.app.AppContainer
import com.buonolo.app.BuildConfig
import com.buonolo.app.data.api.dto.ProfileDto
import com.buonolo.app.data.api.dto.UpdateProfileRequest
import com.buonolo.app.ui.SessionViewModel
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MeScreen(container: AppContainer, profile: ProfileDto, sessionViewModel: SessionViewModel) {
    var notificationsEnabled by remember { mutableStateOf(profile.notificationsEnabled) }
    var showDeleteConfirm by remember { mutableStateOf(false) }
    var exporting by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    Scaffold(topBar = { TopAppBar(title = { Text("Me") }) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(16.dp)) {
            Text(profile.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text(profile.handle, style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(4.dp))
            Text("${profile.origin} → ${profile.host} · ${profile.city}", style = MaterialTheme.typography.bodySmall)
            Spacer(Modifier.height(8.dp))
            Text(profile.bio, style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(16.dp))
            Row {
                Text("${profile.followers} followers", modifier = Modifier.padding(end = 16.dp))
                Text("${profile.following} following")
            }

            Spacer(Modifier.height(24.dp))
            HorizontalDivider()

            Row(Modifier.fillMaxWidth().padding(vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("Community notifications", modifier = Modifier.weight(1f))
                Switch(
                    checked = notificationsEnabled,
                    onCheckedChange = { checked ->
                        notificationsEnabled = checked
                        scope.launch { runCatching { container.api.updateProfile(UpdateProfileRequest(notificationsEnabled = checked)) } }
                    },
                )
            }
            HorizontalDivider()

            TextButton(
                enabled = !exporting,
                onClick = {
                    exporting = true
                    scope.launch {
                        runCatching {
                            val data = container.api.exportData()
                            val dir = File(context.cacheDir, "exports").apply { mkdirs() }
                            val file = File(dir, "buonolo-data-export.json")
                            file.writeText(Json.encodeToString(JsonElement.serializer(), data))
                            val uri = FileProvider.getUriForFile(context, "${BuildConfig.APPLICATION_ID}.fileprovider", file)
                            val intent = Intent(Intent.ACTION_SEND).apply {
                                type = "application/json"
                                putExtra(Intent.EXTRA_STREAM, uri)
                                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                            }
                            context.startActivity(Intent.createChooser(intent, "Save or share your data"))
                        }
                        exporting = false
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text(if (exporting) "Preparing…" else "Download my data") }

            TextButton(onClick = { showDeleteConfirm = true }, modifier = Modifier.fillMaxWidth()) {
                Text("Delete account", color = MaterialTheme.colorScheme.error)
            }

            Spacer(Modifier.weight(1f))
            Button(onClick = { sessionViewModel.logout() }, modifier = Modifier.fillMaxWidth()) { Text("Sign out") }
        }
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("Delete account?") },
            text = { Text("This permanently removes your posts, messages, and settings. This cannot be undone.") },
            confirmButton = {
                TextButton(onClick = {
                    showDeleteConfirm = false
                    scope.launch {
                        runCatching { container.api.deleteAccount() }
                        sessionViewModel.logout()
                    }
                }) { Text("Delete", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = { TextButton(onClick = { showDeleteConfirm = false }) { Text("Cancel") } },
        )
    }
}
