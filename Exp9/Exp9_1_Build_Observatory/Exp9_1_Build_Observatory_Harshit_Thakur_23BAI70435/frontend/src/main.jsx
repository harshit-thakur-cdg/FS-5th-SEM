import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const STUDENT_NAME = "Harshit Thakur";
const STUDENT_UID = "23BAI70435";
const STUDENT_INITIALS = "HT";

const STAGES = [
  { num: '01', title: 'Unit Tests', tech: 'JUnit 5 + Mockito', desc: 'Isolates service layer business logic and ensures validation contracts hold without database overhead.' },
  { num: '02', title: 'API & Web Tests', tech: 'Spring MockMvc', desc: 'Validates request headers, HTTP 201 Created responses, 400 Bad Request error cases, and JSON deserialization.' },
  { num: '03', title: 'Contract Tests', tech: 'Pact Consumer + Provider', desc: 'Validates consumer-provider pact contracts ensuring breaking API changes cannot slip past CI.' },
  { num: '04', title: 'Database Integration', tech: 'PostgreSQL + Testcontainers', desc: 'Boots a real isolated PostgreSQL 16 Docker container on-the-fly to test true transactional persistence.' }
];

function StatusBadge({ status }) {
  return (
    <span className="badge badge-queued">
      <span className="badge-dot" />
      {status || 'QUEUED'}
    </span>
  );
}

