package com.buonolo.app.data.api

import com.buonolo.app.data.api.dto.*
import kotlinx.serialization.json.JsonElement
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterRequest): AuthResponse

    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @POST("api/auth/refresh")
    suspend fun refresh(@Body body: RefreshRequest): AuthResponse

    @POST("api/auth/logout")
    suspend fun logout(@Body body: RefreshRequest): Response<Unit>

    @GET("api/auth/me")
    suspend fun me(): ProfileEnvelope

    @PATCH("api/users/me")
    suspend fun updateProfile(@Body body: UpdateProfileRequest): ProfileEnvelope

    @DELETE("api/users/me")
    suspend fun deleteAccount(): Response<Unit>

    @GET("api/users/me/export")
    suspend fun exportData(): JsonElement

    @GET("api/users/search")
    suspend fun searchUsers(@Query("q") q: String? = null): UsersResponse

    @GET("api/users/me/following")
    suspend fun following(): UsersResponse

    @POST("api/users/{id}/follow")
    suspend fun follow(@Path("id") id: String): Response<Unit>

    @DELETE("api/users/{id}/follow")
    suspend fun unfollow(@Path("id") id: String): Response<Unit>

    @GET("api/posts")
    suspend fun feed(@Query("authorId") authorId: String? = null, @Query("savedOnly") savedOnly: Boolean? = null): FeedResponse

    @POST("api/posts")
    suspend fun createPost(@Body body: CreatePostRequest): PostEnvelope

    @DELETE("api/posts/{id}")
    suspend fun deletePost(@Path("id") id: String): Response<Unit>

    @PUT("api/posts/{id}/reaction")
    suspend fun react(@Path("id") id: String, @Body body: ReactionRequest): Response<Unit>

    @DELETE("api/posts/{id}/reaction")
    suspend fun unreact(@Path("id") id: String): Response<Unit>

    @PUT("api/posts/{id}/save")
    suspend fun savePost(@Path("id") id: String): Response<Unit>

    @DELETE("api/posts/{id}/save")
    suspend fun unsavePost(@Path("id") id: String): Response<Unit>

    @GET("api/posts/{id}/comments")
    suspend fun comments(@Path("id") id: String): CommentsResponse

    @POST("api/posts/{id}/comments")
    suspend fun addComment(@Path("id") id: String, @Body body: CreateCommentRequest): CommentEnvelope

    @GET("api/goals")
    suspend fun goals(): GoalsResponse

    @POST("api/goals")
    suspend fun createGoal(@Body body: CreateGoalRequest): GoalEnvelope

    @POST("api/goals/from-template/{templateId}")
    suspend fun createGoalFromTemplate(@Path("templateId") templateId: String): GoalEnvelope

    @DELETE("api/goals/{id}")
    suspend fun deleteGoal(@Path("id") id: String): Response<Unit>

    @PATCH("api/goals/{goalId}/steps/{stepId}")
    suspend fun updateStep(@Path("goalId") goalId: String, @Path("stepId") stepId: String, @Body body: UpdateStepRequest): GoalStepEnvelope

    @POST("api/goals/{goalId}/steps")
    suspend fun addStep(@Path("goalId") goalId: String, @Body body: CreateGoalStepRequest): GoalStepEnvelope

    @GET("api/content/goal-templates")
    suspend fun goalTemplates(): GoalTemplatesResponse

    @GET("api/content/host-info")
    suspend fun hostInfo(@Query("host") host: String, @Query("city") city: String, @Query("origin") origin: String): HostInfoEnvelope

    @GET("api/groups")
    suspend fun groups(): GroupsResponse

    @POST("api/groups")
    suspend fun createGroup(@Body body: CreateGroupRequest): GroupEnvelope

    @GET("api/groups/{id}")
    suspend fun group(@Path("id") id: String): GroupEnvelope

    @POST("api/groups/{id}/join")
    suspend fun joinGroup(@Path("id") id: String): Response<Unit>

    @DELETE("api/groups/{id}/join")
    suspend fun leaveGroup(@Path("id") id: String): Response<Unit>

    @GET("api/events")
    suspend fun events(): EventsResponse

    @POST("api/events/{id}/rsvp")
    suspend fun rsvpEvent(@Path("id") id: String): Response<Unit>

    @DELETE("api/events/{id}/rsvp")
    suspend fun cancelRsvp(@Path("id") id: String): Response<Unit>

    @GET("api/messages/conversations")
    suspend fun conversations(): ConversationsResponse

    @GET("api/messages/{userId}")
    suspend fun messages(@Path("userId") userId: String): MessagesResponse

    @POST("api/messages/{userId}")
    suspend fun sendMessage(@Path("userId") userId: String, @Body body: SendMessageRequest): MessageEnvelope

    @GET("api/notifications")
    suspend fun notifications(): NotificationsResponse

    @POST("api/notifications/read-all")
    suspend fun markAllNotificationsRead(): Response<Unit>

    @POST("api/bot/chat")
    suspend fun botChat(@Body body: BotChatRequest): BotChatResponse
}
