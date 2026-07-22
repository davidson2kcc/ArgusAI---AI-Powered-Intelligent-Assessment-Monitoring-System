import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Return 204 for favicon requests to prevent 404 errors in browser logs
app.get('/favicon.ico', (req, res) => res.status(204).end());

// API Endpoints matching FastAPI backend routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'AI Assessment Monitoring Backend is Running' });
});

// ── IN-MEMORY MULTI-STUDENT PROCTORING REGISTRY ─────────────
const activeSessions = new Map();
const sseClients = new Set();

// Clean up stale sessions (older than 20 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [studentId, session] of activeSessions.entries()) {
    if (now - session.lastSeen > 20000) {
      activeSessions.delete(studentId);
      broadcastEvent('session_removed', { studentId });
    }
  }
}, 5000);

function broadcastEvent(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// Student Heartbeat Endpoint (Sends telemetry & frame snapshots)
app.post('/api/proctor/heartbeat', (req, res) => {
  const {
    studentId,
    studentName,
    riskScore = 0,
    riskLevel = 'LOW',
    integrityPercent = 100,
    gazeDirection = 'Center',
    headPose = 'Frontal',
    focusState = 'In-Focus',
    audioLevel = 0,
    cameraFrame = null,
    screenFrame = null,
    latestIncident = null,
    riskEvents = [],
    answers = []
  } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required' });
  }

  const prevSession = activeSessions.get(studentId);
  const now = Date.now();

  // Anomaly check: if new incident or risk score spiked
  const isAnomaly = (riskScore >= 35) || (latestIncident && (!prevSession || prevSession.lastIncidentTime !== latestIncident.time));

  const updatedSession = {
    studentId,
    studentName: studentName || 'Student Candidate',
    riskScore,
    riskLevel,
    integrityPercent,
    gazeDirection,
    headPose,
    focusState,
    audioLevel,
    cameraFrame,
    screenFrame,
    latestIncident,
    riskEvents,
    answers,
    lastSeen: now,
    lastIncidentTime: latestIncident ? latestIncident.time : (prevSession ? prevSession.lastIncidentTime : null),
    isAnomaly
  };

  activeSessions.set(studentId, updatedSession);

  // Broadcast update to all connected Invigilator Dashboards via SSE
  broadcastEvent('session_update', updatedSession);

  if (isAnomaly) {
    broadcastEvent('malpractice_anomaly', {
      studentId,
      studentName: updatedSession.studentName,
      incident: latestIncident,
      riskScore,
      riskLevel,
      session: updatedSession
    });
  }

  res.json({ status: 'ok', activeStudentsCount: activeSessions.size });
});

// Invigilator Fetch All Sessions
app.get('/api/proctor/sessions', (req, res) => {
  const sessionsList = Array.from(activeSessions.values());
  sessionsList.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
  res.json({
    count: sessionsList.length,
    sessions: sessionsList
  });
});

