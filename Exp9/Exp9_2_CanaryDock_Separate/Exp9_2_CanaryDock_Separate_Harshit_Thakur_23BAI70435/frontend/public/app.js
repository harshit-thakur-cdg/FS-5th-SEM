"use strict";

/**
 * CanaryDock Telemetry & Release Console
 * Student: Harshit Thakur | UID: 23BAI70435 | Full Stack II
 */

const $ = id => document.getElementById(id);

let state = null;
let enabled = false;
let busy = false;
let toastTimer = null;
let streamTimer = null;

// Student Identity
const STUDENT = {
  name: "Harshit Thakur",
  uid: "23BAI70435",
  course: "Full Stack II",
  batch: "CO6 / BT6"
};

// ---------------- Toast Notifications ----------------
function showToast(message, isError = false) {
  clearTimeout(toastTimer);
  const toast = $('toast');
  toast.textContent = message;
  toast.className = 'show' + (isError ? ' error' : '');
  toastTimer = setTimeout(() => {
    toast.className = '';
  }, 4500);
}

// ---------------- Theme Management ----------------
function initTheme() {
  const savedTheme = localStorage.getItem('canarydock_theme') || 'dark';
  applyTheme(savedTheme);

  $('theme-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('canarydock_theme', theme);
  const icon = $('theme-toggle').querySelector('.theme-icon');
  const label = $('theme-toggle').querySelector('.theme-label');
  if (theme === 'dark') {
    icon.textContent = '☀️';
    label.textContent = 'Light';
  } else {
    icon.textContent = '🌙';
    label.textContent = 'Dark';
  }
}

// ---------------- API Helper ----------------
async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    signal: AbortSignal.timeout(10000),
    cache: 'no-store'
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `API error (${response.status})`);
  }
  return data;
}

// ---------------- Button State Updates ----------------
function updateButtons() {
  const active = state?.phase === 'CANARY';
  $('start').disabled = busy || !enabled || active;
  $('version').disabled = busy || !enabled || active;
  $('traffic').disabled = busy || !active;
  $('advance').disabled = busy || !active || state.batch === 0 || state.faulty;
  $('fault').disabled = busy || !active;
  $('rollback').disabled = busy || !(active || state?.phase === 'PROMOTED');
  $('reset').disabled = busy || !enabled;
  $('export').disabled = !state;
}

