import SwiftUI

@main
struct BuonoloApp: App {
    @StateObject private var session = SessionStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(session)
                .task { await session.restoreSession() }
        }
    }
}
