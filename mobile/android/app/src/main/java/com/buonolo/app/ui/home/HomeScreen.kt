package com.buonolo.app.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.buonolo.app.AppContainer
import com.buonolo.app.data.api.dto.CommentDto
import com.buonolo.app.data.api.dto.CreateCommentRequest
import com.buonolo.app.data.api.dto.PostDto
import com.buonolo.app.data.api.dto.ProfileDto
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    container: AppContainer,
    profile: ProfileDto,
    viewModel: HomeViewModel,
    onOpenBot: () -> Unit,
    onOpenMessenger: () -> Unit,
) {
    val feed by viewModel.feed.collectAsState()
    var showComposer by remember { mutableStateOf(false) }
    var expandedComments by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("buon", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = onOpenBot) { Icon(Icons.Default.SmartToy, contentDescription = "Mr O") }
                    IconButton(onClick = onOpenMessenger) { Icon(Icons.Default.ChatBubble, contentDescription = "Messages") }
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showComposer = true }) { Icon(Icons.Default.Add, contentDescription = "New post") }
        },
    ) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(12.dp)) {
            items(feed, key = { it.id }) { post ->
                PostCard(
                    post = post,
                    isMine = post.author.id == profile.id,
                    onLike = { viewModel.toggleLike(post) },
                    onSave = { viewModel.toggleSave(post) },
                    onDelete = { viewModel.deletePost(post) },
                    onFollow = { viewModel.toggleFollow(post.author.id, false) },
                    expanded = expandedComments == post.id,
                    onToggleComments = { expandedComments = if (expandedComments == post.id) null else post.id },
                    container = container,
                    profile = profile,
                )
                Spacer(Modifier.height(10.dp))
            }
        }
    }

    if (showComposer) {
        ComposerDialog(onDismiss = { showComposer = false }, onSubmit = { text -> viewModel.createPost(text); showComposer = false })
    }
}

@Composable
private fun ComposerDialog(onDismiss: () -> Unit, onSubmit: (String) -> Unit) {
    var text by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create post") },
        text = { OutlinedTextField(value = text, onValueChange = { text = it }, placeholder = { Text("What's on your mind?") }, modifier = Modifier.fillMaxWidth()) },
        confirmButton = { TextButton(onClick = { if (text.isNotBlank()) onSubmit(text) }, enabled = text.isNotBlank()) { Text("Post") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}

@Composable
private fun PostCard(
    post: PostDto,
    isMine: Boolean,
    onLike: () -> Unit,
    onSave: () -> Unit,
    onDelete: () -> Unit,
    onFollow: () -> Unit,
    expanded: Boolean,
    onToggleComments: () -> Unit,
    container: AppContainer,
    profile: ProfileDto,
) {
    ElevatedCard(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(post.author.fullName, fontWeight = FontWeight.Bold)
                    Text(post.createdAt.take(10), style = MaterialTheme.typography.labelSmall)
                }
                if (isMine) {
                    IconButton(onClick = onDelete) { Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error) }
                } else {
                    TextButton(onClick = onFollow) { Text("Follow") }
                }
            }
            Spacer(Modifier.height(6.dp))
            Text(post.content)
            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onLike) {
                    Icon(
                        if (post.myReaction != null) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Like",
                        tint = if (post.myReaction != null) MaterialTheme.colorScheme.primary else LocalContentColor.current,
                    )
                }
                Text("${post.likesCount}")
                Spacer(Modifier.width(12.dp))
                IconButton(onClick = onToggleComments) { Icon(Icons.AutoMirrored.Filled.Comment, contentDescription = "Comments") }
                Text("${post.commentsCount}")
                Spacer(Modifier.weight(1f))
                IconButton(onClick = onSave) {
                    Icon(
                        if (post.saved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                        contentDescription = "Save",
                        tint = if (post.saved) MaterialTheme.colorScheme.primary else LocalContentColor.current,
                    )
                }
            }
            if (expanded) {
                CommentsSection(container = container, postId = post.id, profile = profile)
            }
        }
    }
}

@Composable
private fun CommentsSection(container: AppContainer, postId: String, profile: ProfileDto) {
    var comments by remember { mutableStateOf<List<CommentDto>>(emptyList()) }
    var text by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

    LaunchedEffect(postId) {
        runCatching { container.api.comments(postId) }.onSuccess { comments = it.comments }
    }

    Column(Modifier.padding(top = 8.dp)) {
        HorizontalDivider()
        comments.forEach { c ->
            Row(Modifier.padding(vertical = 4.dp)) {
                Text(c.author.fullName, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodySmall)
                Spacer(Modifier.width(6.dp))
                Text(c.content, style = MaterialTheme.typography.bodySmall)
            }
        }
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 6.dp)) {
            OutlinedTextField(
                value = text, onValueChange = { text = it }, placeholder = { Text("Write a comment...") },
                modifier = Modifier.weight(1f), singleLine = true,
            )
            IconButton(onClick = {
                if (text.isNotBlank()) {
                    val toSend = text
                    text = ""
                    scope.launch {
                        runCatching { container.api.addComment(postId, CreateCommentRequest(toSend)) }
                            .onSuccess { comments = comments + it.comment }
                    }
                }
            }) { Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send") }
        }
    }
}