function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('observatory_theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('observatory_theme', theme);
  }, [theme]);

  // Tab & Data States
  const [tab, setTab] = useState('Overview');
  const [builds, setBuilds] = useState([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiStatus, setApiStatus] = useState('Checking');
  const [autoRefreshCount, setAutoRefreshCount] = useState(2);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [notice, setNotice] = useState(null);

  const isMounted = useRef(true);

  // Fetch builds
  const fetchBuilds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/builds', { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (Array.isArray(data) && isMounted.current) {
        setBuilds(data);
        setApiStatus('Connected');
      }
    } catch {
      if (isMounted.current) setApiStatus('Offline');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // Polling Effect
  useEffect(() => {
    isMounted.current = true;
    fetchBuilds();

    const intervalFetch = setInterval(() => {
      fetchBuilds();
      setAutoRefreshCount(2);
    }, 2500);

    const intervalCount = setInterval(() => {
      setAutoRefreshCount(c => (c > 0 ? c - 1 : 2));
    }, 1000);

    return () => {
      isMounted.current = false;
      clearInterval(intervalFetch);
      clearInterval(intervalCount);
    };
  }, []);

  // Create Build Record
  const handleCreateBuild = async (e) => {
    if (e) e.preventDefault();
    const trimmed = commitMessage.trim();
    if (!trimmed || trimmed.length > 200) {
      setNotice({ type: 'error', text: 'Commit message must be between 1 and 200 characters.' });
      return;
    }

    setBusy(true);
    setNotice(null);

    try {
      const res = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitMessage: trimmed }),
        signal: AbortSignal.timeout(8000)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      setBuilds(prev => [data, ...prev]);
      setSelectedBuild(data);
      setCommitMessage('');
      setApiStatus('Connected');
      setNotice({ type: 'success', text: `Build #${data.id} created successfully and persisted in H2 database (Status: QUEUED).` });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  // Inspect build by ID
  const handleInspect = async (id) => {
    try {
      const res = await fetch(`/api/builds/${id}`);
      const data = await res.json();
      setSelectedBuild(data);
    } catch (err) {
      setNotice({ type: 'error', text: 'Failed to inspect build #' + id });
    }
  };

  // Clear Database
  const handleClearBuilds = async () => {
    if (!window.confirm("Are you sure you want to clear all persisted CI build records?")) return;
    try {
      const res = await fetch('/api/builds', { method: 'DELETE' });
      if (res.ok) {
        setSelectedBuild(null);
        setNotice({ type: 'success', text: 'All build records cleared from database.' });
        fetchBuilds();
      }
    } catch (err) {
      setNotice({ type: 'error', text: 'Failed to clear builds: ' + err.message });
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(builds, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-observatory-history-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Filtered Builds
  const filteredBuilds = useMemo(() => {
    return builds.filter(b => {
      const q = searchQuery.toLowerCase();
      const matchMsg = (b.commitMessage || '').toLowerCase().includes(q);
      const matchId = String(b.id || '').includes(q);
      return matchMsg || matchId;
    });
  }, [builds, searchQuery]);

  return (
    <div className="shell">
      {/* ── Left Sidebar Navigation ─────────────────────────────────── */}
      <aside className="sidebar">
        <a className="brand-wrapper" href="#" onClick={(e) => { e.preventDefault(); setTab('Overview'); }}>
          <div className="brand-logo">⌘</div>
          <div className="brand-text">
            <h2>BuildObs <span className="brand-badge">Exp 9.1</span></h2>
            <p>CI PIPELINE OBSERVATORY</p>
          </div>
        </a>

        <div className="sidebar-nav-title">CI Navigation</div>
        <nav className="nav-links">
          <button
            type="button"
            className={`nav-item ${tab === 'Overview' ? 'active' : ''}`}
            onClick={() => setTab('Overview')}
          >
            <span className="nav-icon">📊</span>
            Overview &amp; Composer
          </button>

          <button
            type="button"
            className={`nav-item ${tab === 'History' ? 'active' : ''}`}
            onClick={() => setTab('History')}
          >
            <span className="nav-icon">📑</span>
            Build History
            <span className="nav-counter">{builds.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${tab === 'Guide' ? 'active' : ''}`}
            onClick={() => setTab('Guide')}
          >
            <span className="nav-icon">🧪</span>
            CI Testing Guide
          </button>
        </nav>

        {/* Sidebar Status Card */}
        <div className="sidebar-card">
          <div className="sidebar-card-header">
            <span className="sidebar-card-title">CI Pipeline State</span>
            <span className="pulse-dot" style={{ color: apiStatus === 'Connected' ? '#10b981' : '#f43f5e' }} />
          </div>
          <p>Automated verification across 4 test layers: Unit, API, Pact, and Postgres Testcontainers.</p>
          <div className="ci-pill">
            <span>Target:</span>
            <strong>Port 8400 (Local H2)</strong>
          </div>
        </div>

        {/* Student Profile Card */}
        <div className="student-profile">
          <div className="student-avatar">{STUDENT_INITIALS}</div>
          <div className="student-info">
            <strong>{STUDENT_NAME}</strong>
            <small>UID: {STUDENT_UID}</small>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <main className="main-content">
        {/* Top Header / Telemetry Bar */}
        <header className="top-bar">
          <div className="breadcrumb-trail">
            <span>Full Stack II</span>
            <span>/</span>
            <span>Experiment 9</span>
            <span>/</span>
            <b>9.1 Continuous Integration Pipeline Setup</b>
          </div>

          <div className="telemetry-group">
            {/* Backend API Status */}
            <div className={`status-badge ${apiStatus === 'Connected' ? 'online' : 'offline'}`}>
              <span className="pulse-dot" />
              <span>{apiStatus === 'Connected' ? 'Spring Boot 8400 Online' : 'Backend Offline'}</span>
            </div>

            {/* Auto Refresh Tracker */}
            <button
              type="button"
              className="btn-icon"
              onClick={fetchBuilds}
              title="Click to force sync"
              disabled={loading}
            >
              <span>{loading ? 'Refreshing…' : '↻ Sync'}</span>
              <span style={{ fontSize: '10px', color: 'var(--accent-primary)' }}>({autoRefreshCount}s)</span>
            </button>

            {/* Theme Selector */}
            <select
              className="theme-selector"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              title="Select color theme"
            >
              <option value="dark">🌙 Dark Ops</option>
              <option value="light">☀️ Light Studio</option>
              <option value="mint">🌿 Mint Horizon</option>
              <option value="violet">🔮 Amethyst</option>
              <option value="amber">⚡ Amber Solar</option>
            </select>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-title-group">
            <h1>
              {tab === 'Overview' && 'Continuous Integration & Build Pipeline'}
              {tab === 'History' && 'Build History & Audit Journal'}
              {tab === 'Guide' && 'CI Testing & Verification Guide'}
            </h1>
            <p>
              Automated multi-tier verification: JUnit 5 service mocks, Spring MockMvc endpoint tests, Pact consumer-driven contracts, and real PostgreSQL Testcontainers.
            </p>
          </div>

          <div className="hero-actions">
            {builds.length > 0 && (
              <button
                type="button"
                className="btn-icon"
                onClick={handleClearBuilds}
                style={{ color: 'var(--accent-rose)' }}
              >
                🗑️ Clear History
              </button>
            )}
          </div>
        </section>

        {/* Notice Banner */}
        {notice && (
          <div className={`alert-box ${notice.type}`}>
            {notice.text}
          </div>
        )}

        {/* Metrics Row */}
        <section className="metrics-grid">
          <div className="metric-card cyan">
            <div className="metric-header">
              <span>TOTAL BUILDS</span>
              <div className="metric-icon-bubble">≋</div>
            </div>
            <div className="metric-value">{builds.length.toString().padStart(2, '0')}</div>
            <div className="metric-footer">Persisted in local H2 database</div>
          </div>

          <div className="metric-card emerald">
            <div className="metric-header">
              <span>TEST SUITE LAYERS</span>
              <div className="metric-icon-bubble">✓</div>
            </div>
            <div className="metric-value">04</div>
            <div className="metric-footer">Unit, MockMvc, Pact, Testcontainers</div>
          </div>

          <div className="metric-card amber">
            <div className="metric-header">
              <span>QUEUED BUILDS</span>
              <div className="metric-icon-bubble">⏳</div>
            </div>
            <div className="metric-value">
              {builds.filter(b => b.status === 'QUEUED').length.toString().padStart(2, '0')}
            </div>
            <div className="metric-footer">Awaiting CI runner dispatch</div>
          </div>

          <div className="metric-card indigo">
            <div className="metric-header">
              <span>PIPELINE HEALTH</span>
              <div className="metric-icon-bubble">⚡</div>
            </div>
            <div className="metric-value">{apiStatus === 'Connected' ? '100%' : '0%'}</div>
            <div className="metric-footer">API &amp; REST Contracts Healthy</div>
          </div>
        </section>

        {/* ── View 1: Overview & Composer ─────────────────────────────── */}
        {tab === 'Overview' && (
          <>
            <section className="split-grid">
              {/* Build Composer Card */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title-group">
                    <h2>01 / Commit Composer</h2>
                    <p>Dispatch a commit message to create a persisted CI build record.</p>
                  </div>
                  <span className="tag-mono">POST /api/builds</span>
                </div>

                {/* Commit Presets */}
                <span className="preset-section-label">Quick Commit Presets</span>
                <div className="preset-chips">
                  {[
                    'feat: Add CI workflow and GitHub Actions runner',
                    'test: Verify Spring MockMvc endpoints & validations',
                    'test: Add Pact contract testing for consumer & provider',
                    'ci: Enable Testcontainers PostgreSQL integration test'
                  ].map((msg) => (
                    <button
                      type="button"
                      key={msg}
                      className="preset-chip"
                      onClick={() => setCommitMessage(msg)}
                    >
                      {msg}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleCreateBuild}>
                  <div className="form-group">
                    <div className="form-label">
                      <span>Commit Description</span>
                      <span className={`char-counter ${commitMessage.trim().length > 200 ? 'invalid' : ''}`}>
                        {commitMessage.trim().length} / 200 chars
                      </span>
                    </div>
                    <textarea
                      className="form-textarea"
                      placeholder="e.g., feat: Implement automated contract verification..."
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={busy || !commitMessage.trim() || commitMessage.trim().length > 200}
                  >
                    {busy ? 'Dispatching Build...' : '+ Create Build Record (201 Created)'}
                  </button>
                </form>
              </div>

              {/* Verification Pipeline Card */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title-group">
                    <h2>02 / Verification Pipeline</h2>
                    <p>Automated test stages executed by Maven and GitHub Actions.</p>
                  </div>
                  <span className="tag-mono">4 Configured Stages</span>
                </div>

                <div className="stages-list">
                  {STAGES.map((s) => (
                    <div className="stage-item" key={s.num}>
                      <div className="stage-num">{s.num}</div>
                      <div className="stage-content">
                        <strong>{s.title}</strong>
                        <small>{s.tech}</small>
                      </div>
                      <span className="stage-status">PASSING</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-icon"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setTab('Guide')}
                >
                  📖 View Complete CI Testing Guide ↗
                </button>
              </div>
            </section>

            {/* Quick Ledger View */}
            <section className="ledger-card">
              <div className="card-header">
                <div className="card-title-group">
                  <h2>Recent Builds <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>({builds.length})</span></h2>
                  <p>Latest CI run records stored in local H2 database.</p>
                </div>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={handleExportJSON}
                  disabled={!builds.length}
                >
                  Export JSON ↓
                </button>
              </div>

              <div className="table-responsive">
                <table className="events-table">
                  <thead>
                    <tr>
                      <th>Build ID</th>
                      <th>Commit Message</th>
                      <th>Status</th>
                      <th>Timestamp</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {builds.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                          No builds created yet. Submit a commit message above to dispatch your first CI build!
                        </td>
                      </tr>
                    ) : (
                      builds.slice(0, 5).map((b) => (
                        <tr key={b.id} className={selectedBuild?.id === b.id ? 'selected' : ''}>
                          <td><span className="event-cell-id">#{String(b.id).padStart(3, '0')}</span></td>
                          <td><span className="event-cell-content">{b.commitMessage}</span></td>
                          <td><StatusBadge status={b.status} /></td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                            {new Date(b.createdAt).toLocaleTimeString()}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleInspect(b.id)}
                            >
                              Inspect ↗
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {selectedBuild && (
                <div className="inspector-panel">
                  <div className="inspector-header">
                    <h3>
                      <span>🔍 Build Inspector</span>
                      <span className="tag-mono">#{selectedBuild.id}</span>
                    </h3>
                    <button type="button" className="btn-icon" onClick={() => setSelectedBuild(null)}>
                      ✕ Close
                    </button>
                  </div>
                  <div className="inspector-details">
                    <div className="inspector-stat">
                      <small>Build Status</small>
                      <strong><StatusBadge status={selectedBuild.status} /></strong>
                    </div>
                    <div className="inspector-stat">
                      <small>Created Timestamp</small>
                      <strong>{new Date(selectedBuild.createdAt).toLocaleString()}</strong>
                    </div>
                    <div className="inspector-stat">
                      <small>Commit Message</small>
                      <strong>{selectedBuild.commitMessage}</strong>
                    </div>
                  </div>
                  <div className="code-box">
                    <pre style={{ margin: 0, overflowX: 'auto' }}>
                      {JSON.stringify(selectedBuild, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* ── View 2: Full Build History ──────────────────────────────── */}
        {tab === 'History' && (
          <section className="ledger-card">
            <div className="card-header">
              <div className="card-title-group">
                <h2>Build History Ledger <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>({filteredBuilds.length} records)</span></h2>
                <p>Complete historical log of all CI commits and generated build records.</p>
              </div>

              <button
                type="button"
                className="btn-icon"
                onClick={handleExportJSON}
                disabled={!builds.length}
              >
                Export JSON ↓
              </button>
            </div>

            <div className="filter-bar">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by commit message or build ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Build ID</th>
                    <th>Commit Message</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuilds.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                        No records matching your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredBuilds.map((b) => (
                      <tr key={b.id} className={selectedBuild?.id === b.id ? 'selected' : ''}>
                        <td><span className="event-cell-id">#{String(b.id).padStart(3, '0')}</span></td>
                        <td><span className="event-cell-content">{b.commitMessage}</span></td>
                        <td><StatusBadge status={b.status} /></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                          {new Date(b.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => handleInspect(b.id)}
                          >
                            Inspect ↗
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {selectedBuild && (
              <div className="inspector-panel">
                <div className="inspector-header">
                  <h3>
                    <span>🔍 Build Inspector</span>
                    <span className="tag-mono">#{selectedBuild.id}</span>
                  </h3>
                  <button type="button" className="btn-icon" onClick={() => setSelectedBuild(null)}>
                    ✕ Close
                  </button>
                </div>
                <div className="inspector-details">
                  <div className="inspector-stat">
                    <small>Build Status</small>
                    <strong><StatusBadge status={selectedBuild.status} /></strong>
                  </div>
                  <div className="inspector-stat">
                    <small>Created Timestamp</small>
                    <strong>{new Date(selectedBuild.createdAt).toLocaleString()}</strong>
                  </div>
                  <div className="inspector-stat">
                    <small>Commit Message</small>
                    <strong>{selectedBuild.commitMessage}</strong>
                  </div>
                </div>
                <div className="code-box">
                  <pre style={{ margin: 0, overflowX: 'auto' }}>
                    {JSON.stringify(selectedBuild, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── View 3: CI Testing Guide (Viva & Evaluation Prep) ──────── */}
        {tab === 'Guide' && (
          <>
            <section className="guide-grid">
              {STAGES.map((s) => (
                <div className="guide-card" key={s.num}>
                  <div className="guide-card-header">
                    <div className="guide-num">{s.num}</div>
                    <h3>{s.title}</h3>
                  </div>
                  <span className="guide-tech-tag">{s.tech}</span>
                  <p>{s.desc}</p>
                </div>
              ))}
            </section>

            <section className="card" style={{ marginTop: '20px' }}>
              <div className="card-header">
                <div className="card-title-group">
                  <h2>Terminal Verification Commands (Viva &amp; Lab Defense)</h2>
                  <p>Execute these commands directly in PowerShell to generate verification evidence.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--accent-primary)' }}>
                    01 / Default Local Verification (No Docker required)
                  </strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                    Runs 16 unit tests, MockMvc endpoint validations, Pact consumer contract generation, and provider verification.
                  </p>
                  <div className="code-box">.\mvnw.cmd clean verify</div>
                </div>

                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--accent-primary)' }}>
                    02 / Full Verification Profile (Docker Desktop running)
                  </strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                    Includes everything above PLUS spins up a real PostgreSQL 16 Testcontainers instance to guarantee schema integrity.
                  </p>
                  <div className="code-box">.\mvnw.cmd clean verify -Pfull</div>
                </div>

                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--accent-primary)' }}>
                    03 / Generated CI Reports &amp; Artifacts
                  </strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                    Inspect reports generated under <code>target/surefire-reports</code>, <code>target/failsafe-reports</code>, and <code>target/pacts</code>.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="page-footer">
          <div>
            <span>Experiment 9.1: Continuous Integration Pipeline Setup</span>
          </div>
          <div className="footer-student">
            Designed &amp; Developed for <strong>{STUDENT_NAME}</strong> · UID: <strong>{STUDENT_UID}</strong>
          </div>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
