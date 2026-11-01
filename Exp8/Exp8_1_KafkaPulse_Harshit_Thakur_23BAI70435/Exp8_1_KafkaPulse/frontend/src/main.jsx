import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const STUDENT_NAME = "Harshit Thakur";
const STUDENT_UID = "23BAI70435";
const STUDENT_INITIALS = "HT";

const STATUS_LIST = ['ALL', 'QUEUED', 'PROCESSING', 'RETRYING', 'PROCESSED', 'DLQ', 'PUBLISH_FAILED'];

function generateEventId() {
  const ts = Date.now().toString().slice(-6);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EVT-${ts}-${rand}`;
}

function formatTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return isoString;
  }
}

function StatusBadge({ status }) {
  const s = status || 'QUEUED';
  const label = s.replace(/_/g, ' ');
  return (
    <span className={`badge badge-${s.toLowerCase()}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}

function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('kafkapulse_theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kafkapulse_theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  // Core Data States
  const [events, setEvents] = useState([]);
  const [apiConnected, setApiConnected] = useState(false);
  const [brokerStatus, setBrokerStatus] = useState('CHECKING');
  const [brokerInfo, setBrokerInfo] = useState('localhost:9092');
  const [lastSync, setLastSync] = useState(null);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState(2);

  // Form States
  const [eventId, setEventId] = useState(generateEventId);
  const [content, setContent] = useState('Publish real-time telemetry updates to scheduled-posts topic.');
  const [failures, setFailures] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  // Filter & Navigation States
  const [activeTab, setActiveTab] = useState('Overview');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(null);

  const isMounted = useRef(true);

  // API Call: Fetch Events
  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events', { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error('API returned ' + res.status);
      const data = await res.json();
      if (Array.isArray(data) && isMounted.current) {
        setEvents(data);
        setApiConnected(true);
        setLastSync(new Date());
      }
    } catch {
      if (isMounted.current) setApiConnected(false);
    }
  };

  // API Call: Check Broker Health
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health', { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (isMounted.current) {
        setBrokerStatus(data.kafka || 'DOWN');
        if (data.broker) setBrokerInfo(data.broker);
      }
    } catch {
      if (isMounted.current) setBrokerStatus('DOWN');
    }
  };

  // Polling Effect
  useEffect(() => {
    isMounted.current = true;
    fetchEvents();
    checkHealth();

    const intervalEvents = setInterval(() => {
      fetchEvents();
      setAutoRefreshCountdown(2);
    }, 2000);

    const intervalHealth = setInterval(checkHealth, 8000);

    const intervalCountdown = setInterval(() => {
      setAutoRefreshCountdown(c => (c > 0 ? c - 1 : 2));
    }, 1000);

    return () => {
      isMounted.current = false;
      clearInterval(intervalEvents);
      clearInterval(intervalHealth);
      clearInterval(intervalCountdown);
    };
  }, []);

  // Form Submit Handler
  const handlePublish = async (e) => {
    if (e) e.preventDefault();
    if (!eventId.trim() || !content.trim()) return;

    setSubmitting(true);
    setNotice(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventId.trim(),
          content: content.trim(),
          failuresBeforeSuccess: Number(failures)
        }),
        signal: AbortSignal.timeout(20000)
      });

      const data = await res.json();

      if (res.status === 409) {
        setNotice({
          type: 'error',
          text: `🛡️ HTTP 409 Conflict: Event ID '${eventId}' already exists in ledger. Idempotency check prevented duplicate event publishing.`
        });
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || `Publish failed with status ${res.status}`);
      }

      setSelectedEventId(data.eventId);
      setNotice({
        type: 'success',
        text: `✓ Event ${data.eventId} successfully queued on topic 'scheduled-posts'. Consumer will process with ${failures} simulated failures.`
      });

      await fetchEvents();
    } catch (err) {
      setNotice({
        type: 'error',
        text: err.message === 'Failed to fetch'
          ? 'Cannot reach Spring Boot backend. Please ensure it is running on http://localhost:8300.'
          : err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Scenario Presets
  const applyPreset = (failCount, title) => {
    setFailures(failCount);
    setEventId(generateEventId());
    if (failCount === 0) {
      setContent('Scheduled notification successfully processed on initial attempt.');
    } else if (failCount === 2) {
      setContent('Transient database timeout simulated. Recovered after 2 exponential backoff retries.');
    } else if (failCount >= 10) {
      setContent('Critical downstream failure simulated. Maximum 3 retries exhausted; safely routed to DLQ.');
    }
    setNotice(null);
  };

  // Duplicate Scenario Tester
  const testDuplicate = (existingId) => {
    setEventId(existingId);
    setContent('Duplicate test packet attempting to overwrite existing record.');
    setFailures(0);
    setNotice({
      type: 'error',
      text: `Ready to test idempotency: Click 'Publish Event' to verify HTTP 409 Conflict rejection for ID: ${existingId}`
    });
  };

  // Clear Database
  const handleClearLedger = async () => {
    if (!window.confirm("Are you sure you want to clear all persisted event records from H2?")) return;
    try {
      const res = await fetch('/api/events', { method: 'DELETE' });
      if (res.ok) {
        setSelectedEventId(null);
        setNotice({ type: 'success', text: 'All events cleared from H2 ledger.' });
        fetchEvents();
      }
    } catch (err) {
      setNotice({ type: 'error', text: 'Failed to clear ledger: ' + err.message });
    }
  };

  // Metrics Calculations
  const totalCount = events.length;
  const processedCount = events.filter(e => e.status === 'PROCESSED').length;
  const retryingCount = events.filter(e => e.status === 'RETRYING' || (e.attempts > 1 && e.status !== 'DLQ' && e.status !== 'PROCESSED')).length;
  const dlqCount = events.filter(e => e.status === 'DLQ').length;

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (activeTab === 'DLQ' && e.status !== 'DLQ') return false;
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (e.eventId || '').toLowerCase().includes(q);
        const matchesContent = (e.content || '').toLowerCase().includes(q);
        if (!matchesId && !matchesContent) return false;
      }
      return true;
    });
  }, [events, activeTab, statusFilter, searchQuery]);

  const inspectedEvent = events.find(e => e.eventId === selectedEventId);

  return (
    <div className="shell">
      {/* ── Left Sidebar Navigation ─────────────────────────────────── */}
      <aside className="sidebar">
        <a className="brand-wrapper" href="#">
          <div className="brand-logo">⚡</div>
          <div className="brand-text">
            <h2>KafkaPulse <span className="brand-badge">Exp 8.1</span></h2>
            <p>EVENT RELIABILITY & DLQ LAB</p>
          </div>
        </a>

        <div className="sidebar-nav-title">Navigation</div>
        <nav className="nav-links">
          <button
            type="button"
            className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Overview'); setStatusFilter('ALL'); }}
          >
            <span className="nav-icon">📊</span>
            Overview &amp; Producer
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'Ledger' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Ledger'); setStatusFilter('ALL'); }}
          >
            <span className="nav-icon">📑</span>
            Event Ledger
            <span className="nav-counter" style={{ background: 'var(--badge-queued-bg)', color: 'var(--accent-indigo)' }}>
              {totalCount}
            </span>
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'DLQ' ? 'active' : ''}`}
            onClick={() => { setActiveTab('DLQ'); setStatusFilter('ALL'); }}
          >
            <span className="nav-icon">☠️</span>
            Dead-Letter Queue
            {dlqCount > 0 && <span className="nav-counter">{dlqCount}</span>}
          </button>
        </nav>

        {/* Sidebar Info Card */}
        <div className="sidebar-card">
          <div className="sidebar-card-header">
            <span className="sidebar-card-title">Cluster Status</span>
            <span className={`pulse-dot`} style={{ color: brokerStatus === 'UP' ? '#10b981' : '#f43f5e' }} />
          </div>
          <p>Spring Kafka Kraft consumer active on topic <code>scheduled-posts</code>.</p>
          <div className="broker-pill">
            <span>Broker:</span>
            <strong>{brokerInfo}</strong>
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
            <span>Experiment 8</span>
            <span>/</span>
            <b>8.1 Kafka Producer-Consumer Implementation</b>
          </div>

          <div className="telemetry-group">
            {/* Backend API Status */}
            <div className={`status-badge ${apiConnected ? 'online' : 'offline'}`}>
              <span className="pulse-dot" />
              <span>{apiConnected ? 'Spring Boot 8300 Online' : 'Backend Disconnected'}</span>
            </div>

            {/* Kafka Broker Status */}
            <div className={`status-badge ${brokerStatus === 'UP' ? 'online' : 'offline'}`}>
              <span className="pulse-dot" />
              <span>{brokerStatus === 'UP' ? 'Kafka 9092 UP' : 'Kafka Broker Down'}</span>
            </div>

            {/* Auto Refresh Tracker */}
            <button
              type="button"
              className="btn-icon"
              onClick={() => { fetchEvents(); checkHealth(); }}
              title="Click to force sync"
            >
              <span>↻ Sync</span>
              <span style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>({autoRefreshCountdown}s)</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              className="btn-icon"
              onClick={toggleTheme}
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-title-group">
            <h1>
              {activeTab === 'Overview' && 'Reliable Event Streaming & Dead-Letter Queue'}
              {activeTab === 'Ledger' && 'Complete Event Ledger & Audit Trail'}
              {activeTab === 'DLQ' && 'Dead-Letter Queue (DLQ) Failure Isolation'}
            </h1>
            <p>
              Simulate transient network faults, inspect automated exponential backoff retries (1s, 2s, 4s), and guarantee zero message loss.
            </p>
          </div>

          <div className="hero-actions">
            {events.length > 0 && (
              <button
                type="button"
                className="btn-icon"
                onClick={handleClearLedger}
                style={{ color: 'var(--accent-rose)' }}
              >
                🗑️ Clear Ledger
              </button>
            )}
          </div>
        </section>

        {/* Metrics Row */}
        <section className="metrics-grid">
          <div className="metric-card cyan">
            <div className="metric-header">
              <span>TOTAL PERSISTED</span>
              <div className="metric-icon-bubble">≋</div>
            </div>
            <div className="metric-value">{totalCount.toString().padStart(2, '0')}</div>
            <div className="metric-footer">Events submitted to Kafka cluster</div>
          </div>

          <div className="metric-card emerald">
            <div className="metric-header">
              <span>PROCESSED</span>
              <div className="metric-icon-bubble">✓</div>
            </div>
            <div className="metric-value">{processedCount.toString().padStart(2, '0')}</div>
            <div className="metric-footer">Successfully acknowledged by consumer</div>
          </div>

          <div className="metric-card amber">
            <div className="metric-header">
              <span>RECOVERED / RETRYING</span>
              <div className="metric-icon-bubble">↻</div>
            </div>
            <div className="metric-value">{retryingCount.toString().padStart(2, '0')}</div>
            <div className="metric-footer">Handled transient fault &amp; backoff</div>
          </div>

          <div className="metric-card rose">
            <div className="metric-header">
              <span>DEAD-LETTER QUEUE</span>
              <div className="metric-icon-bubble">☠️</div>
            </div>
            <div className="metric-value">{dlqCount.toString().padStart(2, '0')}</div>
            <div className="metric-footer">Exhausted 3 retries (isolated safely)</div>
          </div>
        </section>

        {/* Kafka Visual Architecture Pipeline */}
        <section className="pipeline-card">
          <div className="pipeline-title">
            <h3>⚡ End-to-End Event Stream Lifecycle</h3>
            <span className="tag-mono">Spring Kafka 3.4 + Kraft</span>
          </div>

          <div className="pipeline-flow">
            <div className="flow-node">
              <span className="flow-step-tag">Step 1</span>
              <h4>REST API Producer</h4>
              <p>POST /api/events</p>
            </div>
            <div className="flow-arrow">➔</div>

            <div className="flow-node">
              <span className="flow-step-tag">Step 2</span>
              <h4>Main Topic</h4>
              <p>scheduled-posts (P:1)</p>
            </div>
            <div className="flow-arrow">➔</div>

            <div className="flow-node">
              <span className="flow-step-tag">Step 3</span>
              <h4>Consumer Listener</h4>
              <p>@KafkaListener</p>
            </div>
            <div className="flow-arrow">➔</div>

            <div className="flow-node">
              <span className="flow-step-tag">Step 4</span>
              <h4>Backoff Engine</h4>
              <p>1s ➔ 2s ➔ 4s (3 retries)</p>
            </div>
            <div className="flow-arrow">➔</div>

            <div className="flow-node" style={{ borderColor: 'var(--accent-emerald)' }}>
              <span className="flow-step-tag" style={{ color: 'var(--accent-emerald)' }}>Outcome A</span>
              <h4 style={{ color: 'var(--accent-emerald)' }}>Success</h4>
              <p>Status: PROCESSED</p>
            </div>

            <div className="flow-node" style={{ borderColor: 'var(--accent-rose)' }}>
              <span className="flow-step-tag" style={{ color: 'var(--accent-rose)' }}>Outcome B</span>
              <h4 style={{ color: 'var(--accent-rose)' }}>DLQ Isolation</h4>
              <p>scheduled-posts-dlq</p>
            </div>
          </div>
        </section>

        {/* Composer & Policy Split Grid */}
        {activeTab === 'Overview' && (
          <section className="split-grid">
            {/* Event Composer Card */}
            <div className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <h2>01 / Event Producer</h2>
                  <p>Choose an automated test scenario or craft custom event parameters.</p>
                </div>
                <span className="tag-mono">Topic: scheduled-posts</span>
              </div>

              {/* Scenario Presets */}
              <span className="preset-section-label">Automated Scenarios</span>
              <div className="presets-container">
                <button
                  type="button"
                  className={`preset-btn ${Number(failures) === 0 ? 'active' : ''}`}
                  onClick={() => applyPreset(0, 'Normal')}
                >
                  <span className="preset-badge">Happy Path</span>
                  <strong>Normal Flow</strong>
                  <small>0 failures · 1 attempt</small>
                </button>

                <button
                  type="button"
                  className={`preset-btn ${Number(failures) === 2 ? 'active' : ''}`}
                  onClick={() => applyPreset(2, 'Retry')}
                >
                  <span className="preset-badge">Transient</span>
                  <strong>Retry Twice</strong>
                  <small>2 failures · 3 attempts</small>
                </button>

                <button
                  type="button"
                  className={`preset-btn ${Number(failures) >= 10 ? 'active' : ''}`}
                  onClick={() => applyPreset(10, 'DLQ')}
                >
                  <span className="preset-badge">Poison Pill</span>
                  <strong>Route to DLQ</strong>
                  <small>10 failures · 4 attempts</small>
                </button>
              </div>

              {/* Composer Form */}
              <form onSubmit={handlePublish}>
                <div className="form-group">
                  <div className="form-label">
                    <span>Event Identifier</span>
                    <button
                      type="button"
                      className="form-link-btn"
                      onClick={() => setEventId(generateEventId())}
                    >
                      + Generate New ID
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="form-label">
                    <span>Scheduled Post Content</span>
                  </div>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ width: '130px', marginBottom: 0 }}>
                    <div className="form-label">
                      <span>Simulated Faults</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-input"
                      value={failures}
                      onChange={(e) => setFailures(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting || !apiConnected || !content.trim()}
                    style={{ flex: 1 }}
                  >
                    {submitting ? 'Publishing to Kafka...' : 'Publish Event →'}
                  </button>
                </div>
              </form>

              {/* Notice Banner */}
              {notice && (
                <div className={`alert-box ${notice.type}`}>
                  {notice.text}
                </div>
              )}
            </div>

            {/* Reliability Policy Card */}
            <div className="card policy-card">
              <div className="card-header">
                <div className="card-title-group">
                  <h2>02 / Reliability Policy</h2>
                  <p>Exponential backoff intervals with non-blocking Dead-Letter topic routing.</p>
                </div>
                <span className="tag-mono">Policy: DefaultErrorHandler</span>
              </div>

              <div className="retry-timeline">
                <div className="retry-step">
                  <span>Initial</span>
                  <strong>0s</strong>
                  <small>Attempt 1</small>
                </div>
                <div className="retry-step">
                  <span>Retry 1</span>
                  <strong>1.0s</strong>
                  <small>Attempt 2</small>
                </div>
                <div className="retry-step">
                  <span>Retry 2</span>
                  <strong>2.0s</strong>
                  <small>Attempt 3</small>
                </div>
                <div className="retry-step">
                  <span>Retry 3</span>
                  <strong>4.0s</strong>
                  <small>Final Attempt</small>
                </div>
              </div>

              <div className="policy-list">
                <div className="policy-item">
                  <span>Retry Exhaustion Handling</span>
                  <strong className="highlight">DeadLetterPublishingRecoverer (DLQ)</strong>
                </div>
                <div className="policy-item">
                  <span>Duplicate Submission Guard</span>
                  <strong>HTTP 409 Conflict (Idempotent)</strong>
                </div>
                <div className="policy-item">
                  <span>Producer Acknowledgement</span>
                  <strong>acks = all (Leader + ISR)</strong>
                </div>
                <div className="policy-item">
                  <span>Persistence Layer</span>
                  <strong>H2 File-Backed Engine</strong>
                </div>
              </div>

              <div className="broker-pill" style={{ marginTop: 'auto' }}>
                <span>Health:</span>
                <strong style={{ color: brokerStatus === 'UP' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  Broker {brokerStatus === 'UP' ? 'Healthy & Acknowledging' : 'Unreachable'}
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* Event Ledger Card */}
        <section className="ledger-card">
          <div className="card-header">
            <div className="card-title-group">
              <h2>
                {activeTab === 'DLQ' ? 'Dead-Letter Queue Monitor' : 'Event Ledger'}
                <span style={{ fontSize: '13px', color: 'var(--text-dim)', marginLeft: '8px' }}>
                  ({filteredEvents.length} records)
                </span>
              </h2>
              <p>Real-time audit log of all events processed through Apache Kafka.</p>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              {lastSync ? `Last synced: ${lastSync.toLocaleTimeString()}` : 'Connecting...'}
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="form-input"
                placeholder="Search by event ID or message content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-pills">
              {STATUS_LIST.map((st) => (
                <button
                  type="button"
                  key={st}
                  className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event ID &amp; Content</th>
                  <th>Status</th>
                  <th>Attempts</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                      No events matching current query or filters. Publish a scenario above to test!
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => (
                    <tr
                      key={ev.eventId}
                      className={selectedEventId === ev.eventId ? 'selected' : ''}
                    >
                      <td>
                        <span className="event-cell-id">{ev.eventId}</span>
                        <div className="event-cell-content">{ev.content}</div>
                      </td>
                      <td>
                        <StatusBadge status={ev.status} />
                      </td>
                      <td>
                        <div className="attempt-bar">
                          <div className="attempt-track">
                            <div
                              className="attempt-fill"
                              style={{ width: `${Math.min(100, (ev.attempts / 4) * 100)}%` }}
                            />
                          </div>
                          <span className="attempt-count">{ev.attempts} / 4</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                        {formatTime(ev.updatedAt)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => setSelectedEventId(selectedEventId === ev.eventId ? null : ev.eventId)}
                          >
                            {selectedEventId === ev.eventId ? 'Close' : 'Inspect'}
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--accent-amber)' }}
                            onClick={() => testDuplicate(ev.eventId)}
                            title="Test duplicate idempotency protection"
                          >
                            Test Dup
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Inspector Panel Drawer */}
          {inspectedEvent && (
            <div className="inspector-panel">
              <div className="inspector-header">
                <h3>
                  <span>🔍 Event Inspector</span>
                  <span className="tag-mono">{inspectedEvent.eventId}</span>
                </h3>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => setSelectedEventId(null)}
                >
                  ✕ Close
                </button>
              </div>

              <div className="inspector-details">
                <div className="inspector-stat">
                  <small>Current Lifecycle State</small>
                  <strong><StatusBadge status={inspectedEvent.status} /></strong>
                </div>

                <div className="inspector-stat">
                  <small>Attempts / Target Failures</small>
                  <strong>{inspectedEvent.attempts} / {inspectedEvent.failuresBeforeSuccess}</strong>
                </div>

                <div className="inspector-stat">
                  <small>Created Timestamp</small>
                  <strong>{new Date(inspectedEvent.createdAt).toLocaleTimeString()}</strong>
                </div>

                <div className="inspector-stat">
                  <small>Last Modified</small>
                  <strong>{new Date(inspectedEvent.updatedAt).toLocaleTimeString()}</strong>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <div className="form-label">
                  <span>Message Payload</span>
                </div>
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {inspectedEvent.content}
                </div>
              </div>

              {inspectedEvent.lastError && (
                <div className="error-banner">
                  <strong>Last Error Log:</strong> {inspectedEvent.lastError}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="page-footer">
          <div>
            <span>Experiment 8.1: Kafka Producer-Consumer Implementation</span>
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
