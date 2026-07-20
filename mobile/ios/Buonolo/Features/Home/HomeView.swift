import SwiftUI

struct HomeView: View {
    let profile: Profile
    let onOpenMessenger: () -> Void

    @StateObject private var viewModel = HomeViewModel()
    @State private var showComposer = false
    @State private var showBot = false
    @State private var expandedPostId: String?

    var body: some View {
        NavigationStack {
            List(viewModel.feed) { post in
                PostCardView(
                    post: post,
                    isMine: post.author.id == profile.id,
                    isExpanded: expandedPostId == post.id,
                    onLike: { Task { await viewModel.toggleLike(post) } },
                    onSave: { Task { await viewModel.toggleSave(post) } },
                    onDelete: { Task { await viewModel.deletePost(post) } },
                    onFollow: { Task { await viewModel.toggleFollow(post.author.id, currentlyFollowing: false) } },
                    onToggleComments: { expandedPostId = expandedPostId == post.id ? nil : post.id }
                )
            }
            .listStyle(.plain)
            .navigationTitle("buon")
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    Button { showBot = true } label: { Image(systemName: "sparkles") }
                    Button { onOpenMessenger() } label: { Image(systemName: "bubble.left.and.bubble.right") }
                    Button { showComposer = true } label: { Image(systemName: "square.and.pencil") }
                }
            }
            .task { await viewModel.loadFeed() }
            .refreshable { await viewModel.loadFeed() }
            .sheet(isPresented: $showComposer) {
                ComposerView { text in
                    Task { await viewModel.createPost(text: text) }
                    showComposer = false
                }
            }
            .fullScreenCover(isPresented: $showBot) {
                BotView()
            }
        }
    }
}

private struct ComposerView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var text = ""
    let onSubmit: (String) -> Void

    var body: some View {
        NavigationStack {
            TextEditor(text: $text)
                .padding()
                .navigationTitle("Create post")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Post") { onSubmit(text) }.disabled(text.isEmpty)
                    }
                }
        }
    }
}

private struct PostCardView: View {
    let post: Post
    let isMine: Bool
    let isExpanded: Bool
    let onLike: () -> Void
    let onSave: () -> Void
    let onDelete: () -> Void
    let onFollow: () -> Void
    let onToggleComments: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading) {
                    Text(post.author.fullName).fontWeight(.bold)
                    Text(String(post.createdAt.prefix(10))).font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                if isMine {
                    Button(role: .destructive, action: onDelete) { Image(systemName: "trash") }
                } else {
                    Button("Follow", action: onFollow).font(.caption)
                }
            }
            Text(post.content)
            HStack(spacing: 20) {
                Button(action: onLike) {
                    Label("\(post.likesCount)", systemImage: post.myReaction != nil ? "heart.fill" : "heart")
                }
                .tint(post.myReaction != nil ? .orange : .primary)
                Button(action: onToggleComments) {
                    Label("\(post.commentsCount)", systemImage: "bubble.right")
                }
                Spacer()
                Button(action: onSave) {
                    Image(systemName: post.saved ? "bookmark.fill" : "bookmark")
                }
            }
            .font(.subheadline)
            .buttonStyle(.plain)

            if isExpanded {
                CommentsView(postId: post.id)
            }
        }
        .padding(.vertical, 6)
    }
}

private struct CommentsView: View {
    let postId: String
    @State private var comments: [Comment] = []
    @State private var text = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Divider()
            ForEach(comments) { c in
                HStack(alignment: .top) {
                    Text(c.author.fullName).fontWeight(.semibold).font(.caption)
                    Text(c.content).font(.caption)
                }
            }
            HStack {
                TextField("Write a comment...", text: $text)
                Button {
                    let toSend = text
                    text = ""
                    Task {
                        struct Body: Encodable { let content: String }
                        guard let body = try? await APIClient.shared.encode(Body(content: toSend)) else { return }
                        if let envelope: CommentEnvelope = try? await APIClient.shared.request("api/posts/\(postId)/comments", method: .post, body: body) {
                            comments.append(envelope.comment)
                        }
                    }
                } label: { Image(systemName: "paperplane.fill") }
                .disabled(text.isEmpty)
            }
        }
        .task {
            if let response: CommentsResponse = try? await APIClient.shared.request("api/posts/\(postId)/comments") {
                comments = response.comments
            }
        }
    }
}