// Seed Demo Class (Simulate 12 Parallel Laptops with Live Feeds & Risk Scores)
app.post('/api/proctor/seed-demo', (req, res) => {
  const demoStudents = [
    { id: 'STU-101', name: 'Rahul Sharma', risk: 85, level: 'CRITICAL', gaze: 'Looking Left', head: 'Turned Left', focus: 'Tab Switched', audio: 45, incident: { category: 'FACE_UNAVAIL', points: 30, reason: 'Candidate left camera view and switched browser tab', time: new Date().toLocaleTimeString() } },
    { id: 'STU-102', name: 'Priya Patel', risk: 75, level: 'CRITICAL', gaze: 'Looking Away', head: 'Turned Right', focus: 'Tab Switched', audio: 38, incident: { category: 'TAB_SWITCH', points: 25, reason: 'Secondary application window detected', time: new Date().toLocaleTimeString() } },
    { id: 'STU-103', name: 'Jane Doe', risk: 65, level: 'HIGH', gaze: 'Looking Right', head: 'Frontal', focus: 'Tab Switched', audio: 28, incident: { category: 'TAB_SWITCH', points: 25, reason: 'Multiple browser tab switches detected', time: new Date().toLocaleTimeString() } },
    { id: 'STU-104', name: 'Vikram Singh', risk: 50, level: 'HIGH', gaze: 'Looking Down', head: 'Tilt Down', focus: 'In-Focus', audio: 32, incident: { category: 'AUDIO_NOISE', points: 20, reason: 'Persistent ambient voice activity detected', time: new Date().toLocaleTimeString() } },
    { id: 'STU-105', name: 'Alex Smith', risk: 35, level: 'HIGH', gaze: 'Center', head: 'Turned Right', focus: 'In-Focus', audio: 12, incident: { category: 'HEAD_POSE_TURNED', points: 15, reason: 'Persistent head pose deviation away from monitor', time: new Date().toLocaleTimeString() } },
    { id: 'STU-106', name: 'Maria Garcia', risk: 20, level: 'LOW', gaze: 'Center', head: 'Frontal', focus: 'In-Focus', audio: 8, incident: null },
    { id: 'STU-107', name: 'Ananya Roy', risk: 15, level: 'LOW', gaze: 'Center', head: 'Frontal', focus: 'In-Focus', audio: 6, incident: null },
    { id: 'STU-108', name: 'David Chen', risk: 10, level: 'LOW', gaze: 'Center', head: 'Frontal', focus: 'In-Focus', audio: 5, incident: null },
    { id: 'STU-109', name: 'Sophia Taylor', risk: 5, level: 'LOW', gaze: 'Center', head: 'Frontal', focus: 'In-Focus', audio: 3, incident: null },
    { id: 'STU-110', name: 'Kenji Sato', risk: 0, level: 'LOW', gaze: 'Center', head: 'Frontal', focus: 'In-Focus', audio: 2, incident: null },
    { id: 'STU-111', name: 'Emma Wilson', risk: 0, level: 'LOW', gaze: 'Center', head: 'Frontal', focus: 'In-Focus', audio: 1, incident: null },
    { id: 'STU-112', name: 'Liam Thomas', risk: 0, level: 'LOW', gaze: 'Center', head: 'Frontal', focus: 'In-Focus', audio: 2, incident: null }
  ];

  const now = Date.now();
  demoStudents.forEach(st => {
    activeSessions.set(st.id, {
      studentId: st.id,
      studentName: st.name,
      riskScore: st.risk,
      riskLevel: st.level,
      integrityPercent: Math.max(0, 100 - st.risk),
      gazeDirection: st.gaze,
      headPose: st.head,
      focusState: st.focus,
      audioLevel: st.audio,
      cameraFrame: null,
      screenFrame: null,
      latestIncident: st.incident,
      riskEvents: st.incident ? [{ category: st.incident.category, points: st.incident.points, reason: st.incident.reason, time: st.incident.time }] : [],
      answers: [],
      lastSeen: now,
      lastIncidentTime: st.incident ? st.incident.time : null,
      isAnomaly: st.risk >= 35
    });
  });

  broadcastEvent('session_update', {});
  res.json({ status: 'ok', count: activeSessions.size });
});

// SSE Live Stream Endpoint for Invigilator Dashboard
app.get('/api/proctor/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  sseClients.add(res);

  // Send initial state
  res.write(`event: init\ndata: ${JSON.stringify(Array.from(activeSessions.values()))}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Reset session registry
app.post('/api/proctor/clear', (req, res) => {
  activeSessions.clear();
  broadcastEvent('sessions_cleared', {});
  res.json({ status: 'cleared' });
});

// Serve static frontend files
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));

// Clean page routes
app.get('/exam', (req, res) => {
  res.sendFile(path.join(frontendPath, 'exam.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(frontendPath, 'dashboard.html'));
});

// Fallback to index.html for unknown GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Assessment Monitor server running on http://0.0.0.0:${PORT}`);
});
