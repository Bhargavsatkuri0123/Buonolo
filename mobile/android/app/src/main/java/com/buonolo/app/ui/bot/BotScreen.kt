package com.buonolo.app.ui.bot

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
import com.buonolo.app.data.api.dto.BotChatMessage
import com.buonolo.app.data.api.dto.BotChatRequest
import com.buonolo.app.ui.common.LambdaViewModelFactory
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class BotMessage(val text: String, val isMe: Boolean)

class BotViewModel(private val container: AppContainer) : ViewModel() {
    private val _messages = MutableStateFlow(listOf(BotMessage("Hello! I am Mr O, your immigration assistant. Ask me anything!", false)))
    val messages: StateFlow<List<BotMessage>> = _messages.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    fun send(text: String) {
        _messages.value = _messages.value + BotMessage(text, true)
        _loading.value = true
        viewModelScope.launch {
            val history = _messages.value.takeLast(10).map { BotChatMessage(if (it.isMe) "user" else "model", it.text) }
            runCatching { container.api.botChat(BotChatRequest(text, history)) }
                .onSuccess { _messages.value = _messages.value + BotMessage(it.reply, false) }
                .onFailure { _messages.value = _messages.value + BotMessage(it.message ?: "Sorry, I'm having trouble responding right now.", false) }
            _loading.value = false
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BotScreen(container: AppContainer, onBack: () -> Unit) {
    val viewModel: BotViewModel = viewModel(factory = LambdaViewModelFactory { BotViewModel(container) })
    val messages by viewModel.messages.collectAsState()
    val loading by viewModel.loading.collectAsState()
    var input by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mr O (Assistant)") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } },
            )
        },
        bottomBar = {
            Row(Modifier.fillMaxWidth().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(value = input, onValueChange = { input = it }, placeholder = { Text("Ask Mr O...") }, modifier = Modifier.weight(1f))
                IconButton(onClick = { if (input.isNotBlank() && !loading) { viewModel.send(input); input = "" } }) {
                    Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send")
                }
            }
        },
    ) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp)) {
            items(messages) { m ->
                Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = if (m.isMe) Arrangement.End else Arrangement.Start) {
                    ElevatedCard {
                        Text(m.text, modifier = Modifier.padding(10.dp))
                    }
                }
            }
            if (loading) item { Text("Mr O is typing…", fontWeight = FontWeight.Light, modifier = Modifier.padding(8.dp)) }
        }
    }
}
