import SwiftUI

struct AuthFlowView: View {
    var body: some View {
        NavigationStack {
            IntroView()
        }
    }
}

private struct IntroView: View {
    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            Text("buonôlô")
                .font(.system(size: 36, weight: .bold, design: .rounded))
            Text("Your companion for settling in with confidence.")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Spacer()
            NavigationLink("Continue with Email") { AuthFormView(isRegister: false) }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
        }
        .padding(24)
    }
}

private struct AuthFormView: View {
    @EnvironmentObject private var session: SessionStore
    @State var isRegister: Bool
    @State private var email = ""
    @State private var password = ""
    @State private var fullName = ""
    @State private var isSubmitting = false

    var body: some View {
        Form {
            if isRegister {
                TextField("Full name", text: $fullName)
                    .textContentType(.name)
            }
            TextField("Email", text: $email)
                .textContentType(.emailAddress)
                .autocapitalization(.none)
                .keyboardType(.emailAddress)
            SecureField("Password", text: $password)
                .textContentType(isRegister ? .newPassword : .password)

            if let error = session.authError {
                Text(error).foregroundStyle(.red)
            }

            Button(isRegister ? "Create account" : "Log in") {
                Task {
                    isSubmitting = true
                    if isRegister {
                        await session.register(email: email, password: password, fullName: fullName)
                    } else {
                        await session.login(email: email, password: password)
                    }
                    isSubmitting = false
                }
            }
            .disabled(email.isEmpty || password.isEmpty || (isRegister && fullName.isEmpty) || isSubmitting)

            Button(isRegister ? "Already have an account? Log in" : "Don't have an account? Sign up") {
                isRegister.toggle()
                session.authError = nil
            }
        }
        .navigationTitle(isRegister ? "Sign up" : "Log in")
    }
}
