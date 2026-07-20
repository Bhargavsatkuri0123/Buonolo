import Foundation

@MainActor
final class HomeViewModel: ObservableObject {
    @Published var feed: [Post] = []
    @Published var isLoading = false

    private let client = APIClient.shared

    func loadFeed() async {
        isLoading = true
        if let response: FeedResponse = try? await client.request("api/posts") {
            feed = response.posts
        }
        isLoading = false
    }

    func createPost(text: String) async {
        struct Body: Encodable { let content: String; let privacy: String }
        guard let body = try? await client.encode(Body(content: text, privacy: "PUBLIC")) else { return }
        if let envelope: PostEnvelope = try? await client.request("api/posts", method: .post, body: body) {
            feed.insert(envelope.post, at: 0)
        }
    }

    func toggleLike(_ post: Post) async {
        let wasLiked = post.myReaction != nil
        update(post.id) { $0.myReaction = wasLiked ? nil : "👍"; $0.likesCount += wasLiked ? -1 : 1 }
        struct Body: Encodable { let emoji: String }
        if wasLiked {
            _ = try? await client.requestRawData("api/posts/\(post.id)/reaction", method: .delete)
        } else if let body = try? await client.encode(Body(emoji: "👍")) {
            _ = try? await client.requestRawData("api/posts/\(post.id)/reaction", method: .put, body: body)
        }
    }

    func toggleSave(_ post: Post) async {
        let wasSaved = post.saved
        update(post.id) { $0.saved = !wasSaved }
        let method: HTTPMethod = wasSaved ? .delete : .put
        _ = try? await client.requestRawData("api/posts/\(post.id)/save", method: method)
    }

    func deletePost(_ post: Post) async {
        feed.removeAll { $0.id == post.id }
        _ = try? await client.requestRawData("api/posts/\(post.id)", method: .delete)
    }

    func toggleFollow(_ authorId: String, currentlyFollowing: Bool) async {
        let method: HTTPMethod = currentlyFollowing ? .delete : .post
        _ = try? await client.requestRawData("api/users/\(authorId)/follow", method: method)
    }

    private func update(_ id: String, _ transform: (inout Post) -> Void) {
        guard let index = feed.firstIndex(where: { $0.id == id }) else { return }
        transform(&feed[index])
    }
}
