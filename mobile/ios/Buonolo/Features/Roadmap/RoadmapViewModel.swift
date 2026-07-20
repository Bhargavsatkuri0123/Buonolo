import Foundation

@MainActor
final class RoadmapViewModel: ObservableObject {
    @Published var goals: [Goal] = []
    @Published var templates: [GoalTemplate] = []

    private let client = APIClient.shared

    func loadGoals() async {
        if let response: GoalsResponse = try? await client.request("api/goals") {
            goals = response.goals
        }
    }

    func loadTemplates() async {
        if let response: GoalTemplatesResponse = try? await client.request("api/content/goal-templates") {
            templates = response.templates
        }
    }

    func addFromTemplate(_ templateId: String) async {
        if let envelope: GoalEnvelope = try? await client.request("api/goals/from-template/\(templateId)", method: .post) {
            goals.append(envelope.goal)
        }
    }

    func addCustomGoal(title: String) async {
        struct NewGoalStep: Encodable { let text: String; let description: String }
        struct Body: Encodable { let title: String; let category: String; let steps: [NewGoalStep] }
        guard let body = try? await client.encode(Body(
            title: title, category: "Custom",
            steps: [NewGoalStep(text: "First step", description: "Break down your goal into smaller tasks.")]
        )) else { return }
        if let envelope: GoalEnvelope = try? await client.request("api/goals", method: .post, body: body) {
            goals.append(envelope.goal)
        }
    }

    func toggleStep(goalId: String, step: GoalStep) async {
        guard let goalIndex = goals.firstIndex(where: { $0.id == goalId }),
              let stepIndex = goals[goalIndex].steps.firstIndex(where: { $0.id == step.id }) else { return }
        goals[goalIndex].steps[stepIndex].done.toggle()

        struct Body: Encodable { let done: Bool }
        guard let body = try? await client.encode(Body(done: goals[goalIndex].steps[stepIndex].done)) else { return }
        _ = try? await client.requestRawData("api/goals/\(goalId)/steps/\(step.id)", method: .patch, body: body)
    }
}
