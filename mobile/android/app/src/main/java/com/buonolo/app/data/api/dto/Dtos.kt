package com.buonolo.app.data.api.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String? = null,
    val profile: ProfileDto,
)

@Serializable
data class ProfileDto(
    val id: String,
    val name: String,
    val handle: String,
    val email: String,
    val origin: String? = null,
    val host: String? = null,
    val city: String? = null,
    val bio: String = "",
    val followers: Int = 0,
    val following: Int = 0,
    val notificationsEnabled: Boolean = true,
) {
    val needsSetup: Boolean get() = origin.isNullOrBlank() || host.isNullOrBlank() || city.isNullOrBlank()
}

@Serializable
data class ProfileEnvelope(val profile: ProfileDto)

@Serializable
data class AuthorDto(val id: String, val fullName: String, val handle: String? = null)

@Serializable
data class PostDto(
    val id: String,
    val author: AuthorDto,
    val content: String,
    val attachment: String? = null,
    val bgTheme: String? = null,
    val feeling: String? = null,
    val location: String? = null,
    val privacy: String,
    val tags: List<AuthorDto> = emptyList(),
    val createdAt: String,
    val likesCount: Int,
    val commentsCount: Int,
    val myReaction: String? = null,
    val saved: Boolean = false,
)

@Serializable
data class FeedResponse(val posts: List<PostDto>, val nextCursor: String? = null)

@Serializable
data class PostEnvelope(val post: PostDto)

@Serializable
data class CreatePostRequest(
    val content: String,
    val attachment: String? = null,
    val bgTheme: String? = null,
    val feeling: String? = null,
    val location: String? = null,
    val privacy: String = "PUBLIC",
    val taggedUserIds: List<String> = emptyList(),
)

@Serializable
data class ReactionRequest(val emoji: String = "👍")

@Serializable
data class CommentDto(
    val id: String,
    val content: String,
    val createdAt: String,
    val author: AuthorDto,
)

@Serializable
data class CommentsResponse(val comments: List<CommentDto>)

@Serializable
data class CommentEnvelope(val comment: CommentDto)

@Serializable
data class CreateCommentRequest(val content: String)

@Serializable
data class GoalStepDto(
    val id: String,
    val text: String,
    val description: String = "",
    val tool: String = "",
    val done: Boolean = false,
)

@Serializable
data class GoalDto(
    val id: String,
    val title: String,
    val category: String,
    val iconName: String = "Target",
    val steps: List<GoalStepDto> = emptyList(),
)

@Serializable
data class GoalsResponse(val goals: List<GoalDto>)

@Serializable
data class NewGoalStep(val text: String, val description: String = "", val tool: String = "")

@Serializable
data class CreateGoalRequest(
    val title: String,
    val category: String,
    val iconName: String = "Target",
    val steps: List<NewGoalStep> = emptyList(),
)

@Serializable
data class GoalEnvelope(val goal: GoalDto)

@Serializable
data class GoalStepEnvelope(val step: GoalStepDto)

@Serializable
data class GoalTemplateDto(
    val id: String,
    val title: String,
    val category: String,
    val iconName: String,
    val weeks: String,
)

@Serializable
data class GoalTemplatesResponse(val templates: List<GoalTemplateDto>)

@Serializable
data class UpdateStepRequest(val done: Boolean)

@Serializable
data class CreateGoalStepRequest(val text: String, val description: String = "", val tool: String = "")

@Serializable
data class GroupDto(
    val id: String,
    val name: String,
    val description: String? = null,
    val category: String? = null,
    val emoji: String = "🏘️",
    val adminId: String? = null,
    val membersCount: Int = 0,
    val joined: Boolean = false,
)

@Serializable
data class GroupsResponse(val groups: List<GroupDto>)

@Serializable
data class GroupEnvelope(val group: GroupDto)

@Serializable
data class CreateGroupRequest(val name: String, val description: String? = null, val category: String? = null, val emoji: String? = null)

@Serializable
data class EventDto(
    val id: String,
    val title: String,
    val description: String? = null,
    val image: String = "📅",
    val date: String,
    val location: String,
    val attendeesCount: Int = 0,
    val attending: Boolean = false,
)

@Serializable
data class EventsResponse(val events: List<EventDto>)

@Serializable
data class UserSummaryDto(
    val id: String,
    val fullName: String,
    val handle: String? = null,
    val origin: String? = null,
    val bio: String? = null,
)

@Serializable
data class UsersResponse(val users: List<UserSummaryDto>)

@Serializable
data class MessageDto(
    val id: String,
    val senderId: String,
    val receiverId: String,
    val content: String,
    val isRead: Boolean = false,
    val createdAt: String,
)

@Serializable
data class MessagesResponse(val messages: List<MessageDto>)

@Serializable
data class MessageEnvelope(val message: MessageDto)

@Serializable
data class SendMessageRequest(val content: String)

@Serializable
data class ConversationDto(
    val counterpart: UserSummaryDto,
    val lastMessage: MessageDto,
    val unreadCount: Int = 0,
)

@Serializable
data class ConversationsResponse(val conversations: List<ConversationDto>)

@Serializable
data class NotificationDto(
    val id: String,
    val type: String,
    val title: String,
    val body: String,
    val isRead: Boolean,
    val createdAt: String,
)

@Serializable
data class NotificationsResponse(val notifications: List<NotificationDto>)

@Serializable
data class HostInfoToolItemDto(
    val name: String,
    val desc: String,
    val icon: String = "Wrench",
)

@Serializable
data class HostInfoToolSectionDto(
    val label: String,
    val items: List<HostInfoToolItemDto>,
)

@Serializable
data class HostInfoEmergencyDto(val label: String, val num: String)

@Serializable
data class HostInfoDto(
    val welcomeMessage: String = "",
    val emergency: List<HostInfoEmergencyDto> = emptyList(),
    val toolSections: List<HostInfoToolSectionDto> = emptyList(),
)

@Serializable
data class HostInfoEnvelope(val hostInfo: HostInfoDto? = null)

@Serializable
data class RegisterRequest(val email: String, val password: String, val fullName: String)

@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class RefreshRequest(val refreshToken: String)

@Serializable
data class UpdateProfileRequest(
    val fullName: String? = null,
    val origin: String? = null,
    val host: String? = null,
    val city: String? = null,
    val bio: String? = null,
    val notificationsEnabled: Boolean? = null,
)

@Serializable
data class BotChatMessage(val role: String, val text: String)

@Serializable
data class BotChatRequest(val message: String, val history: List<BotChatMessage> = emptyList())

@Serializable
data class BotChatResponse(val reply: String)

@Serializable
data class ErrorResponse(val error: String? = null)
