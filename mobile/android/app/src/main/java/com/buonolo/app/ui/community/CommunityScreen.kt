package com.buonolo.app.ui.community

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.buonolo.app.AppContainer
import com.buonolo.app.data.api.dto.*
import com.buonolo.app.ui.common.LambdaViewModelFactory
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

private enum class CommunitySubTab { Groups, Events, People }

class CommunityViewModel(private val container: AppContainer) : ViewModel() {
    private val _groups = MutableStateFlow<List<GroupDto>>(emptyList())
    val groups: StateFlow<List<GroupDto>> = _groups.asStateFlow()

    private val _events = MutableStateFlow<List<EventDto>>(emptyList())
    val events: StateFlow<List<EventDto>> = _events.asStateFlow()

    private val _people = MutableStateFlow<List<UserSummaryDto>>(emptyList())
    val people: StateFlow<List<UserSummaryDto>> = _people.asStateFlow()

    init {
        refreshAll()
    }

    fun refreshAll() {
        viewModelScope.launch { runCatching { container.api.groups() }.onSuccess { _groups.value = it.groups } }
        viewModelScope.launch { runCatching { container.api.events() }.onSuccess { _events.value = it.events } }
        viewModelScope.launch { runCatching { container.api.searchUsers() }.onSuccess { _people.value = it.users } }
    }

    fun joinGroup(id: String) {
        viewModelScope.launch { runCatching { container.api.joinGroup(id) }.onSuccess { refreshAll() } }
    }

    fun createGroup(name: String, description: String) {
        viewModelScope.launch { runCatching { container.api.createGroup(CreateGroupRequest(name, description)) }.onSuccess { refreshAll() } }
    }

    fun rsvp(event: EventDto) {
        viewModelScope.launch {
            runCatching { if (event.attending) container.api.cancelRsvp(event.id) else container.api.rsvpEvent(event.id) }
                .onSuccess { refreshAll() }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CommunityScreen(container: AppContainer, profile: ProfileDto, onMessageUser: (String) -> Unit) {
    val viewModel: CommunityViewModel = viewModel(factory = LambdaViewModelFactory { CommunityViewModel(container) })
    var subTab by remember { mutableStateOf(CommunitySubTab.Groups) }
    var showCreateGroup by remember { mutableStateOf(false) }

    val groups by viewModel.groups.collectAsState()
    val events by viewModel.events.collectAsState()
    val people by viewModel.people.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Community") },
                actions = {
                    TextButton(onClick = { showCreateGroup = true }) { Text("New group") }
                },
            )
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            TabRow(selectedTabIndex = subTab.ordinal) {
                CommunitySubTab.entries.forEach { t ->
                    Tab(selected = subTab == t, onClick = { subTab = t }, text = { Text(t.name) })
                }
            }
            when (subTab) {
                CommunitySubTab.Groups -> LazyColumn(contentPadding = PaddingValues(16.dp)) {
                    items(groups, key = { it.id }) { g ->
                        ListItem(
                            leadingContent = { Text(g.emoji, style = MaterialTheme.typography.headlineSmall) },
                            headlineContent = { Text(g.name, fontWeight = FontWeight.Bold) },
                            supportingContent = { Text("${g.membersCount} members") },
                            trailingContent = {
                                if (!g.joined) TextButton(onClick = { viewModel.joinGroup(g.id) }) { Text("Join") }
                                else Text("Joined", style = MaterialTheme.typography.labelMedium)
                            },
                        )
                        HorizontalDivider()
                    }
                }
                CommunitySubTab.Events -> LazyColumn(contentPadding = PaddingValues(16.dp)) {
                    items(events, key = { it.id }) { e ->
                        ListItem(
                            headlineContent = { Text(e.title, fontWeight = FontWeight.Bold) },
                            supportingContent = { Text("${e.location} · ${e.attendeesCount} joining") },
                            trailingContent = {
                                TextButton(onClick = { viewModel.rsvp(e) }) { Text(if (e.attending) "Going ✓" else "RSVP") }
                            },
                        )
                        HorizontalDivider()
                    }
                }
                CommunitySubTab.People -> LazyColumn(contentPadding = PaddingValues(16.dp)) {
                    items(people, key = { it.id }) { p ->
                        ListItem(
                            headlineContent = { Text(p.fullName, fontWeight = FontWeight.Bold) },
                            supportingContent = { Text("from ${p.origin ?: "somewhere new"}") },
                            trailingContent = { TextButton(onClick = { onMessageUser(p.id) }) { Text("Message") } },
                        )
                        HorizontalDivider()
                    }
                }
            }
        }
    }

    if (showCreateGroup) {
        var name by remember { mutableStateOf("") }
        var description by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showCreateGroup = false },
            title = { Text("Create group") },
            text = {
                Column {
                    OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name") }, modifier = Modifier.fillMaxWidth())
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth())
                }
            },
            confirmButton = {
                TextButton(enabled = name.isNotBlank(), onClick = { viewModel.createGroup(name, description); showCreateGroup = false }) { Text("Create") }
            },
            dismissButton = { TextButton(onClick = { showCreateGroup = false }) { Text("Cancel") } },
        )
    }
}
