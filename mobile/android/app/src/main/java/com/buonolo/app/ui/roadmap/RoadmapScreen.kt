package com.buonolo.app.ui.roadmap

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
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

class RoadmapViewModel(private val container: AppContainer) : ViewModel() {
    private val _goals = MutableStateFlow<List<GoalDto>>(emptyList())
    val goals: StateFlow<List<GoalDto>> = _goals.asStateFlow()

    private val _templates = MutableStateFlow<List<GoalTemplateDto>>(emptyList())
    val templates: StateFlow<List<GoalTemplateDto>> = _templates.asStateFlow()

    init {
        loadGoals()
    }

    fun loadGoals() {
        viewModelScope.launch { runCatching { container.api.goals() }.onSuccess { _goals.value = it.goals } }
    }

    fun loadTemplates() {
        viewModelScope.launch { runCatching { container.api.goalTemplates() }.onSuccess { _templates.value = it.templates } }
    }

    fun addFromTemplate(templateId: String) {
        viewModelScope.launch { runCatching { container.api.createGoalFromTemplate(templateId) }.onSuccess { _goals.value = _goals.value + it.goal } }
    }

    fun addCustomGoal(title: String) {
        viewModelScope.launch {
            runCatching {
                container.api.createGoal(CreateGoalRequest(title = title, category = "Custom", steps = listOf(NewGoalStep("First step", "Break down your goal into smaller tasks."))))
            }.onSuccess { _goals.value = _goals.value + it.goal }
        }
    }

    fun toggleStep(goalId: String, step: GoalStepDto) {
        _goals.value = _goals.value.map { g ->
            if (g.id != goalId) g else g.copy(steps = g.steps.map { if (it.id == step.id) it.copy(done = !it.done) else it })
        }
        viewModelScope.launch { runCatching { container.api.updateStep(goalId, step.id, UpdateStepRequest(!step.done)) }.onFailure { loadGoals() } }
    }
}

@Composable
fun RoadmapScreen(container: AppContainer, profile: ProfileDto) {
    val viewModel: RoadmapViewModel = viewModel(factory = LambdaViewModelFactory { RoadmapViewModel(container) })
    val goals by viewModel.goals.collectAsState()
    val templates by viewModel.templates.collectAsState()
    var showTemplates by remember { mutableStateOf(false) }
    var openGoalId by remember { mutableStateOf<String?>(null) }

    val openGoal = goals.find { it.id == openGoalId }
    if (openGoal != null) {
        GoalDetailScreen(goal = openGoal, onBack = { openGoalId = null }, onToggleStep = { step -> viewModel.toggleStep(openGoal.id, step) })
        return
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Roadmap") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { showTemplates = true; viewModel.loadTemplates() }) { Icon(Icons.Default.Add, null) }
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            Text(
                "Micro-goals for settling into ${profile.host}.",
                modifier = Modifier.padding(16.dp),
                style = MaterialTheme.typography.bodyMedium,
            )
            LazyColumn(contentPadding = PaddingValues(horizontal = 16.dp)) {
                items(goals, key = { it.id }) { goal ->
                    val done = goal.steps.count { it.done }
                    val pct = if (goal.steps.isEmpty()) 0 else (done * 100 / goal.steps.size)
                    ElevatedCard(Modifier.fillMaxWidth().padding(bottom = 10.dp)) {
                        Column(Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                                Column(Modifier.weight(1f)) {
                                    Text(goal.title, fontWeight = FontWeight.Bold)
                                    Text("${goal.category} · $done/${goal.steps.size} steps", style = MaterialTheme.typography.labelSmall)
                                }
                                Text("$pct%", fontWeight = FontWeight.Bold)
                            }
                            Spacer(Modifier.height(8.dp))
                            LinearProgressIndicator(progress = { pct / 100f }, modifier = Modifier.fillMaxWidth())
                            Spacer(Modifier.height(8.dp))
                            TextButton(onClick = { openGoalId = goal.id }) { Text("Open") }
                        }
                    }
                }
            }
        }
    }

    if (showTemplates) {
        ModalBottomSheet(onDismissRequest = { showTemplates = false }) {
            var customTitle by remember { mutableStateOf("") }
            Column(Modifier.padding(16.dp)) {
                Text("Choose a goal", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(12.dp))
                Row {
                    OutlinedTextField(value = customTitle, onValueChange = { customTitle = it }, placeholder = { Text("Or create a custom goal...") }, modifier = Modifier.weight(1f))
                    TextButton(onClick = {
                        if (customTitle.isNotBlank()) { viewModel.addCustomGoal(customTitle); showTemplates = false }
                    }) { Text("Add") }
                }
                Spacer(Modifier.height(12.dp))
                templates.forEach { t ->
                    ListItem(
                        headlineContent = { Text(t.title) },
                        supportingContent = { Text("${t.category} · typically ${t.weeks}") },
                        modifier = Modifier.clickable { viewModel.addFromTemplate(t.id); showTemplates = false },
                    )
                }
            }
        }
    }
}

@Composable
private fun GoalDetailScreen(goal: GoalDto, onBack: () -> Unit, onToggleStep: (GoalStepDto) -> Unit) {
    Scaffold(topBar = {
        TopAppBar(
            title = { Text(goal.title) },
            navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } },
        )
    }) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp)) {
            items(goal.steps, key = { it.id }) { step ->
                Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.Top) {
                    Checkbox(checked = step.done, onCheckedChange = { onToggleStep(step) })
                    Column {
                        Text(step.text, fontWeight = FontWeight.SemiBold)
                        if (step.description.isNotBlank()) Text(step.description, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}
