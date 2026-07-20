import Foundation

enum SessionState: Equatable {
    case loading
    case loggedOut
    case needsSetup(Profile)
    case ready(Profile)
}

@MainActor
final class SessionStore: ObservableObject {
    @Published private(set) var state: SessionState = .loading
    @Published var authError: String?

    /// Real IDs the current user follows — used to render Follow/Following state in the feed.
    var followingIds: Set<String> = []

    private let client = APIClient.shared

    func restoreSession() async {
        guard let refreshToken = await TokenStore.shared.refreshToken else {
            state = .loggedOut
            return
        }
        do {
            let body = try await client.encode(["refreshToken": refreshToken])
            let auth: AuthResponse = try await client.request("api/auth/refresh", method: .post, body: body)
            await TokenStore.shared.setAccessToken(auth.accessToken)
            if let newToken = auth.refreshToken { await TokenStore.shared.setRefreshToken(newToken) }
            state = toState(auth.profile)
            await connectRealtime()
        } catch {
            await TokenStore.shared.clear()
            state = .loggedOut
        }
    }

    func login(email: String, password: String) async {
        authError = nil
        do {
            let body = try await client.encode(["email": email, "password": password])
            let auth: AuthResponse = try await client.request("api/auth/login", method: .post, body: body)
            await TokenStore.shared.setAccessToken(auth.accessToken)
            if let token = auth.refreshToken { await TokenStore.shared.setRefreshToken(token) }
            state = toState(auth.profile)
            await connectRealtime()
        } catch {
            authError = error.localizedDescription
        }
    }

    func register(email: String, password: String, fullName: String) async {
        authError = nil
        do {
            let body = try await client.encode(["email": email, "password": password, "fullName": fullName])
            let auth: AuthResponse = try await client.request("api/auth/register", method: .post, body: body)
            await TokenStore.shared.setAccessToken(auth.accessToken)
            if let token = auth.refreshToken { await TokenStore.shared.setRefreshToken(token) }
            state = toState(auth.profile)
        } catch {
            authError = error.localizedDescription
        }
    }

    func completeSetup(fullName: String, origin: String, host: String, city: String, situation: String, focus: String) async {
        authError = nil
        struct UpdateProfileBody: Encodable { let fullName: String; let origin: String; let host: String; let city: String; let bio: String }
        do {
            let body = try await client.encode(UpdateProfileBody(
                fullName: fullName, origin: origin, host: host, city: city,
                bio: "Moving for \(situation). Currently focused on \(focus)."
            ))
            let envelope: ProfileEnvelope = try await client.request("api/users/me", method: .patch, body: body)

            if !focus.isEmpty, focus != "General" {
                struct NewGoalStep: Encodable { let text: String; let description: String }
                struct CreateGoalBody: Encodable { let title: String; let category: String; let steps: [NewGoalStep] }
                let category = focus == "Anmeldung" ? "Documentation" : (focus == "Housing" ? "Housing" : "General")
                let goalBody = try await client.encode(CreateGoalBody(
                    title: "Start with \(focus)", category: category,
                    steps: [NewGoalStep(text: "Research \(focus) in \(city)", description: "Initial research step for \(focus).")]
                ))
                let _: GoalEnvelope? = try? await client.request("api/goals", method: .post, body: goalBody)
            }

            state = toState(envelope.profile)
            await connectRealtime()
        } catch {
            authError = error.localizedDescription
        }
    }

    func refreshProfile() async {
        if let envelope: ProfileEnvelope = try? await client.request("api/auth/me") {
            state = toState(envelope.profile)
        }
    }

    func logout() async {
        if let refreshToken = await TokenStore.shared.refreshToken,
           let body = try? await client.encode(["refreshToken": refreshToken]) {
            _ = try? await client.requestRawData("api/auth/logout", method: .post, body: body)
        }
        await WsGateway.shared.disconnect()
        await TokenStore.shared.clear()
        followingIds.removeAll()
        state = .loggedOut
    }

    private func connectRealtime() async {
        if let token = await TokenStore.shared.accessToken {
            await WsGateway.shared.connect(accessToken: token)
        }
    }

    private func toState(_ profile: Profile) -> SessionState {
        profile.needsSetup ? .needsSetup(profile) : .ready(profile)
    }
}
