import { useEffect, useState, useCallback, useMemo } from "react";
import "./App.css";

const API_BASE = "http://localhost:8081";
const STUDENT_NAME = "Harshit Thakur";
const STUDENT_UID = "23BAI70435";

// Keys isolated to Exp 7.2 so it doesn't conflict with 7.1
const ACCESS_KEY = "exp72_accessToken";
const REFRESH_KEY = "exp72_refreshToken";
const USER_KEY = "exp72_username";
const ROLE_KEY = "exp72_role";
const THEME_KEY = "exp72_theme";

// ── JWT Decoder ──────────────────────────────────────────────
function decodeJwt(token) {
  try {
    if (!token) return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

// ── Shared UI Components ─────────────────────────────────────
function StatusDot({ variant = "success" }) {
  return <span className={`dot dot--${variant}`} />;
}

function Badge({ children, variant = "default" }) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

function ThemeToggle({ theme, onToggle, className = "" }) {
  return (
    <button className={`theme-btn ${className}`} onClick={onToggle} type="button" title="Toggle theme">
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

// ═════════════════════════════════════════════════════════════
// MAIN APPLICATION
// ═════════════════════════════════════════════════════════════
export default function App() {
  // ── Theme State ──
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);

  // ── Auth & Token States ──
  const [token, setToken] = useState(() => localStorage.getItem(ACCESS_KEY) || "");
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_KEY) || "");
  const [loggedUser, setLoggedUser] = useState(() => localStorage.getItem(USER_KEY) || "");
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || "");

  // ── Login Form State ──
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMsg, setLoginMsg] = useState({ text: "", type: "" });
  const [loginLoading, setLoginLoading] = useState(false);

  // ── API Test Responses ──
  const [userApiStatus, setUserApiStatus] = useState(null);
  const [adminApiStatus, setAdminApiStatus] = useState(null);
  const [refreshMessage, setRefreshMessage] = useState({ text: "", type: "" });
  const [refreshing, setRefreshing] = useState(false);

  // ── AES Interactive Playground State ──
  const [plainInput, setPlainInput] = useState("Confidential_Client_Secret_Key_987654");
  const [cipherResult, setCipherResult] = useState("");
  const [decryptedResult, setDecryptedResult] = useState("");
  const [aesLoading, setAesLoading] = useState(false);
  const [aesError, setAesError] = useState("");

  // ── Clipboard Feedback ──
  const [copiedKey, setCopiedKey] = useState("");

  // ── Decoded Token Memo ──
  const decoded = useMemo(() => decodeJwt(token), [token]);
  const tUser = decoded?.sub || loggedUser;
  const tRole = decoded?.role || role;
  const isAdmin = tRole === "ADMIN";
  const tokenExpMs = decoded?.exp ? decoded.exp * 1000 : null;

  // ── Expiration Countdown ──
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!tokenExpMs) {
      setSecondsLeft(0);
      return;
    }
    const update = () => {
      const remaining = Math.max(0, Math.floor((tokenExpMs - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [tokenExpMs]);

  const formatCountdown = (secs) => {
    if (secs <= 0) return "EXPIRED";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  // ── Autofill Helper ──
  const fillCreds = useCallback((u, p) => {
    setUsername(u);
    setPassword(p);
    setLoginMsg({ text: "", type: "" });
  }, []);

  // ── Copy to Clipboard ──
  const copyToClipboard = useCallback((text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  }, []);

  // ── Login Handler ──
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMsg({ text: "Authenticating with Spring Security...", type: "loading" });

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setLoginMsg({ text: "Access Denied: Invalid credentials", type: "error" });
        setLoginLoading(false);
        return;
      }

      const data = await res.json();
      const jwtPayload = decodeJwt(data.accessToken);

      const u = jwtPayload?.sub || username;
      const r = jwtPayload?.role || "USER";

      localStorage.setItem(ACCESS_KEY, data.accessToken);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
      localStorage.setItem(USER_KEY, u);
      localStorage.setItem(ROLE_KEY, r);

      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setLoggedUser(u);
      setRole(r);

      setUsername("");
      setPassword("");
      setUserApiStatus(null);
      setAdminApiStatus(null);
      setLoginMsg({ text: "Access Granted ✓", type: "success" });
    } catch {
      setLoginMsg({ text: "Connection error: Spring Boot server offline at :8081", type: "error" });
    } finally {
      setLoginLoading(false);
    }
  }, [username, password]);

  // ── Refresh Access Token (Token Rotation) ──
  const refreshTokens = useCallback(async () => {
    const curRefresh = localStorage.getItem(REFRESH_KEY) || refreshToken;
    if (!curRefresh) {
      setRefreshMessage({ text: "No refresh token available", type: "error" });
      return;
    }

    setRefreshing(true);
    setRefreshMessage({ text: "Rotating refresh token & requesting new access token...", type: "loading" });

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: curRefresh }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setRefreshMessage({ text: `Refresh failed: ${errText}`, type: "error" });
        return;
      }

      const data = await res.json();
      const jwtPayload = decodeJwt(data.accessToken);

      localStorage.setItem(ACCESS_KEY, data.accessToken);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);

      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      if (jwtPayload?.role) setRole(jwtPayload.role);

      setRefreshMessage({ text: "Token Rotated Successfully! (New Access + New Refresh Token)", type: "success" });
      setTimeout(() => setRefreshMessage({ text: "", type: "" }), 4000);
    } catch {
      setRefreshMessage({ text: "Network error during token rotation", type: "error" });
    } finally {
      setRefreshing(false);
    }
  }, [refreshToken]);

  // ── Test Protected APIs ──
  const testApi = useCallback(async (type) => {
    const setter = type === "user" ? setUserApiStatus : setAdminApiStatus;
    setter({ code: null, text: "Contacting protected endpoint...", success: false });

    try {
      let res = await fetch(`${API_BASE}/api/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Auto-refresh token if expired (401)
      if (res.status === 401 && refreshToken) {
        setter({ code: 401, text: "Access token expired — auto-refreshing...", success: false });
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const freshData = await refreshRes.json();
          localStorage.setItem(ACCESS_KEY, freshData.accessToken);
          localStorage.setItem(REFRESH_KEY, freshData.refreshToken);
          setToken(freshData.accessToken);
          setRefreshToken(freshData.refreshToken);

          // Retry request with fresh token
          res = await fetch(`${API_BASE}/api/${type}`, {
            headers: { Authorization: `Bearer ${freshData.accessToken}` },
          });
        }
      }

      const text = await res.text();
      setter({ code: res.status, text, success: res.ok });
    } catch {
      setter({ code: "ERR", text: "Unable to reach Spring Boot server", success: false });
    }
  }, [token, refreshToken]);

  // ── AES Encrypt ──
  const handleEncrypt = useCallback(async () => {
    if (!plainInput.trim()) return;
    setAesLoading(true);
    setAesError("");

    try {
      const res = await fetch(`${API_BASE}/api/aes/encrypt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: plainInput }),
      });

      if (!res.ok) {
        const err = await res.text();
        setAesError(err || "Encryption failed");
        return;
      }

      const data = await res.json();
      setCipherResult(data.cipherText);
      setDecryptedResult(""); // clear previous decrypt
    } catch {
      setAesError("Failed to connect to AES encryption endpoint");
    } finally {
      setAesLoading(false);
    }
  }, [plainInput, token]);

  // ── AES Decrypt ──
  const handleDecrypt = useCallback(async () => {
    if (!cipherResult.trim()) return;
    setAesLoading(true);
    setAesError("");

    try {
      const res = await fetch(`${API_BASE}/api/aes/decrypt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: cipherResult }),
      });

      if (!res.ok) {
        const err = await res.text();
        setAesError(err || "Decryption failed (GCM authentication check failed)");
        return;
      }

      const data = await res.json();
      setDecryptedResult(data.decryptedText);
    } catch {
      setAesError("Failed to connect to AES decryption endpoint");
    } finally {
      setAesLoading(false);
    }
  }, [cipherResult, token]);

  // ── Logout ──
  const logout = useCallback(async () => {
    const curRefresh = localStorage.getItem(REFRESH_KEY) || refreshToken;
    try {
      if (curRefresh) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: curRefresh }),
        });
      }
    } catch {
      // proceed with local cleanup
    }

    [ACCESS_KEY, REFRESH_KEY, USER_KEY, ROLE_KEY].forEach(k => localStorage.removeItem(k));
    setToken("");
    setRefreshToken("");
    setLoggedUser("");
    setRole("");
    setUserApiStatus(null);
    setAdminApiStatus(null);
    setCipherResult("");
    setDecryptedResult("");
    setLoginMsg({ text: "", type: "" });
  }, [refreshToken]);

  const themeClass = theme === "light" ? "light" : "dark";

  // ═══════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════
  if (!token) {
    return (
      <div className={`app app--login ${themeClass}`}>
        <div className="login-wrap">
          {/* Header Bar */}
          <div className="login-header-bar">
            <div className="student-pill">
              <span className="student-pill__avatar">HT</span>
              <div className="student-pill__info">
                <strong>{STUDENT_NAME}</strong>
                <small>UID: {STUDENT_UID}</small>
              </div>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} className="login-theme" />
          </div>

          <div className="login-card">
            <div className="login-card__top">
              <div className="login-card__icon">🔐</div>
              <span className="badge badge--success">EXP 7.2 ACTIVE</span>
            </div>

            <p className="login-card__label">CRYPTOGRAPHIC SECURITY GATEWAY</p>

            <h1 className="login-card__title">
              Cipher<span>Vault</span>
            </h1>

            <p className="login-card__subtitle">
              AES-256-GCM Encryption, Token Rotation &amp; Secure Credential Storage
            </p>

            <div className="status-line">
              <StatusDot /> Spring Boot Port 8081 Online
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <label className="field">
                <span>USERNAME</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin, user, or Harshit Thakur"
                  autoComplete="username"
                  required
                />
              </label>

              <label className="field">
                <span>PASSWORD</span>
                <div className="field__password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(s => !s)}
                    title="Toggle password visibility"
                  >
                    {showPassword ? "👁️" : "🔒"}
                  </button>
                </div>
              </label>

              <button type="submit" className="btn btn--primary btn--full" disabled={loginLoading}>
                {loginLoading ? "Authenticating..." : "Authenticate & Issue Token Pair →"}
              </button>
            </form>

            {loginMsg.text && (
              <div className={`toast toast--${loginMsg.type}`}>{loginMsg.text}</div>
            )}

            {/* Quick Demo Credentials */}
            <div className="creds-box">
              <div className="creds-box__head">
                <span className="creds-box__title">CLICK TO AUTO-FILL CREDENTIALS</span>
              </div>
              <button
                type="button"
                className="creds-row"
                onClick={() => fillCreds("admin", "admin123")}
                title="Click to fill ADMIN credentials"
              >
                <div><StatusDot variant="admin" /> <strong>ADMIN</strong></div>
                <code>admin / admin123</code>
              </button>
              <button
                type="button"
                className="creds-row"
                onClick={() => fillCreds("user", "user123")}
                title="Click to fill USER credentials"
              >
                <div><StatusDot variant="user" /> <strong>USER</strong></div>
                <code>user / user123</code>
              </button>
              <button
                type="button"
                className="creds-row"
                onClick={() => fillCreds("Harshit Thakur", "HTLT215")}
                title="Click to fill STUDENT credentials"
              >
                <div><StatusDot variant="student" /> <strong>HARSHIT THAKUR</strong></div>
                <code>Harshit Thakur / HTLT215</code>
              </button>
            </div>
          </div>

          <div className="login-chips">
            <span>AES-256-GCM</span>
            <span>Refresh Token Rotation</span>
            <span>SHA-256 Token Hash</span>
            <span>Reuse Detection</span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MAIN DASHBOARD SCREEN
  // ═══════════════════════════════════════════════════════════
  return (
    <div className={`app app--dash ${themeClass}`}>
      {/* ── Top Bar ── */}
      <header className="topbar">
        <div className="topbar__brand">
          <div className="topbar__logo">CV</div>
          <div>
            <h2>Cipher<span>Vault</span></h2>
            <small>EXP 7.2: AES-256-GCM &amp; TOKEN STORAGE</small>
          </div>
        </div>

        <div className="topbar__student">
          <span className="student-label">PROJECT CANDIDATE</span>
          <strong>{STUDENT_NAME}</strong>
          <small>UID: {STUDENT_UID}</small>
        </div>

        <div className="topbar__actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          <div className="topbar__profile">
            <div className="avatar">{tUser.charAt(0).toUpperCase()}</div>
            <div className="topbar__user-info">
              <strong>{tUser}</strong>
              <Badge variant={isAdmin ? "admin" : "user"}>{tRole}</Badge>
            </div>
          </div>

          <button className="btn btn--ghost btn--logout" onClick={logout} title="Revoke & Logout">
            Logout ↗
          </button>
        </div>
      </header>

      <main className="dash">
        {/* ── Hero Banner with Countdown ── */}
        <section className="hero">
          <div className="hero__text">
            <div className="status-line"><StatusDot /> Authenticated Session • Port 8081</div>
            <h1>Secure Vault Active,<br /><span>{tUser}</span></h1>
            <p>
              Protected by <strong>AES-256-GCM Authenticated Encryption</strong> with
              stateless <strong>JWT Access Tokens</strong> and cryptographically hashed
              <strong> Refresh Tokens with Reuse Detection</strong>.
            </p>
          </div>

          <div className="hero__timer-card">
            <span className="timer-label">ACCESS TOKEN LIFESPAN</span>
            <div className={`countdown ${secondsLeft <= 60 ? "countdown--warning" : ""}`}>
              {formatCountdown(secondsLeft)}
            </div>
            <button
              className="btn btn--primary btn--sm"
              onClick={refreshTokens}
              disabled={refreshing}
            >
              {refreshing ? "Rotating..." : "🔄 Rotate Refresh Token"}
            </button>
          </div>
        </section>

        {refreshMessage.text && (
          <div className={`toast toast--${refreshMessage.type} toast--banner`}>
            {refreshMessage.text}
          </div>
        )}

        {/* ── Security Architecture Metrics ── */}
        <section className="stats">
          {[
            { label: "AUTHENTICATED IDENTITY", value: tUser, status: "VERIFIED" },
            { label: "GRANTED AUTHORITY",      value: `ROLE_${tRole}`, status: "AUTHORIZED" },
            { label: "CIPHER SPECIFICATION",    value: "AES-256-GCM (NoPadding)", status: "ACTIVE" },
            { label: "TOKEN STORAGE HASH",     value: "SHA-256 H2 Database", status: "ENFORCED" },
          ].map(s => (
            <div className="stat" key={s.label}>
              <div className="stat__icon">🛡️</div>
              <div className="stat__body">
                <span>{s.label}</span>
                <strong>{s.value}</strong>
              </div>
              <div className="stat__tag">{s.status}</div>
            </div>
          ))}
        </section>

        {/* ── AES-256-GCM Interactive Studio ── */}
        <section className="section">
          <div className="section__head">
            <div>
              <span className="section__label">CRYPTOGRAPHIC STUDIO</span>
              <h2>AES-256-GCM Encryption &amp; Decryption</h2>
            </div>
            <Badge variant="success">AEAD AUTHENTICATED</Badge>
          </div>

          <div className="aes-studio">
            <div className="aes-card">
              <h3>1. Plaintext Input</h3>
              <p>Enter sensitive data to encrypt (OAuth tokens, API credentials, secret keys):</p>
              <textarea
                className="aes-textarea"
                rows={3}
                value={plainInput}
                onChange={e => setPlainInput(e.target.value)}
                placeholder="Enter sensitive secret..."
              />
              <button
                className="btn btn--primary"
                onClick={handleEncrypt}
                disabled={aesLoading || !plainInput.trim()}
              >
                {aesLoading ? "Encrypting..." : "🔒 Encrypt with AES-256-GCM →"}
              </button>
            </div>

            <div className="aes-card">
              <div className="aes-card__top">
                <h3>2. Ciphertext (Base64 Encoded)</h3>
                {cipherResult && (
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={() => copyToClipboard(cipherResult, "cipher")}
                  >
                    {copiedKey === "cipher" ? "✓ Copied" : "📋 Copy"}
                  </button>
                )}
              </div>
              <p>IV (12-byte nonce) + Ciphertext + Authentication Tag (128-bit):</p>
              <div className="cipher-output">
                {cipherResult || "Run encryption to view the generated ciphertext..."}
              </div>

              <div className="aes-actions">
                <button
                  className="btn btn--outline"
                  onClick={handleDecrypt}
                  disabled={aesLoading || !cipherResult}
                >
                  {aesLoading ? "Decrypting..." : "🔓 Decrypt & Verify Tag →"}
                </button>
              </div>

              {decryptedResult && (
                <div className="decrypt-box">
                  <span className="decrypt-box__label">✓ Decrypted Plaintext (Tag Verified):</span>
                  <code>{decryptedResult}</code>
                </div>
              )}

              {aesError && (
                <div className="toast toast--error">{aesError}</div>
              )}
            </div>
          </div>
        </section>

        {/* ── Protected APIs Verification ── */}
        <section className="section">
          <div className="section__head">
            <div>
              <span className="section__label">ENDPOINT TESTING</span>
              <h2>Role-Protected Resources</h2>
            </div>
            <Badge variant="default">SPRING METHOD SECURITY</Badge>
          </div>

          <div className="api-grid">
            {/* User API */}
            <div className="api-card">
              <div className="api-card__top">
                <div className="api-card__icon api-card__icon--user">👤</div>
                <Badge variant="success">ACCESSIBLE</Badge>
              </div>
              <h3>User Endpoint</h3>
              <code>GET /api/user</code>
              <p>Permitted for both <strong>ROLE_USER</strong> and <strong>ROLE_ADMIN</strong>.</p>
              <button className="btn btn--outline btn--full" onClick={() => testApi("user")}>
                Test User API [GET /api/user] →
              </button>
              {userApiStatus && (
                <div className={`api-result ${userApiStatus.success ? "api-result--ok" : "api-result--err"}`}>
                  <div className="api-result__head">
                    <strong>HTTP {userApiStatus.code || "…"}</strong>
                    <span>{userApiStatus.success ? "✓ ACCESS GRANTED" : "✕ REQUEST FAILED"}</span>
                  </div>
                  <p>{userApiStatus.text}</p>
                </div>
              )}
            </div>

            {/* Admin API */}
            <div className={`api-card ${isAdmin ? "api-card--admin" : "api-card--locked"}`}>
              <div className="api-card__top">
                <div className="api-card__icon api-card__icon--admin">🛡️</div>
                <Badge variant={isAdmin ? "success" : "danger"}>
                  {isAdmin ? "ACCESSIBLE" : "RESTRICTED TO ADMIN"}
                </Badge>
              </div>
              <h3>Admin Endpoint</h3>
              <code>GET /api/admin</code>
              <p>Restricted to <strong>ROLE_ADMIN</strong>. Blocked for standard users with 403 Forbidden.</p>
              <button className="btn btn--outline btn--full" onClick={() => testApi("admin")}>
                Test Admin API [GET /api/admin] →
              </button>
              {adminApiStatus && (
                <div className={`api-result ${adminApiStatus.success ? "api-result--ok" : "api-result--err"}`}>
                  <div className="api-result__head">
                    <strong>HTTP {adminApiStatus.code || "…"}</strong>
                    <span>{adminApiStatus.success ? "✓ ACCESS GRANTED" : "✕ 403 FORBIDDEN"}</span>
                  </div>
                  <p>{adminApiStatus.code === 403 && !adminApiStatus.success ? "Authenticated, but ROLE_ADMIN authority is required." : adminApiStatus.text}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Token & Storage Inspector ── */}
        <section className="section">
          <div className="section__head">
            <div>
              <span className="section__label">TOKEN MANAGEMENT</span>
              <h2>Dual-Token Lifecycle &amp; Hashing</h2>
            </div>
            <div className="token-actions-wrap">
              <button className="btn btn--outline btn--sm" onClick={refreshTokens} disabled={refreshing}>
                🔄 Rotate Refresh Token
              </button>
            </div>
          </div>

          <div className="tokens-container">
            {/* Access Token Card */}
            <div className="token-box">
              <div className="token-box__head">
                <div className="token-box__title"><StatusDot /> ACCESS TOKEN (JWT)</div>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => copyToClipboard(token, "access")}
                >
                  {copiedKey === "access" ? "✓ Copied" : "📋 Copy JWT"}
                </button>
              </div>
              <div className="token-preview">{token}</div>
              <div className="token-meta-grid">
                <div><span>Subject:</span> <strong>{tUser}</strong></div>
                <div><span>Role:</span> <strong>{tRole}</strong></div>
                <div><span>Expires:</span> <strong>{formatCountdown(secondsLeft)}</strong></div>
                <div><span>Algorithm:</span> <strong>HS256</strong></div>
              </div>
            </div>

            {/* Refresh Token Card */}
            <div className="token-box">
              <div className="token-box__head">
                <div className="token-box__title"><StatusDot variant="admin" /> REFRESH TOKEN (CRYPTOGRAPHIC NONCE)</div>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => copyToClipboard(refreshToken, "refresh")}
                >
                  {copiedKey === "refresh" ? "✓ Copied" : "📋 Copy Raw"}
                </button>
              </div>
              <div className="token-preview">{refreshToken}</div>
              <div className="token-meta-grid">
                <div><span>Storage:</span> <strong>H2 Database</strong></div>
                <div><span>Stored As:</span> <strong>SHA-256 Hash</strong></div>
                <div><span>Policy:</span> <strong>One-time Rotation</strong></div>
                <div><span>Reuse Detection:</span> <strong>Token Family Invalidation</strong></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cryptographic Architecture Specifications ── */}
        <section className="section">
          <div className="section__head">
            <div>
              <span className="section__label">SECURITY SPECIFICATIONS</span>
              <h2>Encryption &amp; Storage Architecture</h2>
            </div>
          </div>

          <div className="specs-table">
            <div className="specs-row specs-row--head">
              <span>COMPONENT</span>
              <span>ALGORITHM / PROTOCOL</span>
              <span>SECURITY FUNCTION</span>
            </div>
            <div className="specs-row">
              <strong>Credential Encryption</strong>
              <code>AES/GCM/NoPadding (256-bit)</code>
              <span>Authenticated symmetric encryption with integrity protection</span>
            </div>
            <div className="specs-row">
              <strong>Initialization Vector (IV)</strong>
              <code>12-byte (96-bit) SecureRandom</code>
              <span>Unique nonce prepended to ciphertext preventing replay</span>
            </div>
            <div className="specs-row">
              <strong>Integrity Authentication Tag</strong>
              <code>128-bit Galois Field Auth Tag</code>
              <span>Prevents bit-flipping and undetected payload tampering</span>
            </div>
            <div className="specs-row">
              <strong>Refresh Token Storage</strong>
              <code>SHA-256 Hashing in H2 DB</code>
              <span>Raw tokens are never stored plaintext in persistent storage</span>
            </div>
            <div className="specs-row">
              <strong>Token Family Tracking</strong>
              <code>UUID Token Family</code>
              <span>Detects token compromise and revokes family on reuse</span>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="foot">
        <div>
          <strong>Experiment 7.2</strong>
          <span>Encryption &amp; Secure Credential Storage</span>
        </div>
        <div className="foot__student">
          <span>{STUDENT_NAME}</span> • <span>UID: {STUDENT_UID}</span>
        </div>
        <div className="foot__online">
          <StatusDot /> AES-256-GCM + Token Rotation Active
        </div>
      </footer>
    </div>
  );
}