// ---------------- Main UI Render ----------------
function render(s) {
  state = s;
  const active = s.phase === 'CANARY';
  const total = s.stableHits + s.canaryHits;

  // Phase labels
  const phaseLabels = {
    READY: 'Ready to launch candidate',
    CANARY: 'Canary rollout active (monitoring telemetry)',
    PROMOTED: 'Candidate promoted to 100% stable',
    ROLLED_BACK: 'Emergency rollback: Baseline restored'
  };

  // Top Metrics
  $('stable-version').textContent = s.stable;
  $('weight').textContent = `${s.weight}%`;
  $('requests').textContent = total.toLocaleString();

  const phaseEl = $('phase');
  phaseEl.textContent = s.phase.replace(/_/g, ' ');
  if (s.phase === 'ROLLED_BACK') {
    phaseEl.style.color = 'var(--red-danger)';
    $('stage-badge').textContent = 'ROLLED BACK';
    $('stage-badge').style.color = 'var(--red-danger)';
  } else if (s.phase === 'PROMOTED') {
    phaseEl.style.color = 'var(--teal-primary)';
    $('stage-badge').textContent = 'PROMOTED 100%';
    $('stage-badge').style.color = 'var(--teal-primary)';
  } else if (active) {
    phaseEl.style.color = 'var(--orange-canary)';
    $('stage-badge').textContent = `STAGE: ${s.weight}%`;
    $('stage-badge').style.color = 'var(--orange-canary)';
  } else {
    phaseEl.style.color = 'var(--text-main)';
    $('stage-badge').textContent = 'STANDBY';
    $('stage-badge').style.color = 'var(--text-dim)';
  }

  $('phase-copy').textContent = phaseLabels[s.phase] || s.phase;
  $('exposure-copy').textContent = active
    ? `Controlled canary blast radius: ${s.weight}%`
    : s.phase === 'PROMOTED'
    ? 'Full production promotion verified'
    : 'All traffic routed to baseline';

  $('success-copy').textContent = total
    ? `${((total - s.failures) / total * 100).toFixed(1)}% simulated success rate`
    : 'No traffic batches simulated yet';

  // Topology Card
  $('map-canary').textContent = `${s.weight}%`;
  $('map-stable').textContent = `${100 - s.weight}%`;
  $('topo-stable-version').textContent = `${s.stable} (Slot: A)`;
  $('topo-canary-version').textContent = active ? `${s.candidate} (Slot: B)` : 'None Active';

  // Donut Chart & Legends
  $('donut-value').textContent = `${s.weight}%`;
  $('canary-percent').textContent = `${s.weight}%`;
  $('stable-percent').textContent = `${100 - s.weight}%`;
  $('donut').style.background = `conic-gradient(var(--orange-canary) ${s.weight * 3.6}deg, var(--teal-primary) 0deg)`;
  $('donut').setAttribute('aria-label', `Canary traffic ${s.weight} percent`);

  $('legend-stable-version').textContent = s.phase === 'PROMOTED' ? `${s.stable} (Baseline)` : s.stable;
  $('legend-canary-version').textContent = active ? s.candidate : (s.phase === 'PROMOTED' ? s.candidate : 'None');

  // Counters
  $('stable-hits').textContent = s.stableHits.toLocaleString();
  $('canary-hits').textContent = s.canaryHits.toLocaleString();
  $('failed-hits').textContent = s.failures.toLocaleString();

  // Health Score & Gauge
  const score = s.healthScore !== undefined ? s.healthScore : (total === 0 ? 100 : Math.round(((total - s.failures) / total) * 100));
  $('health-score-val').textContent = `${score}%`;
  const bar = $('health-bar-fill');
  bar.style.width = `${score}%`;
  if (score < 90) {
    bar.style.backgroundColor = 'var(--red-danger)';
  } else if (score < 98) {
    bar.style.backgroundColor = 'var(--orange-canary)';
  } else {
    bar.style.backgroundColor = 'var(--teal-primary)';
  }

  // Simulated Latency
  $('stable-latency').textContent = `${s.stableLatencyMs || 21} ms`;
  $('canary-latency').textContent = `${s.canaryLatencyMs || (s.faulty ? 420 : 25)} ms`;
  $('blast-radius').textContent = active ? `${s.weight}% MAX` : '0% (IDLE)';

  // Stepper Visual Nodes
  for (const w of [10, 50, 100]) {
    const el = $('step-' + w);
    if (el) el.classList.toggle('active', s.weight >= w);
  }

  // Fault Button
  const faultBtn = $('fault');
  faultBtn.textContent = s.faulty ? '⚠️ Disarm Failure Injection' : '⚠️ Inject Candidate Anomaly (HTTP 500)';
  faultBtn.classList.toggle('active', s.faulty);

  // Advance Button
  $('advance').textContent = s.weight === 50 ? 'Promote to 100% Baseline →' : 'Advance to 50% Load Split →';

  // Gate Copy
  $('gate-copy').textContent = s.faulty
    ? 'ANOMALY ARMED: Next traffic batch will encounter HTTP 500 failures and trigger automatic safety rollback!'
    : (active && s.batch > 0)
    ? `Health gate passed (${s.canaryHits} canary requests clean). Ready to advance rollout.`
    : 'A successful request batch is required at every stage.';

  // Architectural Insight
  $('insight').textContent = s.phase === 'READY'
    ? 'Ready to test continuous deployment. Start a candidate version to route a 10% slice of traffic.'
    : s.phase === 'ROLLED_BACK'
    ? 'Blast radius contained! The candidate was automatically ejected from upstream routing; stable serves 100% traffic.'
    : s.phase === 'PROMOTED'
    ? `Promotion successful: ${s.stable} is the verified baseline. Emergency rollback remains available if regression occurs.`
    : s.faulty
    ? 'Failure injection armed on candidate container. Send traffic to verify autonomous rollback protection.'
    : `${s.weight}% of simulated requests are routed to canary candidate ${s.candidate}. All SLO health gates currently passing.`;

  // Live Request Traces
  if (s.recentRequests && s.recentRequests.length > 0) {
    const traceFeed = $('trace-feed');
    traceFeed.replaceChildren();
    s.recentRequests.slice(0, 15).forEach(req => {
      const row = document.createElement('div');
      row.className = 'trace-row';

      const status = document.createElement('span');
      status.className = `trace-status s${req.status}`;
      status.textContent = `${req.status} ${req.status === 200 ? 'OK' : 'ERR'}`;

      const slot = document.createElement('span');
      slot.className = `trace-slot ${req.slot}`;
      slot.textContent = `[Slot: ${req.slot}] ${req.version}`;

      const latency = document.createElement('span');
      latency.className = 'trace-latency';
      latency.textContent = `${req.latencyMs}ms`;

      row.append(status, slot, latency);
      traceFeed.append(row);
    });
  }

  // Activity Stream Events
  const eventsEl = $('events');
  eventsEl.replaceChildren();
  s.events.forEach(event => {
    const row = document.createElement('div');
    row.className = 'event-row';

    const time = document.createElement('span');
    time.className = 'event-time';
    time.textContent = new Date(event.time).toLocaleTimeString([], { hour12: false });

    const text = document.createElement('span');
    text.className = 'event-text';
    text.textContent = event.message;

    row.append(time, text);
    eventsEl.append(row);
  });

  updateButtons();
}

