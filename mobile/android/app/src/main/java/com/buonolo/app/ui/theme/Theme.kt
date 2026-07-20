package com.buonolo.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val BuonoloOrange = Color(0xFFF97316)
val BuonoloOrangeDark = Color(0xFFEA580C)
val BuonoloCream = Color(0xFFFFF7ED)

private val LightColors = lightColorScheme(
    primary = BuonoloOrange,
    secondary = BuonoloOrangeDark,
    background = BuonoloCream,
    surface = Color.White,
)

private val DarkColors = darkColorScheme(
    primary = BuonoloOrange,
    secondary = BuonoloOrangeDark,
    background = Color(0xFF0B1220),
    surface = Color(0xFF111827),
)

@Composable
fun BuonoloTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = MaterialTheme.typography,
        content = content,
    )
}
