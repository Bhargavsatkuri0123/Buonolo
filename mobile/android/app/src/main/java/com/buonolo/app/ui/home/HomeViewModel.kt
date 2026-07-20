package com.buonolo.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.buonolo.app.AppContainer
import com.buonolo.app.data.api.dto.CreatePostRequest
import com.buonolo.app.data.api.dto.PostDto
import com.buonolo.app.data.api.dto.ReactionRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class HomeViewModel(private val container: AppContainer) : ViewModel() {
    private val _feed = MutableStateFlow<List<PostDto>>(emptyList())
    val feed: StateFlow<List<PostDto>> = _feed.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    init {
        loadFeed()
    }

    fun loadFeed() {
        viewModelScope.launch {
            _loading.value = true
            runCatching { container.api.feed() }.onSuccess { _feed.value = it.posts }
            _loading.value = false
        }
    }

    fun createPost(text: String, privacy: String = "PUBLIC") {
        viewModelScope.launch {
            runCatching { container.api.createPost(CreatePostRequest(content = text, privacy = privacy)) }
                .onSuccess { envelope -> _feed.value = listOf(envelope.post) + _feed.value }
        }
    }

    fun toggleLike(post: PostDto) {
        val wasLiked = post.myReaction != null
        updatePost(post.id) { it.copy(myReaction = if (wasLiked) null else "👍", likesCount = it.likesCount + if (wasLiked) -1 else 1) }
        viewModelScope.launch {
            runCatching {
                if (wasLiked) container.api.unreact(post.id) else container.api.react(post.id, ReactionRequest("👍"))
            }.onFailure { loadFeed() }
        }
    }

    fun toggleSave(post: PostDto) {
        val wasSaved = post.saved
        updatePost(post.id) { it.copy(saved = !wasSaved) }
        viewModelScope.launch {
            runCatching { if (wasSaved) container.api.unsavePost(post.id) else container.api.savePost(post.id) }
                .onFailure { updatePost(post.id) { it.copy(saved = wasSaved) } }
        }
    }

    fun deletePost(post: PostDto) {
        _feed.value = _feed.value.filterNot { it.id == post.id }
        viewModelScope.launch { runCatching { container.api.deletePost(post.id) }.onFailure { loadFeed() } }
    }

    fun toggleFollow(authorId: String, currentlyFollowing: Boolean) {
        viewModelScope.launch {
            runCatching { if (currentlyFollowing) container.api.unfollow(authorId) else container.api.follow(authorId) }
        }
    }

    private fun updatePost(id: String, transform: (PostDto) -> PostDto) {
        _feed.value = _feed.value.map { if (it.id == id) transform(it) else it }
    }
}
