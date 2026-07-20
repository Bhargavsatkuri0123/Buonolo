import Foundation
import Security

/// Refresh tokens are the long-lived credential, so they live in the Keychain.
/// The access token is short-lived and only ever kept in memory (see `TokenStore`).
enum KeychainStore {
    private static let service = "com.buonolo.app.refreshtoken"
    private static let account = "refreshToken"

    static func save(_ value: String) {
        delete()
        let data = Data(value.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock,
        ]
        SecItemAdd(query as CFDictionary, nil)
    }

    static func load() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    static func delete() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        SecItemDelete(query as CFDictionary)
    }
}

/// Access token: in-memory only, for the lifetime of the process. An actor because it's mutated
/// from concurrent async contexts (API client, WS gateway, session store) and Keychain I/O happens here.
actor TokenStore {
    static let shared = TokenStore()
    private init() {}

    private(set) var accessToken: String?

    func setAccessToken(_ token: String?) {
        accessToken = token
    }

    var refreshToken: String? {
        KeychainStore.load()
    }

    func setRefreshToken(_ token: String?) {
        if let token { KeychainStore.save(token) } else { KeychainStore.delete() }
    }

    func clear() {
        accessToken = nil
        KeychainStore.delete()
    }
}
