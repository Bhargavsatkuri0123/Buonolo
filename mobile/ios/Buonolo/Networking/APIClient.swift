import Foundation

struct APIError: Error, LocalizedError {
    let message: String
    var errorDescription: String? { message }
}

enum HTTPMethod: String { case get = "GET", post = "POST", patch = "PATCH", put = "PUT", delete = "DELETE" }

/// Thin async/await HTTP client. 401s trigger a single synchronous refresh-and-retry, mirroring the
/// same pattern used on web (cookie-based refresh) and Android (OkHttp Authenticator).
actor APIClient {
    static let shared = APIClient()

    private let baseURL: URL
    private let session: URLSession
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    private init() {
        let urlString = Bundle.main.object(forInfoDictionaryKey: "APIBaseURL") as? String
        baseURL = URL(string: urlString?.isEmpty == false ? urlString! : "http://localhost:4000")!
        session = URLSession(configuration: .default)
    }

    var wsBaseURL: URL {
        var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false)!
        components.scheme = components.scheme == "https" ? "wss" : "ws"
        return components.url!
    }

    func request<T: Decodable>(_ path: String, method: HTTPMethod = .get, body: Data? = nil) async throws -> T {
        let data = try await requestRawData(path, method: method, body: body)
        if data.isEmpty {
            // Endpoints that return 204 No Content decode into Void-shaped callers via EmptyResponse.
            if let empty = EmptyResponse() as? T { return empty }
        }
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError(message: "Failed to parse server response")
        }
    }

    @discardableResult
    func requestRawData(_ path: String, method: HTTPMethod = .get, body: Data? = nil, isRetry: Bool = false) async throws -> Data {
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = await TokenStore.shared.accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        request.httpBody = body

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError(message: "No response") }

        if http.statusCode == 401 && !isRetry {
            if await refreshSession() {
                return try await requestRawData(path, method: method, body: body, isRetry: true)
            }
        }

        guard (200...299).contains(http.statusCode) else {
            let message = (try? decoder.decode(ApiErrorBody.self, from: data))?.error ?? "Request failed (\(http.statusCode))"
            throw APIError(message: message)
        }
        return data
    }

    func encode<Body: Encodable>(_ body: Body) throws -> Data {
        try encoder.encode(body)
    }

    /// Returns true if the access token was refreshed successfully.
    @discardableResult
    func refreshSession() async -> Bool {
        guard let refreshToken = await TokenStore.shared.refreshToken else { return false }
        do {
            var request = URLRequest(url: baseURL.appendingPathComponent("api/auth/refresh"))
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try encoder.encode(["refreshToken": refreshToken])
            let (data, response) = try await session.data(for: request)
            guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else { return false }
            let auth = try decoder.decode(AuthResponse.self, from: data)
            await TokenStore.shared.setAccessToken(auth.accessToken)
            if let newRefresh = auth.refreshToken {
                await TokenStore.shared.setRefreshToken(newRefresh)
            }
            return true
        } catch {
            return false
        }
    }
}

/// Placeholder decode target for 204 No Content responses.
struct EmptyResponse: Decodable {}
