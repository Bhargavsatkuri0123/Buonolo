import Foundation

struct WsEvent {
    let type: String
    let payload: Data
}

/// Thin wrapper around the backend's plain-WebSocket gateway with exponential-backoff reconnect.
actor WsGateway {
    static let shared = WsGateway()
    private init() {}

    private var task: URLSessionWebSocketTask?
    private var retryDelaySeconds: UInt64 = 1
    private var stopped = false
    private var currentToken: String?
    private var continuation: AsyncStream<WsEvent>.Continuation?

    lazy var events: AsyncStream<WsEvent> = AsyncStream { continuation in
        self.continuation = continuation
    }

    func connect(accessToken: String) async {
        stopped = false
        currentToken = accessToken
        await openSocket(accessToken: accessToken)
    }

    private func openSocket(accessToken: String) async {
        var components = URLComponents(url: await APIClient.shared.wsBaseURL, resolvingAgainstBaseURL: false)!
        components.path = "/ws"
        components.queryItems = [URLQueryItem(name: "token", value: accessToken)]
        guard let url = components.url else { return }

        let newTask = URLSession.shared.webSocketTask(with: url)
        task = newTask
        newTask.resume()
        retryDelaySeconds = 1
        listen(on: newTask)
    }

    private func listen(on task: URLSessionWebSocketTask) {
        task.receive { [weak self] result in
            guard let self else { return }
            switch result {
            case .success(let message):
                Task { await self.handle(message) }
                Task { await self.listen(on: task) }
            case .failure:
                Task { await self.scheduleReconnect() }
            }
        }
    }

    private func handle(_ message: URLSessionWebSocketTask.Message) {
        guard case .string(let text) = message, let data = text.data(using: .utf8) else { return }
        guard let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let type = object["type"] as? String,
              let payloadObject = object["payload"] else { return }
        guard let payloadData = try? JSONSerialization.data(withJSONObject: payloadObject) else { return }
        continuation?.yield(WsEvent(type: type, payload: payloadData))
    }

    private func scheduleReconnect() async {
        guard !stopped, let token = currentToken else { return }
        try? await Task.sleep(nanoseconds: retryDelaySeconds * 1_000_000_000)
        retryDelaySeconds = min(retryDelaySeconds * 2, 30)
        if !stopped { await openSocket(accessToken: token) }
    }

    func disconnect() {
        stopped = true
        task?.cancel(with: .goingAway, reason: nil)
        task = nil
    }
}
