import { useEffect, useState, useCallback, useMemo } from "react";
import "./App.css";

const API = "http://localhost:8080";
const STUDENT_NAME = "Harshit Thakur";
const STUDENT_UID = "23BAI70435";

// ── JWT Decoder ──────────────────────────────────────────────
function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4)));
  } catch {
    return null;
  }
}

// ── Reusable Components ──────────────────────────────────────

function ThemeToggle({ theme, onToggle, className = "" }) {
  return (
    <button className={`theme-btn ${className}`} onClick={onToggle} type="button" title="Toggle Theme">
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

function StatusDot({ variant = "success" }) {
  return <span className={`dot dot--${variant}`} />;
}

function Badge({ children, variant = "default" }) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

function ApiResultPanel({ result }) {
  if (!result) return null;
  const ok = result.success;
  return (
    <div className={`api-result ${ok ? "api-result--ok" : "api-result--err"}`}>
      <div className="api-result__head">
        <strong>{result.code !== null ? `HTTP ${result.code}` : "…"}</strong>
        <span>{ok ? "✓ ACCESS GRANTED" : result.code === 403 ? "✕ 403 FORBIDDEN" : "✕ REQUEST FAILED"}</span>
      </div>
      <p>{result.code === 403 && !ok ? "Authenticated successfully, but ADMIN authority is required." : result.text}</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// MAIN APPLICATION COMPONENT
// ═════════════════════════════════════════════════════════════

export default function App() {
  // ── Theme State ──
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);

  // ── Auth State ──
  const [token, setToken] = useState(() => localStorage.getItem("jwtToken") || "");
  const [loggedUser, setLoggedUser] = useState(() => localStorage.getItem("username") || "");
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");

  // ── Login Form State ──
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [copied, setCopied] = useState(false);

  // ── API Test Responses ──
  const [userApi, setUserApi] = useState(null);
  const [adminApi, setAdminApi] = useState(null);

  // ── Decoded Token Memo ──
  const decoded = useMemo(() => (token ? decodeJwt(token) : null), [token]);
  const tRole = decoded?.role || role;
  const tUser = decoded?.sub || loggedUser;
  const isAdmin = tRole === "ADMIN";

  // ── Quick Autofill Credentials ──
  const fillCreds = useCallback((u, p) => {
    setUsername(u);
    setPassword(p);
    setMsg({ text: "", type: "" });
  }, []);

  // ── Handle Login ──
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setMsg({ text: "Authenticating with Spring Security...", type: "loading" });

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setMsg({ text: "Access Denied: Invalid credentials", type: "error" });
        return;
      }

      const { token: jwt } = await res.json();
      const payload = decodeJwt(jwt);

      if (!payload) {
        setMsg({ text: "Token validation failed: corrupt JWT", type: "error" });
        return;
      }

      const u = payload.sub || username;
      const r = payload.role || "";

      localStorage.setItem("jwtToken", jwt);
      localStorage.setItem("username", u);
      localStorage.setItem("role", r);

      setToken(jwt);
      setLoggedUser(u);
      setRole(r);
      setUsername("");
      setPassword("");
      setUserApi(null);
      setAdminApi(null);
      setMsg({ text: "Access Granted ✓", type: "success" });
    } catch {
      setMsg({ text: "Connection error: Spring Boot server offline at :8080", type: "error" });
    }
  }, [username, password]);

  // ── Test Protected APIs ──
  const testApi = useCallback(async (type) => {
    const setter = type === "user" ? setUserApi : setAdminApi;
    setter({ code: null, text: "Contacting protected endpoint...", success: false });

    try {
      const res = await fetch(`${API}/api/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      setter({ code: res.status, text, success: res.ok });
    } catch {
      setter({ code: "ERR", text: "Unable to reach Spring Boot server", success: false });
    }
  }, [token]);

  // ── Copy Token to Clipboard ──
  const copyToken = useCallback(() => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [token]);

  // ── Logout ──
  const logout = useCallback(() => {
    ["jwtToken", "username", "role"].forEach(k => localStorage.removeItem(k));
    setToken("");
    setLoggedUser("");
    setRole("");
    setUserApi(null);
    setAdminApi(null);
    setMsg({ text: "", type: "" });
  }, []);

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
              <div className="login-card__icon">🛡️</div>
              <span className="badge badge--success">EXP 7.1 ACTIVE</span>
            </div>

            <p className="login-card__label">SECURE API GATEWAY</p>

            <h1 className="login-card__title">
              Auth<span>Guard</span>
            </h1>

            <p className="login-card__subtitle">
              Secure APIs with JSON Web Token (JWT) &amp; Role-Based Access Control (RBAC)
            </p>

            <div className="status-line">
              <StatusDot /> Spring Boot API Online
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
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
              </label>

              <button type="submit" className="btn btn--primary btn--full">
                Authenticate &amp; Generate Token →
              </button>
            </form>

            {msg.text && (
              <div className={`toast toast--${msg.type}`}>{msg.text}</div>
            )}

            {/* Quick-fill demo credentials */}
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
            <span>Spring Security 6</span>
            <span>Stateless JWT</span>
            <span>Method Security</span>
            <span>@PreAuthorize RBAC</span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // DASHBOARD SCREEN
  // ═══════════════════════════════════════════════════════════

  return (
    <div className={`app app--dash ${themeClass}`}>
      {/* ── Top Bar ── */}
      <header className="topbar">
        <div className="topbar__brand">
          <div className="topbar__logo">AG</div>
          <div>
            <h2>Auth<span>Guard</span></h2>
            <small>EXP 7.1: JWT &amp; RBAC OPERATIONS</small>
          </div>
        </div>

        {/* Student identity in top bar */}
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

          <button className="btn btn--ghost btn--logout" onClick={logout} title="Sign out">
            Logout ↗
          </button>
        </div>
      </header>

      <main className="dash">
        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero__text">
            <div className="status-line"><StatusDot /> Authenticated Session Active</div>
            <h1>Welcome back,<br /><span>{tUser}</span></h1>
            <p>
              Your identity has been signed with <strong>HMAC-SHA256</strong> into a stateless
              <strong> JSON Web Token</strong>. Endpoint permissions are verified via
              <strong> Spring Security Role-Based Access Control</strong>.
            </p>
          </div>
          <div className="hero__shield">
            <div className="shield-ring"><div className="shield">🛡️</div></div>
            <small>ROLE VERIFIED</small>
            <strong>{tRole}</strong>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="stats">
          {[
            { label: "AUTHENTICATED USER", value: tUser, status: "VERIFIED" },
            { label: "GRANTED AUTHORITY",  value: `ROLE_${tRole}`, status: "AUTHORIZED" },
            { label: "SECURITY PROTOCOL",  value: "JWT Bearer Token", status: "VALID" },
            { label: "SESSION LIFECYCLE",  value: "Stateless (No Session)", status: "ACTIVE" },
          ].map(s => (
            <div className="stat" key={s.label}>
              <div className="stat__icon">✓</div>
              <div className="stat__body">
                <span>{s.label}</span>
                <strong>{s.value}</strong>
              </div>
              <div className="stat__tag">{s.status}</div>
            </div>
          ))}
        </section>

        {/* ── Protected APIs ── */}
        <section className="section">
          <div className="section__head">
            <div>
              <span className="section__label">ENDPOINT VERIFICATION</span>
              <h2>Protected API Access Control</h2>
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
              <h3>User Resource</h3>
              <code>GET /api/user</code>
              <p>Permits users with either <strong>ROLE_USER</strong> or <strong>ROLE_ADMIN</strong> authorities.</p>
              <div className="perm-bar">
                <span>USER (ALLOWED)</span><span>ADMIN (ALLOWED)</span>
              </div>
              <div className="perm-bars">
                <div className="perm-bars__fill perm-bars__fill--ok" />
                <div className="perm-bars__fill perm-bars__fill--ok" />
              </div>
              <button className="btn btn--outline btn--full" onClick={() => testApi("user")}>
                Test User API [GET /api/user] →
              </button>
              <ApiResultPanel result={userApi} />
            </div>

            {/* Admin API */}
            <div className={`api-card ${isAdmin ? "api-card--admin" : "api-card--locked"}`}>
              <div className="api-card__top">
                <div className="api-card__icon api-card__icon--admin">🔐</div>
                <Badge variant={isAdmin ? "success" : "danger"}>
                  {isAdmin ? "ACCESSIBLE" : "RESTRICTED TO ADMIN"}
                </Badge>
              </div>
              <h3>Admin Resource</h3>
              <code>GET /api/admin</code>
              <p>Restricted strictly to <strong>ROLE_ADMIN</strong> via method-level <code>@PreAuthorize</code>.</p>
              <div className="perm-bar">
                <span className={isAdmin ? "" : "perm-bar--denied"}>USER (DENIED)</span>
                <span>ADMIN (ALLOWED)</span>
              </div>
              <div className="perm-bars">
                <div className="perm-bars__fill perm-bars__fill--deny" />
                <div className="perm-bars__fill perm-bars__fill--ok" />
              </div>
              <button className="btn btn--outline btn--full" onClick={() => testApi("admin")}>
                Test Admin API [GET /api/admin] →
              </button>
              <ApiResultPanel result={adminApi} />
            </div>
          </div>
        </section>

        {/* ── JWT Inspector ── */}
        <section className="section">
          <div className="section__head">
            <div>
              <span className="section__label">TOKEN INSPECTOR</span>
              <h2>Stateless JWT Payload</h2>
            </div>
            <button className="btn btn--outline btn--sm" onClick={copyToken}>
              {copied ? "✓ Copied!" : "📋 Copy Raw Token"}
            </button>
          </div>

          <div className="jwt-panel">
            <div className="jwt-panel__head">
              <div className="jwt-panel__dot"><StatusDot /> SIGNED BEARER TOKEN</div>
              <span className="jwt-panel__type">Algorithm: HS256</span>
            </div>
            <div className="jwt-panel__preview" title="Raw JWT string">
              {token.substring(0, 48)}...{token.substring(Math.max(0, token.length - 24))}
            </div>
            <div className="jwt-parts">
              <div className="jwt-part">
                <span className="jwt-part__num">PART 1</span>
                <strong>HEADER</strong>
                <small>alg: "HS256", typ: "JWT"</small>
              </div>
              <div className="jwt-part">
                <span className="jwt-part__num">PART 2</span>
                <strong>PAYLOAD CLAIMS</strong>
                <small>sub: "{tUser}", role: "{tRole}"</small>
              </div>
              <div className="jwt-part">
                <span className="jwt-part__num">PART 3</span>
                <strong>SIGNATURE</strong>
                <small>HMAC-SHA256 (Verified)</small>
              </div>
            </div>
          </div>
        </section>

        {/* ── RBAC Matrix ── */}
        <section className="section">
          <div className="section__head">
            <div>
              <span className="section__label">AUTHORIZATION MATRIX</span>
              <h2>Role-Based Access Control Mapping</h2>
            </div>
          </div>

          <div className="rbac">
            <div className="rbac__row rbac__row--head">
              <span>PRINCIPAL ROLE</span>
              <span>/api/user ENDPOINT</span>
              <span>/api/admin ENDPOINT</span>
            </div>
            <div className={`rbac__row ${!isAdmin ? "rbac__row--active" : ""}`}>
              <span className="rbac__role rbac__role--user">
                USER {!isAdmin && <span className="current-indicator">◀ Current</span>}
              </span>
              <span className="rbac__allow">✓ 200 OK (Allowed)</span>
              <span className="rbac__deny">✕ 403 Forbidden (Blocked)</span>
            </div>
            <div className={`rbac__row ${isAdmin ? "rbac__row--active" : ""}`}>
              <span className="rbac__role rbac__role--admin">
                ADMIN {isAdmin && <span className="current-indicator">◀ Current</span>}
              </span>
              <span className="rbac__allow">✓ 200 OK (Allowed)</span>
              <span className="rbac__allow">✓ 200 OK (Allowed)</span>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="foot">
        <div>
          <strong>Experiment 7.1</strong>
          <span>Secure APIs with JWT &amp; RBAC</span>
        </div>
        <div className="foot__student">
          <span>{STUDENT_NAME}</span> • <span>UID: {STUDENT_UID}</span>
        </div>
        <div className="foot__online">
          <StatusDot /> Spring Security Stateless
        </div>
      </footer>
    </div>
  );
}
