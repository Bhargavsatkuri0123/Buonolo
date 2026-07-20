package com.buonolo.app.ui.auth

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.buonolo.app.data.api.dto.ProfileDto
import com.buonolo.app.ui.SessionViewModel

private val HOST_COUNTRIES = listOf(
    "Germany", "France", "Spain", "Portugal", "Netherlands", "United Kingdom", "United States",
    "Canada", "Australia", "Italy", "Sweden", "Ireland", "Other",
)
private val SITUATIONS = listOf("Work / Employment", "Study / Education", "Family Reunion", "Freelancing / Business", "Seeking Asylum / Protection", "Just Exploring")
private val FOCUS_AREAS = listOf("Anmeldung", "Visa / Permits", "Housing", "Banking", "Health Insurance", "Social Circle")

@Composable
fun AuthNavHost(sessionViewModel: SessionViewModel, needsSetupProfile: ProfileDto?) {
    val navController = rememberNavController()
    val authError by sessionViewModel.authError.collectAsState()

    if (needsSetupProfile != null) {
        SetupFlow(sessionViewModel, needsSetupProfile, authError)
        return
    }

    NavHost(navController = navController, startDestination = "intro") {
        composable("intro") { IntroScreen(onEmail = { navController.navigate("login") }) }
        composable("login") {
            AuthForm(
                title = "Log in",
                isRegister = false,
                error = authError,
                onSubmit = { email, password, _ -> sessionViewModel.login(email, password) },
                onSwitch = { navController.navigate("register") },
                onBack = { navController.popBackStack() },
            )
        }
        composable("register") {
            AuthForm(
                title = "Sign up",
                isRegister = true,
                error = authError,
                onSubmit = { email, password, name -> sessionViewModel.register(email, password, name) },
                onSwitch = { navController.navigate("login") },
                onBack = { navController.popBackStack() },
            )
        }
    }
}

@Composable
private fun IntroScreen(onEmail: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("buonôlô", style = MaterialTheme.typography.displaySmall, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text("Your companion for settling in with confidence.", style = MaterialTheme.typography.bodyMedium)
        Spacer(Modifier.height(48.dp))
        Button(onClick = onEmail, modifier = Modifier.fillMaxWidth()) { Text("Continue with Email") }
    }
}

@Composable
private fun AuthForm(
    title: String,
    isRegister: Boolean,
    error: String?,
    onSubmit: (email: String, password: String, name: String) -> Unit,
    onSwitch: () -> Unit,
    onBack: () -> Unit,
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }

    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text(title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(24.dp))
        if (isRegister) {
            OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full name") }, modifier = Modifier.fillMaxWidth())
            Spacer(Modifier.height(12.dp))
        }
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = password, onValueChange = { password = it }, label = { Text("Password") },
            visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
        )
        if (error != null) {
            Spacer(Modifier.height(8.dp))
            Text(error, color = MaterialTheme.colorScheme.error)
        }
        Spacer(Modifier.height(20.dp))
        Button(
            onClick = { onSubmit(email, password, name) },
            enabled = email.isNotBlank() && password.isNotBlank() && (!isRegister || name.isNotBlank()),
            modifier = Modifier.fillMaxWidth(),
        ) { Text(if (isRegister) "Create account" else "Log in") }
        TextButton(onClick = onSwitch, modifier = Modifier.fillMaxWidth()) {
            Text(if (isRegister) "Already have an account? Log in" else "Don't have an account? Sign up")
        }
    }
}

@Composable
private fun SetupFlow(sessionViewModel: SessionViewModel, profile: ProfileDto, error: String?) {
    var step by remember { mutableStateOf(0) }
    var origin by remember { mutableStateOf("") }
    var host by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var situation by remember { mutableStateOf("") }
    var focus by remember { mutableStateOf("") }

    if (step == 0) {
        Column(Modifier.fillMaxSize().padding(24.dp)) {
            Text("Welcome, ${profile.name.substringBefore(' ')}!", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("Let's tailor buonôlô to your journey.", style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(20.dp))
            OutlinedTextField(value = origin, onValueChange = { origin = it }, label = { Text("Your nationality") }, modifier = Modifier.fillMaxWidth())
            Spacer(Modifier.height(12.dp))
            Text("Host country", style = MaterialTheme.typography.labelLarge)
            LazyColumn(Modifier.weight(1f)) {
                items(HOST_COUNTRIES) { c ->
                    ListItem(
                        headlineContent = { Text(c) },
                        trailingContent = { if (host == c) Text("✓") },
                        modifier = Modifier.clickable { host = c },
                    )
                }
            }
            OutlinedTextField(value = city, onValueChange = { city = it }, label = { Text("Current city") }, modifier = Modifier.fillMaxWidth())
            Spacer(Modifier.height(12.dp))
            Button(
                onClick = { step = 1 },
                enabled = origin.isNotBlank() && host.isNotBlank() && city.isNotBlank(),
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Next: Personalise") }
        }
    } else {
        Column(Modifier.fillMaxSize().padding(24.dp)) {
            Text("Quick assessment", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(16.dp))
            Text("What brings you to $city?", style = MaterialTheme.typography.labelLarge)
            SITUATIONS.forEach { opt ->
                FilterChipRow(opt, situation == opt) { situation = opt }
            }
            Spacer(Modifier.height(16.dp))
            Text("Your primary focus right now:", style = MaterialTheme.typography.labelLarge)
            FOCUS_AREAS.forEach { opt ->
                FilterChipRow(opt, focus == opt) { focus = opt }
            }
            if (error != null) {
                Spacer(Modifier.height(8.dp))
                Text(error, color = MaterialTheme.colorScheme.error)
            }
            Spacer(Modifier.height(20.dp))
            Row {
                OutlinedButton(onClick = { step = 0 }, modifier = Modifier.weight(1f)) { Text("Back") }
                Spacer(Modifier.width(8.dp))
                Button(
                    onClick = { sessionViewModel.completeSetup(profile.name, origin, host, city, situation, focus) },
                    modifier = Modifier.weight(2f),
                ) { Text("Start my journey") }
            }
        }
    }
}

@Composable
private fun FilterChipRow(label: String, selected: Boolean, onClick: () -> Unit) {
    FilterChip(selected = selected, onClick = onClick, label = { Text(label) }, modifier = Modifier.padding(vertical = 4.dp))
}