// ---------------- Action Handler ----------------
async function performAction(actionName) {
  if (busy) return;
  busy = true;
  updateButtons();

  try {
    const version = $('version').value.trim();
    const s = await api('/api/lab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: actionName, version })
    });

    render(s);
    if (s.events && s.events.length > 0) {
      showToast(s.events[0].message, s.phase === 'ROLLED_BACK');
    }
  } catch (err) {
    showToast(err.message, true);
  } finally {
    busy = false;
    updateButtons();
  }
}

// ---------------- Event Listeners ----------------
function initEvents() {
  $('release-form').addEventListener('submit', e => {
    e.preventDefault();
    performAction('start');
  });

  for (const name of ['traffic', 'advance', 'fault', 'rollback']) {
    const btn = $(name);
    if (btn) {
      btn.addEventListener('click', () => performAction(name));
    }
  }

  $('reset').addEventListener('click', () => {
    if (confirm('Reset CanaryDock classroom lab state and counters to v1.0.0 baseline?')) {
      performAction('reset');
    }
  });

  // Continuous Traffic Streamer
  $('stream-toggle').addEventListener('change', e => {
    if (e.target.checked) {
      if (!state || state.phase !== 'CANARY') {
        showToast('Start a canary candidate before starting traffic streaming.', true);
        e.target.checked = false;
        return;
      }
      showToast('Continuous traffic stream started (100 req every 2.5s).');
      streamTimer = setInterval(() => {
        if (!busy && state?.phase === 'CANARY') {
          performAction('traffic');
        } else if (state?.phase !== 'CANARY') {
          clearInterval(streamTimer);
          $('stream-toggle').checked = false;
        }
      }, 2500);
    } else {
      clearInterval(streamTimer);
      showToast('Continuous traffic stream stopped.');
    }
  });

  // Export JSON Evidence
  $('export').addEventListener('click', () => {
    if (!state) return;
    const payload = {
      project: "CanaryDock — Continuous Development & Release Strategies",
      experiment: "9.2",
      student: STUDENT.name,
      uid: STUDENT.uid,
      course: STUDENT.course,
      batch: STUDENT.batch,
      exportedAt: new Date().toISOString(),
      state: state
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CanaryDock_Lab_Evidence_Harshit_Thakur_23BAI70435.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Lab evidence JSON exported successfully.');
  });

  // Probe Live Backend
  async function probeBackend() {
    const probeBtn = $('probe');
    const probeInline = $('probe-inline');
    probeBtn.disabled = true;
    probeInline.disabled = true;

    try {
      const res = await api('/api/hello');
      const info = await api('/api/info');
      const combined = {
        endpoint: "/api/hello",
        greeting: res,
        metadata: info
      };

      $('probe-output').textContent = JSON.stringify(combined, null, 2);
      showToast(`Live response from slot: ${res.slot} (Version: ${res.version})`);
      document.querySelector('.backend-probe-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {
      $('probe-output').textContent = `Probe failed: ${e.message}`;
      showToast(e.message, true);
    } finally {
      probeBtn.disabled = false;
      probeInline.disabled = false;
    }
  }

  $('probe').addEventListener('click', probeBackend);
  $('probe-inline').addEventListener('click', probeBackend);

  // Active Nav Link highlighting
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// ---------------- Initialization ----------------
async function initApp() {
  initTheme();
  initEvents();
  updateButtons();

  const connEl = $('connection');

  try {
    const info = await api('/api/info');
    enabled = info.demoEnabled;
    connEl.textContent = `Backend Online · Slot: ${info.slot} (:8080)`;
    connEl.className = 'connection-pill online';

    if (enabled) {
      const labState = await api('/api/lab');
      render(labState);
    } else {
      connEl.textContent = `Production Mode · ${info.version}`;
      $('phase').textContent = 'DEPLOYED';
      $('phase-copy').textContent = `Serving slot: ${info.slot}`;
      updateButtons();
    }
  } catch (err) {
    connEl.textContent = 'Backend Offline (Port 8080)';
    connEl.className = 'connection-pill offline';
    $('phase').textContent = 'OFFLINE';
    $('phase-copy').textContent = 'Launch Spring Boot backend and refresh';
    showToast('Backend unavailable. Start backend on port 8080 and refresh page.', true);
  }
}

// Start
initApp();
