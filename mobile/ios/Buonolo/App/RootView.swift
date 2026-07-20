import SwiftUI

struct RootView: View {
    @EnvironmentObject private var session: SessionStore

    var body: some View {
        switch session.state {
        case .loading:
            ProgressView()
        case .loggedOut:
            AuthFlowView()
        case .needsSetup(let profile):
            SetupFlowView(profile: profile)
        case .ready(let profile):
            MainTabView(profile: profile)
        }
    }
}
