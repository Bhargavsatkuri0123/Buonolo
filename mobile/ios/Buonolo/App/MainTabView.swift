import SwiftUI

struct MainTabView: View {
    let profile: Profile
    @State private var messengerTarget: String?
    @State private var showMessenger = false

    var body: some View {
        TabView {
            HomeView(profile: profile, onOpenMessenger: { showMessenger = true })
                .tabItem { Label("Home", systemImage: "house.fill") }

            RoadmapView(profile: profile)
                .tabItem { Label("Roadmap", systemImage: "map.fill") }

            CommunityView(profile: profile, onMessageUser: { userId in
                messengerTarget = userId
                showMessenger = true
            })
                .tabItem { Label("Community", systemImage: "person.3.fill") }

            ToolsView(profile: profile)
                .tabItem { Label("Tools", systemImage: "wrench.and.screwdriver.fill") }

            MeView(profile: profile)
                .tabItem { Label("Me", systemImage: "person.crop.circle") }
        }
        .sheet(isPresented: $showMessenger) {
            MessengerView(currentUserId: profile.id, initialCounterpartId: messengerTarget)
                .onDisappear { messengerTarget = nil }
        }
    }
}
