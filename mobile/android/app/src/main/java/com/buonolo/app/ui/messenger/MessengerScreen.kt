package com.buonolo.app.ui.messenger

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
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
import com.buonolo.app.data.api.dto.ConversationDto
import com.buonolo.app.data.api.dto.MessageDto
import com.buonolo.app.data.api.dto.SendMessageRequest
import com.buonolo.app.ui.common.LambdaViewModelFactory
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MessengerViewModel(private val container: AppContainer) : ViewModel() {
    private val _conversations = MutableStateFlow<List<ConversationDto>>(emptyList())
    val conversations: StateFlow<List<ConversationDto>> = _conversations.asStateFlow()

    private val _thread = MutableStateFlow<List<MessageDto>>(emptyList())
    val thread: StateFlow<List<MessageDto>> = _thread.asStateFlow()

    init {
        loadConversations()
    }

    fun loadConversations() {
        viewModelScope.launch { runCatching { container.api.conversations() }.onSuccess { _conversations.value = it.conversations } }
    }

    fun openThread(userId: String) {
        viewModelScope.launch { runCatching { container.api.messages(userId) }.onSuccess { _thread.value = it.messages } }
    }

    fun send(userId: String, text: String) {
        viewModelScope.launch {
            runCatching { container.api.sendMessage(userId, SendMessageRequest(text)) }
                .onSuccess { _thread.value = _thread.value + it.message }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessengerScreen(container: AppContainer, currentUserId: String, initialCounterpartId: String?, onBack: () -> Unit) {
    val viewModel: MessengerViewModel = viewModel(factory = LambdaViewModelFactory { MessengerViewModel(container) })
    var activeCounterpart by remember { mutableStateOf<Pair<String, String>?>(null) } // id to display name

    LaunchedEffect(initialCounterpartId) {
        if (initialCounterpartId != null) {
            activeCounterpart = initialCounterpartId to "Chat"
            viewModel.openThread(initialCounterpartId)
        }
    }

    val conversations by viewModel.conversations.collectAsState()
    val thread by viewModel.thread.collectAsState()
    var input by remember { mutableStateOf("") }
    val active = activeCounterpart

    if (active != null) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(active.second) },
                    navigationIcon = { IconButton(onClick = { activeCounterpart = null }) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } },
                )
            },
            bottomBar = {
                Row(Modifier.fillMaxWidth().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(value = input, onValueChange = { input = it }, placeholder = { Text("Aa") }, modifier = Modifier.weight(1f))
                    IconButton(onClick = {
                        if (input.isNotBlank()) { viewModel.send(active.first, input); input = "" }
                    }) { Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send") }
                }
            },
        ) { padding ->
            LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp)) {
                items(thread, key = { it.id }) { m ->
                    val isMe = m.senderId == currentUserId
                    Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = if (isMe) Arrangement.End else Arrangement.Start) {
                        ElevatedCard { Text(m.content, modifier = Modifier.padding(10.dp)) }
                    }
                }
            }
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Messenger") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } },
            )
        },
    ) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp)) {
            items(conversations, key = { it.counterpart.id }) { c ->
                ListItem(
                    headlineContent = { Text(c.counterpart.fullName, fontWeight = FontWeight.Bold) },
                    supportingContent = { Text(c.lastMessage.content, maxLines = 1) },
                    modifier = Modifier.clickable {
                        activeCounterpart = c.counterpart.id to c.counterpart.fullName
                        viewModel.openThread(c.counterpart.id)
                    },
                )
                HorizontalDivider()
            }
        }
    }
}
