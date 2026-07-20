import Foundation

struct AuthResponse: Codable {
    let accessToken: String
    let refreshToken: String?
    let profile: Profile
}

struct Profile: Codable, Equatable {
    let id: String
    let name: String
    let handle: String
    let email: String
    let origin: String?
    let host: String?
    let city: String?
    let bio: String
    let followers: Int
    let following: Int
    let notificationsEnabled: Bool

    var needsSetup: Bool {
        (origin?.isEmpty ?? true) || (host?.isEmpty ?? true) || (city?.isEmpty ?? true)
    }
}

struct ProfileEnvelope: Codable { let profile: Profile }

struct AuthorRef: Codable, Equatable, Identifiable {
    let id: String
    let fullName: String
    let handle: String?
}

struct Post: Codable, Identifiable, Equatable {
    let id: String
    let author: AuthorRef
    let content: String
    let attachment: String?
    let bgTheme: String?
    let feeling: String?
    let location: String?
    let privacy: String
    var tags: [AuthorRef]
    let createdAt: String
    var likesCount: Int
    var commentsCount: Int
    var myReaction: String?
    var saved: Bool
}

struct FeedResponse: Codable { let posts: [Post]; let nextCursor: String? }
struct PostEnvelope: Codable { let post: Post }

struct Comment: Codable, Identifiable, Equatable {
    let id: String
    let content: String
    let createdAt: String
    let author: AuthorRef
}
struct CommentsResponse: Codable { let comments: [Comment] }
struct CommentEnvelope: Codable { let comment: Comment }

struct GoalStep: Codable, Identifiable, Equatable {
    let id: String
    let text: String
    let description: String
    let tool: String
    var done: Bool
}

struct Goal: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    let category: String
    let iconName: String
    var steps: [GoalStep]
}
struct GoalsResponse: Codable { let goals: [Goal] }
struct GoalEnvelope: Codable { let goal: Goal }
struct GoalStepEnvelope: Codable { let step: GoalStep }

struct GoalTemplate: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    let category: String
    let iconName: String
    let weeks: String
}
struct GoalTemplatesResponse: Codable { let templates: [GoalTemplate] }

struct Group: Codable, Identifiable, Equatable {
    let id: String
    let name: String
    let description: String?
    let category: String?
    let emoji: String
    let membersCount: Int
    var joined: Bool
}
struct GroupsResponse: Codable { let groups: [Group] }
struct GroupEnvelope: Codable { let group: Group }

struct EventItem: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    let description: String?
    let image: String
    let date: String
    let location: String
    let attendeesCount: Int
    var attending: Bool
}
struct EventsResponse: Codable { let events: [EventItem] }

struct UserSummary: Codable, Identifiable, Equatable {
    let id: String
    let fullName: String
    let handle: String?
    let origin: String?
    let bio: String?
}
struct UsersResponse: Codable { let users: [UserSummary] }

struct Message: Codable, Identifiable, Equatable {
    let id: String
    let senderId: String
    let receiverId: String
    let content: String
    let isRead: Bool
    let createdAt: String
}
struct MessagesResponse: Codable { let messages: [Message] }
struct MessageEnvelope: Codable { let message: Message }

struct Conversation: Codable, Identifiable, Equatable {
    let counterpart: UserSummary
    let lastMessage: Message
    let unreadCount: Int
    var id: String { counterpart.id }
}
struct ConversationsResponse: Codable { let conversations: [Conversation] }

struct AppNotification: Codable, Identifiable, Equatable {
    let id: String
    let type: String
    let title: String
    let body: String
    let isRead: Bool
    let createdAt: String
}
struct NotificationsResponse: Codable { let notifications: [AppNotification] }

struct HostInfoToolItem: Codable, Identifiable, Equatable {
    let name: String
    let desc: String
    let icon: String
    var id: String { name }
}
struct HostInfoToolSection: Codable, Identifiable, Equatable {
    let label: String
    let items: [HostInfoToolItem]
    var id: String { label }
}
struct HostInfoEmergency: Codable, Identifiable, Equatable {
    let label: String
    let num: String
    var id: String { label }
}
struct HostInfo: Codable, Equatable {
    let welcomeMessage: String
    let emergency: [HostInfoEmergency]
    let toolSections: [HostInfoToolSection]
}
struct HostInfoEnvelope: Codable { let hostInfo: HostInfo? }

struct BotChatMessage: Codable { let role: String; let text: String }
struct BotChatResponse: Codable { let reply: String }

struct ApiErrorBody: Codable { let error: String? }
