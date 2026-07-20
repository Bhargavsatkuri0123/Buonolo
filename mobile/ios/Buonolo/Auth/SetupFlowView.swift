import SwiftUI

private let hostCountries = ["Germany", "France", "Spain", "Portugal", "Netherlands", "United Kingdom", "United States", "Canada", "Australia", "Italy", "Sweden", "Ireland", "Other"]
private let situations = ["Work / Employment", "Study / Education", "Family Reunion", "Freelancing / Business", "Seeking Asylum / Protection", "Just Exploring"]
private let focusAreas = ["Anmeldung", "Visa / Permits", "Housing", "Banking", "Health Insurance", "Social Circle"]

struct SetupFlowView: View {
    let profile: Profile
    @EnvironmentObject private var session: SessionStore

    @State private var step = 0
    @State private var origin = ""
    @State private var host = ""
    @State private var city = ""
    @State private var situation = ""
    @State private var focus = ""
    @State private var isSubmitting = false

    var body: some View {
        NavigationStack {
            if step == 0 {
                Form {
                    Section("Welcome, \(profile.name.components(separatedBy: " ").first ?? profile.name)!") {
                        TextField("Your nationality", text: $origin)
                        Picker("Host country", selection: $host) {
                            Text("Select…").tag("")
                            ForEach(hostCountries, id: \.self) { Text($0).tag($0) }
                        }
                        TextField("Current city", text: $city)
                    }
                    Button("Next: Personalise") { step = 1 }
                        .disabled(origin.isEmpty || host.isEmpty || city.isEmpty)
                }
                .navigationTitle("Setup")
            } else {
                Form {
                    Section("What brings you to \(city)?") {
                        ForEach(situations, id: \.self) { option in
                            selectableRow(option, selected: situation == option) { situation = option }
                        }
                    }
                    Section("Your primary focus right now") {
                        ForEach(focusAreas, id: \.self) { option in
                            selectableRow(option, selected: focus == option) { focus = option }
                        }
                    }
                    if let error = session.authError {
                        Text(error).foregroundStyle(.red)
                    }
                    HStack {
                        Button("Back") { step = 0 }
                        Spacer()
                        Button("Start my journey") {
                            Task {
                                isSubmitting = true
                                await session.completeSetup(fullName: profile.name, origin: origin, host: host, city: city, situation: situation, focus: focus)
                                isSubmitting = false
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(isSubmitting)
                    }
                }
                .navigationTitle("Quick assessment")
            }
        }
    }

    private func selectableRow(_ label: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack {
                Text(label).foregroundStyle(.primary)
                Spacer()
                if selected { Image(systemName: "checkmark") }
            }
        }
    }
}
