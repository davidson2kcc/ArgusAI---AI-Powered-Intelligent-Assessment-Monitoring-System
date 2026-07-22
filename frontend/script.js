/* ========================================
AI Assessment Monitor — Multi-Student Proctoring & Escalation Script
======================================== */

// ── Sample Assessment Questions ──────────────────────
const questions = [
    {
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language"
        ],
        correctAnswer: "Hyper Text Markup Language"
    },
    {
        question: "Which CSS property is used to change the text color of an element?",
        options: [
            "font-color",
            "text-color",
            "color",
            "foreground-color"
        ],
        correctAnswer: "color"
    },
    {
        question: "Which keyword is used to declare a variable in modern JavaScript?",
        options: [
            "var",
            "let",
            "define",
            "dim"
        ],
        correctAnswer: "let"
    },
    {
        question: "What does CSS stand for?",
        options: [
            "Cascading Style Sheets",
            "Computer Style Sheets",
            "Creative Style System",
            "Colorful Style Sheets"
        ],
        correctAnswer: "Cascading Style Sheets"
    },
    {
        question: "Which HTML tag is used to create an unordered list?",
        options: [
            "<ol>",
            "<li>",
            "<ul>",
            "<list>"
        ],
        correctAnswer: "<ul>"
    },
    {
        question: "Which method is used to select an element by its ID in JavaScript?",
        options: [
            "document.querySelector()",
            "document.getElementById()",
            "document.findElement()",
            "document.getElement()"
        ],
        correctAnswer: "document.getElementById()"
    },
    {
        question: "What is the correct way to write a comment in JavaScript?",
        options: [
            "<!-- comment -->",
            "// comment",
            "** comment **",
            "%% comment"
        ],
        correctAnswer: "// comment"
    },
    {
        question: "Which CSS property controls the size of text?",
        options: [
            "text-style",
            "font-size",
            "text-size",
            "font-style"
        ],
        correctAnswer: "font-size"
    },
    {
        question: "What does the DOM stand for?",
        options: [
            "Document Object Model",
            "Data Object Management",
            "Digital Ordinance Map",
            "Document Oriented Middleware"
        ],
        correctAnswer: "Document Object Model"
    },
    {
        question: "Which HTML element is used to embed a JavaScript file?",
        options: [
            "<javascript>",
            "<script>",
            "<code>",
            "<js>"
        ],
        correctAnswer: "<script>"
    },
    {
        question: "Which CSS layout model replaced floats for creating page layouts?",
        options: [
            "Table layout",
            "Flexbox",
            "Grid layout",
            "Both Flexbox and Grid"
        ],
        correctAnswer: "Both Flexbox and Grid"
    },
    {
        question: "What is the output of typeof null in JavaScript?",
        options: [
            "\"null\"",
            "\"undefined\"",
            "\"object\"",
            "\"boolean\""
        ],
        correctAnswer: "\"object\""
    }
];

// ── Page Detection Helpers ────────────────────────
function isIndexPage() {
    return !!document.getElementById("loginForm");
}

function isExamPage() {
    return !!document.getElementById("cameraVideo");
}

function isDashboardPage() {
    return document.body.classList.contains("dashboard-body") || !!document.getElementById("studentGrid");
}

// ===========================================
// INDEX PAGE LOGIC
// ===========================================
function initIndexPage() {
    const studentTab = document.getElementById("roleTabStudent");
    const facultyTab = document.getElementById("roleTabFaculty");
    const studentForm = document.getElementById("loginForm");
    const facultyForm = document.getElementById("facultyLoginForm");

    // Role Tab Switcher
    if (studentTab && facultyTab) {
        studentTab.addEventListener("click", () => {
            studentTab.classList.add("active");
            facultyTab.classList.remove("active");
            if (studentForm) studentForm.classList.remove("hidden");
            if (facultyForm) facultyForm.classList.add("hidden");
        });

        facultyTab.addEventListener("click", () => {
            facultyTab.classList.add("active");
            studentTab.classList.remove("active");
            if (facultyForm) facultyForm.classList.remove("hidden");
            if (studentForm) studentForm.classList.add("hidden");
        });
    }

    // ── STUDENT LOGIN HANDLER ────────────────────────
    if (studentForm) {
        const idInput = document.getElementById("studentId");
        const nameInput = document.getElementById("studentName");
        const idError = document.getElementById("studentIdError");
        const nameError = document.getElementById("studentNameError");

        studentForm.addEventListener("submit", function (e) {
            e.preventDefault();

            let valid = true;

            if (!idInput || !idInput.value.trim()) {
                if (idError) idError.classList.add("visible");
                if (idInput) idInput.classList.add("input-error");
                valid = false;
            } else {
                if (idError) idError.classList.remove("visible");
                if (idInput) idInput.classList.remove("input-error");
            }

            if (!nameInput || !nameInput.value.trim()) {
                if (nameError) nameError.classList.add("visible");
                if (nameInput) nameInput.classList.add("input-error");
                valid = false;
            } else {
                if (nameError) nameError.classList.remove("visible");
                if (nameInput) nameInput.classList.remove("input-error");
            }

            if (!valid) return;

            sessionStorage.setItem("userRole", "student");
            sessionStorage.setItem("studentId", idInput.value.trim());
            sessionStorage.setItem("studentName", nameInput.value.trim());
            sessionStorage.setItem("sessionStartTime", new Date().toLocaleTimeString());

            // Reset session risk tracking data
            sessionStorage.setItem("riskScore", "0");
            sessionStorage.setItem("riskLevel", "LOW");
            sessionStorage.setItem("integrityPercent", "100");
            sessionStorage.setItem("riskEvents", JSON.stringify([]));
            sessionStorage.setItem("tabSwitchCount", "0");
            sessionStorage.setItem("gazeAwayCount", "0");
            sessionStorage.setItem("audioSpikeCount", "0");
            sessionStorage.setItem("fullscreenExitCount", "0");

            // Show instructions modal before entering exam
            showExamInstructionsModal(() => {
                window.location.href = "exam.html";
            });
        });

        if (idInput) {
            idInput.addEventListener("input", function () {
                if (idInput.value.trim()) {
                    if (idError) idError.classList.remove("visible");
                    idInput.classList.remove("input-error");
                }
            });
        }

        if (nameInput) {
            nameInput.addEventListener("input", function () {
                if (nameInput.value.trim()) {
                    if (nameError) nameError.classList.remove("visible");
                    nameInput.classList.remove("input-error");
                }
            });
        }
    }

    // ── FACULTY / INVIGILATOR LOGIN HANDLER ────────────────────────
    if (facultyForm) {
        const facIdInput = document.getElementById("facultyId");
        const facNameInput = document.getElementById("facultyName");
        const facPasscode = document.getElementById("facultyPasscode");
        const facIdError = document.getElementById("facultyIdError");
        const facNameError = document.getElementById("facultyNameError");
        const facPasscodeError = document.getElementById("facultyPasscodeError");

        facultyForm.addEventListener("submit", function (e) {
            e.preventDefault();

            let valid = true;

            if (!facIdInput || !facIdInput.value.trim()) {
                if (facIdError) facIdError.classList.add("visible");
                if (facIdInput) facIdInput.classList.add("input-error");
                valid = false;
            } else {
                if (facIdError) facIdError.classList.remove("visible");
                if (facIdInput) facIdInput.classList.remove("input-error");
            }

            if (!facNameInput || !facNameInput.value.trim()) {
                if (facNameError) facNameError.classList.add("visible");
                if (facNameInput) facNameInput.classList.add("input-error");
                valid = false;
            } else {
                if (facNameError) facNameError.classList.remove("visible");
                if (facNameInput) facNameInput.classList.remove("input-error");
            }

            if (!facPasscode || !facPasscode.value.trim()) {
                if (facPasscodeError) facPasscodeError.classList.add("visible");
                if (facPasscode) facPasscode.classList.add("input-error");
                valid = false;
            } else {
                if (facPasscodeError) facPasscodeError.classList.remove("visible");
                if (facPasscode) facPasscode.classList.remove("input-error");
            }

            if (!valid) return;

            sessionStorage.setItem("userRole", "faculty");
            sessionStorage.setItem("facultyId", facIdInput.value.trim());
            sessionStorage.setItem("facultyName", facNameInput.value.trim());

            window.location.href = "dashboard.html";
        });
    }

    // ── EXAM INSTRUCTIONS MODAL ────────────────────────
    function showExamInstructionsModal(onProceed) {
        // Remove any existing modal
        const existingModal = document.getElementById('examInstructionsModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'examInstructionsModal';
        modal.style.cssText = `
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(255,255,255,0.92);
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(8px);
            animation: fadeInModal 0.35s ease;
        `;

        modal.innerHTML = `
            <style>
                @keyframes fadeInModal { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
                #examInstructionsModal .instr-card {
                    background: #ffffff;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 18px;
                    padding: 24px 30px 22px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(99,102,241,0.1);
                    color: #1e293b;
                    font-family: 'Inter', system-ui, sans-serif;
                }
                #examInstructionsModal .instr-header {
                    display: flex; align-items: center; gap: 10px;
                    margin-bottom: 16px;
                }
                #examInstructionsModal .instr-icon {
                    width: 38px; height: 38px; border-radius: 10px;
                    background: linear-gradient(135deg, #2563eb, #6366f1);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.15rem; flex-shrink: 0;
                }
                #examInstructionsModal .instr-title {
                    font-size: 1.1rem; font-weight: 800; color: #0f172a;
                    letter-spacing: -0.02em;
                }
                #examInstructionsModal .instr-subtitle {
                    font-size: 0.72rem; color: #64748b; margin-top: 1px;
                }
                #examInstructionsModal .instr-list {
                    list-style: none; padding: 0; margin: 0 0 14px;
                    display: flex; flex-direction: column; gap: 5px;
                }
                #examInstructionsModal .instr-list li {
                    display: flex; align-items: flex-start; gap: 8px;
                    font-size: 0.82rem; color: #334155; line-height: 1.4;
                    padding: 7px 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }
                #examInstructionsModal .instr-list li::before {
                    content: attr(data-icon);
                    flex-shrink: 0; font-size: 0.88rem;
                    margin-top: 1px;
                }
                #examInstructionsModal .instr-warning {
                    background: rgba(239,68,68,0.1);
                    border: 1px solid rgba(239,68,68,0.3);
                    border-radius: 8px;
                    padding: 9px 13px;
                    font-size: 0.75rem;
                    color: #fca5a5;
                    margin-bottom: 14px;
                }
                #examInstructionsModal .instr-proceed-btn {
                    width: 100%;
                    padding: 10px;
                    background: linear-gradient(135deg, #2563eb, #6366f1);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 0.92rem;
                    font-weight: 700;
                    cursor: pointer;
                    letter-spacing: 0.01em;
                    transition: opacity 0.2s;
                }
                #examInstructionsModal .instr-proceed-btn:hover { opacity: 0.92; }
            </style>
            <div class="instr-card">
                <div class="instr-header">
                    <div class="instr-icon">📋</div>
                    <div>
                        <div class="instr-title">Exam Instructions</div>
                        <div class="instr-subtitle">Please read carefully before proceeding</div>
                    </div>
                </div>
                <ul class="instr-list">
                    <li data-icon="📷">Keep your camera and microphone ON during the exam.</li>
                    <li data-icon="👤">Keep your face clearly visible to the camera.</li>
                    <li data-icon="🚫">Only the registered student should be visible.</li>
                    <li data-icon="🖥️">Your screen may be monitored by the invigilator.</li>
                    <li data-icon="⚠️">Do not use unauthorized materials or devices.</li>
                    <li data-icon="🤖">The exam is monitored using AI-assisted proctoring.</li>
                    <li data-icon="👁️">Unusual behavior may be reported to the invigilator.</li>
                    <li data-icon="✍️">Complete the exam independently.</li>
                </ul>
                <div class="instr-warning">
                    🔒 <strong>Important:</strong> The exam will open in full-screen mode. Exiting full screen is recorded and may increase your risk score. Tab switching is disabled during the exam.
                </div>
                <button class="instr-proceed-btn" id="instrProceedBtn">I Understand — Begin Exam →</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('instrProceedBtn').addEventListener('click', () => {
            modal.style.animation = 'none';
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.25s';
            setTimeout(() => {
                modal.remove();
                onProceed();
            }, 250);
        });
    }
}

// ===========================================
// EXAM PAGE LOGIC — INTELLIGENT PROCTORING
// ===========================================
function initExamPage() {
    const studentId = sessionStorage.getItem("studentId") || ("STU-" + Math.floor(100 + Math.random() * 900));
    const studentName = sessionStorage.getItem("studentName") || "Student Candidate";

    // Ensure studentId is saved
    sessionStorage.setItem("studentId", studentId);
    sessionStorage.setItem("studentName", studentName);

    // Header Student Info
    const nameEl = document.getElementById("headerStudentName");
    const idEl = document.getElementById("headerStudentId");
    if (nameEl) nameEl.textContent = studentName;
    if (idEl) idEl.textContent = "ID: " + studentId;

    const avatarEl = document.getElementById("headerAvatar");
    if (avatarEl) {
        const nameParts = studentName.trim().split(/\s+/);
        let initials = nameParts[0].charAt(0).toUpperCase();
        if (nameParts.length > 1) {
            initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        }
        avatarEl.textContent = initials;
    }

    // ── PROCTORING STATE ──────────────────────
    let mediaStream = null;
    let screenStream = null;
    let audioContext = null;
    let analyserNode = null;

    let riskScore = 0;
    let riskLevel = "LOW";
    let integrityPercent = 100;
    let riskEvents = [];

    let currentGazeDirection = "Center";
    let currentHeadPose = "Frontal";
    let currentFocusState = "In-Focus";
    let currentAudioLevel = 0;

    let tabSwitchCount = 0;
    let gazeAwayCount = 0;
    let audioSpikeCount = 0;
    let fullscreenExitCount = parseInt(sessionStorage.getItem("fullscreenExitCount") || "0");

    let faceAbsentStartTime = null;
    let multipleFaceStartTime = null;
    let gazeAwayStartTime = null;
    let audioSpikeStartTime = null;

    let faceAbsentReported = false;
    let multipleFaceReported = false;
    let gazeAwayReported = false;
    let audioSpikeReported = false;

    // ── ERRATIC MOVEMENT DETECTION ──────────────────────
    // Tracks consecutive center↔away gaze transitions for copying pattern
    let erraticMoveSequence = []; // array of directions
    let lastGazeForErratic = "Center";
    let erraticCount = 0; // number of qualifying oscillation cycles
    const ERRATIC_THRESHOLD = 30; // 30 consecutive transitions triggers risk

    // UI Elements
    const videoEl = document.getElementById("cameraVideo");
    const screenVideoEl = document.getElementById("screenVideo");
    const screenCanvasEl = document.getElementById("screenCanvas");
    const screenContainerEl = document.getElementById("screenContainer");
    const canvasEl = document.getElementById("proctorCanvas");

    const toggleFullscreenBtn = document.getElementById("toggleFullscreenBtn");
    const startScreenShareBtn = document.getElementById("startScreenShareBtn");

    const cameraStatusEl = document.getElementById("cameraStatus");
    const micStatusEl = document.getElementById("micStatus");
    const statusMessageEl = document.getElementById("statusMessage");

    const gazePillEl = document.getElementById("gazeStatusPill");
    const headPillEl = document.getElementById("headPosePill");
    const focusPillEl = document.getElementById("focusPill");
    const audioBarEl = document.getElementById("audioBar");

    const integrityPercentEl = document.getElementById("integrityPercent");
    const integrityBarEl = document.getElementById("integrityBar");
    const riskScoreEl = document.getElementById("riskScore");
    const behaviorDiagnosisEl = document.getElementById("behaviorDiagnosis");
    const incidentCountEl = document.getElementById("incidentCount");
    const proctorLogFeedEl = document.getElementById("proctorLogFeed");

    // Off-screen canvas helper for snapshot frame generation
    const snapCanvas = document.createElement("canvas");
    snapCanvas.width = 640;
    snapCanvas.height = 360;

    function captureVideoFrame(vEl) {
        if (!vEl || vEl.readyState < 2 || !vEl.videoWidth) return null;
        const ctx = snapCanvas.getContext("2d");
        ctx.drawImage(vEl, 0, 0, snapCanvas.width, snapCanvas.height);
        return snapCanvas.toDataURL("image/jpeg", 0.85);
    }

    // Synthesize workspace frame if screen displayMedia is not active
    function generateFallbackScreenFrame() {
        const ctx = snapCanvas.getContext("2d");
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, snapCanvas.width, snapCanvas.height);

        // Header bar
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, snapCanvas.width, 24);

        ctx.fillStyle = "#818cf8";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("AI Assessment Monitor — Workspace View", 8, 16);

        // Window card
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(10, 32, snapCanvas.width - 20, 138);
        ctx.strokeStyle = "#4338ca";
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 32, snapCanvas.width - 20, 138);

        ctx.fillStyle = "#c7d2fe";
        ctx.font = "10px sans-serif";
        ctx.fillText(`Candidate: ${studentName || "Student"}`, 18, 52);
        ctx.fillText(`ID: ${studentId || "STU-101"}`, 18, 70);

        ctx.fillStyle = currentFocusState === "In-Focus" ? "#10b981" : "#ef4444";
        ctx.fillText(`Focus State: ${currentFocusState}`, 18, 90);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "9px monospace";
        ctx.fillText(`Time: ${new Date().toLocaleTimeString()}`, 18, 112);

        ctx.fillStyle = "#a5b4fc";
        ctx.font = "9px sans-serif";
        ctx.fillText("Active Window: Assessment Environment", 18, 132);

        return snapCanvas.toDataURL("image/jpeg", 0.82);
    }

    // Send Live Heartbeat Telemetry to Backend for Invigilator Dashboard
    async function sendTelemetryHeartbeat() {
        try {
            const cameraFrame = captureVideoFrame(videoEl);
            let screenFrame = screenVideoEl ? captureVideoFrame(screenVideoEl) : null;
            if (!screenFrame) {
                screenFrame = generateFallbackScreenFrame();
            }

            const answers = JSON.parse(sessionStorage.getItem("assessmentAnswers") || "[]");
            const latestIncident = riskEvents.length > 0 ? riskEvents[riskEvents.length - 1] : null;

            const payload = {
                studentId,
                studentName,
                riskScore,
                riskLevel,
                integrityPercent,
                gazeDirection: currentGazeDirection,
                headPose: currentHeadPose,
                focusState: currentFocusState,
                audioLevel: currentAudioLevel,
                cameraFrame,
                screenFrame,
                latestIncident,
                riskEvents,
                answers
            };

            await fetch("/api/proctor/heartbeat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.warn("Telemetry heartbeat sync warning:", err);
        }
    }

    // Periodic heartbeat every 1.5s
    setInterval(sendTelemetryHeartbeat, 1500);

    // Helper: Add Risk Points & Record Incident Event
    function addRiskPoints(points, reason, category = "GENERAL") {
        riskScore += points;
        integrityPercent = Math.max(0, 100 - Math.round(riskScore * 0.75));

        const timeStr = new Date().toLocaleTimeString();
        const eventItem = {
            points,
            reason,
            category,
            time: timeStr
        };

        riskEvents.push(eventItem);

        if (category === "TAB_SWITCH") tabSwitchCount++;
        if (category === "EYE_GAZE") gazeAwayCount++;
        if (category === "AUDIO_SPIKE") audioSpikeCount++;

        updateRiskLevelUI();

        sessionStorage.setItem("riskScore", riskScore.toString());
        sessionStorage.setItem("riskLevel", riskLevel);
        sessionStorage.setItem("integrityPercent", integrityPercent.toString());
        sessionStorage.setItem("riskEvents", JSON.stringify(riskEvents));
        sessionStorage.setItem("tabSwitchCount", tabSwitchCount.toString());
        sessionStorage.setItem("gazeAwayCount", gazeAwayCount.toString());
        sessionStorage.setItem("audioSpikeCount", audioSpikeCount.toString());

        renderLogFeed();
        sendTelemetryHeartbeat();
    }

    function updateRiskLevelUI() {
        if (riskScore <= 20) {
            riskLevel = "LOW";
        } else if (riskScore <= 50) {
            riskLevel = "MEDIUM";
        } else if (riskScore <= 75) {
            riskLevel = "HIGH";
        } else {
            riskLevel = "CRITICAL";
        }

        if (riskScoreEl) {
            riskScoreEl.textContent = "Risk: " + riskScore + " (" + riskLevel + ")";
            riskScoreEl.className = "risk-badge risk-badge--" + riskLevel.toLowerCase();
        }

        if (integrityPercentEl) {
            integrityPercentEl.textContent = integrityPercent + "%";
        }

        if (integrityBarEl) {
            integrityBarEl.style.width = integrityPercent + "%";
            if (integrityPercent > 70) {
                integrityBarEl.className = "integrity-bar integrity-bar--success";
            } else if (integrityPercent > 40) {
                integrityBarEl.className = "integrity-bar integrity-bar--warning";
            } else {
                integrityBarEl.className = "integrity-bar integrity-bar--danger";
            }
        }

        if (behaviorDiagnosisEl) {
            if (riskScore === 0) {
                behaviorDiagnosisEl.textContent = "Pattern: Normal & attentive candidate behavior";
            } else if (riskScore <= 20) {
                behaviorDiagnosisEl.textContent = "Pattern: Minor transitory distraction detected";
            } else if (riskScore <= 50) {
                behaviorDiagnosisEl.textContent = "Pattern: Frequent gaze deviation / audio activity detected";
            } else if (riskScore <= 75) {
                behaviorDiagnosisEl.textContent = "Pattern: High suspicious behavior (Multiple tab/gaze deviations)";
            } else {
                behaviorDiagnosisEl.textContent = "CRITICAL MALPRACTICE WARNING: Secondary device or external assistance suspected";
            }
        }
    }

    function renderLogFeed() {
        if (!proctorLogFeedEl) return;

        if (riskEvents.length === 0) {
            proctorLogFeedEl.innerHTML = '<div class="log-empty">No suspicious behavior detected</div>';
            if (incidentCountEl) incidentCountEl.textContent = "0 Alerts";
            return;
        }

        if (incidentCountEl) {
            incidentCountEl.textContent = riskEvents.length + " Alert" + (riskEvents.length > 1 ? "s" : "");
        }

        proctorLogFeedEl.innerHTML = riskEvents.slice().reverse().map(event => {
            const catClass = "log-item--" + event.category.toLowerCase();
            return `
                <div class="log-item ${catClass}">
                    <div class="log-item__header">
                        <span>[${event.category}] +${event.points} pts</span>
                        <span class="log-item__time">${event.time}</span>
                    </div>
                    <div class="log-item__desc">${event.reason}</div>
                </div>
            `;
        }).join("");
    }

    function setCameraStatus(status, text) {
        if (!cameraStatusEl) return;
        cameraStatusEl.className = "status-row status-item--" + status;
        const dot = cameraStatusEl.querySelector(".status-dot");
        if (dot) dot.className = "status-dot status-dot--" + status;
        const txt = cameraStatusEl.querySelector(".status-row__text");
        if (txt) txt.textContent = "Camera: " + text;
    }

    function setMicStatus(status, text) {
        if (!micStatusEl) return;
        micStatusEl.className = "status-row status-item--" + status;
        const dot = micStatusEl.querySelector(".status-dot");
        if (dot) dot.className = "status-dot status-dot--" + status;
        const txt = micStatusEl.querySelector(".status-row__text");
        if (txt) txt.textContent = "Microphone: " + text;
    }

    function setStatusMessage(type, text) {
        if (!statusMessageEl) return;
        statusMessageEl.className = "status-message status-message--" + type;
        statusMessageEl.textContent = text;
    }

    const openNewTabBtn = document.getElementById("openNewTabBtn");
    if (openNewTabBtn) {
        if (window.self !== window.top) {
            openNewTabBtn.classList.remove("hidden");
        }
    }

    // ── AUTO ENTER FULLSCREEN ON LOAD ──────────────────────
    function enterFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn("Auto fullscreen request error:", err);
            });
        }
    }

    // ── FULLSCREEN EXIT MONITORING (max 2 exits allowed, +50 risk each) ──
    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
            fullscreenExitCount++;
            sessionStorage.setItem("fullscreenExitCount", fullscreenExitCount.toString());

            addRiskPoints(50, `Student exited full screen (Exit #${fullscreenExitCount}/2 — each exit adds 50 risk points)`, "FULLSCREEN_EXIT");

            // Show prominent warning overlay
            showFullscreenWarning(fullscreenExitCount);

            // Re-enter fullscreen automatically
            setTimeout(() => {
                enterFullscreen();
            }, 1500);
        }
    });

    // Fullscreen exit warning overlay
    function showFullscreenWarning(count) {
        let warn = document.getElementById('fsWarnOverlay');
        if (!warn) {
            warn = document.createElement('div');
            warn.id = 'fsWarnOverlay';
            warn.style.cssText = `
                position: fixed; inset: 0; z-index: 99998;
                background: rgba(220,38,38,0.92);
                display: flex; align-items: center; justify-content: center;
                backdrop-filter: blur(4px);
                font-family: system-ui, sans-serif;
                color: white; text-align: center;
            `;
            document.body.appendChild(warn);
        }
        warn.innerHTML = `
            <div style="background:rgba(0,0,0,0.5);border-radius:20px;padding:40px 50px;max-width:480px;">
                <div style="font-size:3rem;margin-bottom:12px;">⚠️</div>
                <h2 style="font-size:1.6rem;font-weight:800;margin:0 0 10px;">Fullscreen Violation Detected</h2>
                <p style="font-size:1rem;opacity:0.9;margin:0 0 16px;">You exited full screen mode. This has been recorded.</p>
                <div style="font-size:1.1rem;font-weight:700;background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 16px;margin-bottom:20px;">
                    Exit ${count} of 2 — Risk Score +50 Points Added
                </div>
                <p style="font-size:0.85rem;opacity:0.8;">Returning to full screen mode automatically...</p>
            </div>
        `;
        warn.style.display = 'flex';
        setTimeout(() => { warn.style.display = 'none'; }, 2500);
    }

    // ── SCREEN SHARE CAPTURE (AUTO-START + HIDDEN FROM STUDENT) ──────────────────────
    // ── SCREEN SHARE ENFORCEMENT WALL ─────────────────────────────────────────
    // Blocks entire exam until screen share is granted. Cannot be dismissed.
    function showScreenShareWall(isError = false, errorMsg = "") {
        let wall = document.getElementById('screenShareWall');
        if (!wall) {
            wall = document.createElement('div');
            wall.id = 'screenShareWall';
            wall.style.cssText = `
                position: fixed; inset: 0; z-index: 99998;
                display: flex; align-items: center; justify-content: center;
                font-family: 'Inter', system-ui, sans-serif;
                text-align: center;
                backdrop-filter: blur(12px);
            `;
            document.body.appendChild(wall);
        }

        if (isError) {
            wall.style.background = '#ffffff';
            wall.innerHTML = `
                <div style="max-width:420px;padding:44px 36px;background:linear-gradient(135deg,#1a0505,#2d0a0a);border:1.5px solid #7f1d1d;border-radius:20px;box-shadow:0 32px 80px rgba(0,0,0,0.8);color:#fff;">
                    <div style="font-size:3rem;margin-bottom:16px;">🚫</div>
                    <h2 style="font-size:1.35rem;font-weight:800;margin:0 0 10px;color:#fca5a5;">Screen Share Required</h2>
                    <p style="opacity:0.85;margin:0 0 8px;line-height:1.65;font-size:0.92rem;color:#fecaca;">
                        ${errorMsg || 'You must share your <strong>entire screen</strong> to attend this exam.'}
                    </p>
                    <p style="opacity:0.6;font-size:0.78rem;margin:0 0 24px;color:#fca5a5;">Cancelling screen share is not permitted. Click below to try again.</p>
                    <button id="retryScreenShareBtn" style="
                        width:100%;padding:13px;background:linear-gradient(135deg,#dc2626,#b91c1c);
                        color:white;border:none;border-radius:12px;font-size:0.95rem;
                        font-weight:700;cursor:pointer;letter-spacing:0.01em;
                    ">🔄 Share Screen to Continue</button>
                </div>
            `;
            const retryBtn = document.getElementById('retryScreenShareBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    showScreenShareWall(false); // back to waiting state
                    startScreenShare();
                });
            }
        } else {
            wall.style.background = '#ffffff';
            wall.innerHTML = `
                <div style="max-width:420px;padding:44px 36px;">
                    <div style="font-size:3rem;margin-bottom:16px;">🖥️</div>
                    <h2 style="font-size:1.35rem;font-weight:800;margin:0 0 10px;">Share Your Screen to Begin</h2>
                    <p style="opacity:0.8;margin:0 0 20px;line-height:1.65;font-size:0.92rem;">You must share your <strong>entire screen</strong> to attend this exam. Please select <em>Entire Screen</em> when prompted.</p>
                    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                        <span style="background:rgba(255,255,255,0.1);border-radius:8px;padding:7px 14px;font-size:0.82rem;">🖥️ Entire Screen only</span>
                        <span style="background:rgba(255,255,255,0.1);border-radius:8px;padding:7px 14px;font-size:0.82rem;">🔒 Cannot be dismissed</span>
                    </div>
                </div>
            `;
        }
    }

    function hideScreenShareWall() {
        const wall = document.getElementById('screenShareWall');
        if (wall) {
            wall.style.transition = 'opacity 0.4s';
            wall.style.opacity = '0';
            setTimeout(() => wall.remove(), 400);
        }
    }

    async function startScreenShare() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                throw new Error("getDisplayMedia not supported in this browser context.");
            }

            screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always", displaySurface: "monitor" },
                audio: false
            });

            if (screenVideoEl) {
                screenVideoEl.srcObject = screenStream;
                // IMPORTANT: Hidden from student — they don't see their own screen share
                screenVideoEl.style.display = "none";
                screenVideoEl.play().catch(e => console.warn("screenVideo play warning:", e));
            }

            // Hide the screen container entirely from student view
            if (screenContainerEl) {
                screenContainerEl.classList.add("hidden");
                screenContainerEl.style.display = "none";
            }

            if (startScreenShareBtn) {
                startScreenShareBtn.textContent = "📺 Screen Sharing Active";
                startScreenShareBtn.style.background = "#ecfdf5";
                startScreenShareBtn.style.borderColor = "#a7f3d0";
                startScreenShareBtn.style.color = "#059669";
            }

            const vTrack = screenStream.getVideoTracks()[0];
            if (vTrack) {
                vTrack.onended = () => {
                    if (startScreenShareBtn) {
                        startScreenShareBtn.textContent = "📺 Share Screen";
                        startScreenShareBtn.style = "";
                    }
                    if (screenVideoEl) screenVideoEl.srcObject = null;
                    addRiskPoints(20, "Student stopped sharing desktop screen stream", "SCREEN_SHARE_STOP");
                    // Block exam immediately and force re-share
                    showScreenShareWall(true, "You stopped sharing your screen. You must share your screen to continue the exam.");
                };
            }

            // Unlock exam — screen share granted
            hideScreenShareWall();

            // Enter fullscreen now that screen share user-gesture context is active
            enterFullscreen();

            setStatusMessage("success", "● AI Monitoring Active. Camera, Microphone & Screen monitored.");
            sendTelemetryHeartbeat();
        } catch (err) {
            console.warn("Screen share error or permission denied:", err);
            if (startScreenShareBtn) {
                startScreenShareBtn.textContent = "📺 Share Screen";
                startScreenShareBtn.style = "";
            }
            // Student cancelled or denied — show hard block wall
            showScreenShareWall(true, "You must share your <strong>entire screen</strong> to attend this exam. Cancelling is not allowed.");
        }
    }

    // Manual screen share button (fallback)
    if (startScreenShareBtn) {
        startScreenShareBtn.addEventListener("click", startScreenShare);
    }

    // ===========================================
    // AI VISION & EYE GAZE DETECTOR (MEDIAPIPE)
    // ===========================================
    let faceLandmarker = null;
    let faceDetector = null;
    let lastVideoTime = -1;

    async function startAIVision() {
        try {
            console.log("Loading MediaPipe AI Vision Task models...");
            const { FaceLandmarker, FaceDetector, FilesetResolver } = await import(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/+esm"
            );

            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
            );

            try {
                faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numFaces: 2
                });
                console.log("FaceLandmarker (Gaze & Mesh) initialized successfully!");
            } catch (lmErr) {
                console.warn("FaceLandmarker failed to load, falling back to FaceDetector:", lmErr);
            }

            if (!faceLandmarker) {
                faceDetector = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
                    },
                    runningMode: "VIDEO",
                    minDetectionConfidence: 0.5
                });
                console.log("FaceDetector initialized successfully!");
            }

            processVideoFrame();
        } catch (err) {
            console.error("AI Vision initialization error:", err);
            setStatusMessage("error", "AI Vision module failed to load. Basic proctoring active.");
        }
    }

    function processVideoFrame() {
        if (!videoEl) return;

        if (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0 && videoEl.currentTime !== lastVideoTime) {
            lastVideoTime = videoEl.currentTime;

            const now = performance.now();
            const currentTime = Date.now();

            let faceCount = 0;
            let gazeDirection = "Center";
            let headPose = "Frontal";

            if (canvasEl) {
                canvasEl.width = videoEl.videoWidth;
                canvasEl.height = videoEl.videoHeight;
                const ctx = canvasEl.getContext("2d");
                ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            }

            try {
                if (faceLandmarker) {
                    const result = faceLandmarker.detectForVideo(videoEl, now);
                    if (result && result.faceLandmarks) {
                        faceCount = result.faceLandmarks.length;

                        if (faceCount >= 1) {
                            const landmarks = result.faceLandmarks[0];

                            const leftIris = landmarks[468] || landmarks[159];
                            const leftOuter = landmarks[33];
                            const leftInner = landmarks[133];

                            const rightIris = landmarks[473] || landmarks[386];
                            const rightInner = landmarks[362];
                            const rightOuter = landmarks[263];

                            if (leftIris && leftOuter && leftInner && rightIris && rightOuter && rightInner) {
                                const leftWidth = Math.abs(leftInner.x - leftOuter.x) || 0.001;
                                const leftGazeRatio = Math.abs(leftIris.x - leftOuter.x) / leftWidth;

                                const rightWidth = Math.abs(rightOuter.x - rightInner.x) || 0.001;
                                const rightGazeRatio = Math.abs(rightIris.x - rightInner.x) / rightWidth;

                                // Eye gaze based purely on iris position relative to eye socket.
                                // Head movement does NOT affect this — only actual eye direction matters.
                                const avgGazeRatio = (leftGazeRatio + rightGazeRatio) / 2;

                                if (avgGazeRatio < 0.33) {
                                    gazeDirection = "Looking Right";
                                } else if (avgGazeRatio > 0.67) {
                                    gazeDirection = "Looking Left";
                                } else {
                                    gazeDirection = "Center";
                                }
                            }

                            if (canvasEl) {
                                const ctx = canvasEl.getContext("2d");
                                ctx.fillStyle = gazeDirection === "Center" ? "rgba(16, 185, 129, 0.7)" : "rgba(239, 68, 68, 0.8)";
                                if (leftIris) ctx.beginPath(), ctx.arc(leftIris.x * canvasEl.width, leftIris.y * canvasEl.height, 3, 0, 2 * Math.PI), ctx.fill();
                                if (rightIris) ctx.beginPath(), ctx.arc(rightIris.x * canvasEl.width, rightIris.y * canvasEl.height, 3, 0, 2 * Math.PI), ctx.fill();
                            }
                        }
                    }
                } else if (faceDetector) {
                    const result = faceDetector.detectForVideo(videoEl, now);
                    if (result && result.detections) {
                        faceCount = result.detections.length;
                    }
                }
            } catch (frameErr) {
                console.warn("Frame analysis warning:", frameErr);
            }

            currentGazeDirection = gazeDirection;

            if (gazePillEl) {
                gazePillEl.textContent = gazeDirection;
                gazePillEl.className = "proctor-pill proctor-pill--" + (gazeDirection === "Center" ? "normal" : "warning");
            }

            // EVALUATE FACE PRESENCE & GAZE DEVIATION TIMERS
            if (faceCount === 0) {
                multipleFaceStartTime = null;
                multipleFaceReported = false;
                gazeAwayStartTime = null;
                gazeAwayReported = false;

                if (faceAbsentStartTime === null) faceAbsentStartTime = currentTime;
                const absentDuration = (currentTime - faceAbsentStartTime) / 1000;

                if (absentDuration >= 3) {
                    if (!faceAbsentReported) {
                        addRiskPoints(10, "Face absent from camera view for > 3 seconds", "FACE_ABSENT");
                        faceAbsentReported = true;
                    }
                    setStatusMessage("error", "⚠️ Face not detected. Please remain visible in front of camera.");
                }
            } else if (faceCount === 1) {
                faceAbsentStartTime = null;
                multipleFaceStartTime = null;
                faceAbsentReported = false;
                multipleFaceReported = false;

                setStatusMessage("success", "AI Monitoring Active. Student visible & monitored.");

                // ── EYE GAZE: iris-only tracking, status display only — no risk points ──
                if (gazeDirection !== "Center") {
                    if (gazeAwayStartTime === null) gazeAwayStartTime = currentTime;
                    // Status pill already updated above — no risk score added
                } else {
                    gazeAwayStartTime = null;
                    gazeAwayReported = false;
                }

                // ── ERRATIC MOVEMENT DETECTION ──
                // Detect rapid center↔direction oscillations (copying pattern)
                // Valid pairs: (up↔centre), (down↔centre), (right↔centre), (left↔centre)
                const isCenter = gazeDirection === "Center";
                const wasCenter = lastGazeForErratic === "Center";

                if (gazeDirection !== lastGazeForErratic) {
                    // A transition occurred
                    const validDirections = ["Looking Up", "Looking Down", "Looking Left", "Looking Right"];
                    const isValidTransition = (
                        (isCenter && validDirections.includes(lastGazeForErratic)) ||
                        (wasCenter && validDirections.includes(gazeDirection))
                    );

                    if (isValidTransition) {
                        erraticCount++;

                        if (erraticCount >= ERRATIC_THRESHOLD) {
                            addRiskPoints(50, `Erratic rapid gaze oscillation detected — ${erraticCount} transitions (copying pattern suspected)`, "ERRATIC_MOVEMENT");
                            erraticCount = 0; // reset after trigger
                        }
                    } else {
                        // Non-qualifying transition resets the counter
                        erraticCount = 0;
                    }

                    lastGazeForErratic = gazeDirection;
                }

            } else {
                faceAbsentStartTime = null;
                faceAbsentReported = false;

                if (multipleFaceStartTime === null) multipleFaceStartTime = currentTime;
                const multipleDuration = (currentTime - multipleFaceStartTime) / 1000;

                if (multipleDuration >= 4.0) {  // INCREASED from 2s → 4s
                    if (!multipleFaceReported) {
                        addRiskPoints(20, "Multiple faces detected in camera frame for > 4 seconds", "MULTIPLE_FACES");
                        multipleFaceReported = true;
                    }
                    setStatusMessage("error", "⚠️ Multiple persons detected. Ensure only the student is visible.");
                }
            }
        }

        requestAnimationFrame(processVideoFrame);
    }

    // ===========================================
    // WEB AUDIO API SOUND MONITORING
    // ===========================================
    function initAudioProctoring(stream) {
        try {
            const audioTracks = stream.getAudioTracks();
            if (!audioTracks || audioTracks.length === 0) {
                setMicStatus("denied", "No Mic Audio Track");
                return;
            }

            setMicStatus("active", "Microphone Active & Listening");

            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Resume audio context on any user gesture if suspended
            const resumeAudio = () => {
                if (audioContext && audioContext.state === "suspended") {
                    audioContext.resume().catch(e => console.warn("AudioContext resume error:", e));
                }
            };
            ["click", "keydown", "touchstart"].forEach(evt => {
                window.addEventListener(evt, resumeAudio, { once: true });
            });
            resumeAudio();

            const source = audioContext.createMediaStreamSource(stream);
            analyserNode = audioContext.createAnalyser();
            analyserNode.fftSize = 1024;              // larger FFT = more stable readings
            analyserNode.smoothingTimeConstant = 0.82; // smooth out transient spikes
            source.connect(analyserNode);

            const timeDomainData = new Uint8Array(analyserNode.fftSize);
            let silenceSince = null; // tracks when audio dropped below threshold

            function checkAudioLevel() {
                if (!analyserNode) return;

                // RMS amplitude from time-domain data (accurate for speech detection)
                analyserNode.getByteTimeDomainData(timeDomainData);
                let sumSq = 0;
                for (let i = 0; i < timeDomainData.length; i++) {
                    const norm = (timeDomainData[i] - 128) / 128;
                    sumSq += norm * norm;
                }
                const rms = Math.sqrt(sumSq / timeDomainData.length);
                // Scale: 300 maps typical speech (~0.05–0.15 RMS) to 15–45%
                // Breathing/room noise typically stays below 0.03 RMS (<10%)
                const volumePercent = Math.min(100, Math.round(rms * 300));

                currentAudioLevel = volumePercent;

                // Audio bar colour zones (calibrated)
                if (audioBarEl) {
                    audioBarEl.style.width = volumePercent + "%";
                    if (volumePercent > 50) {
                        audioBarEl.style.background = "linear-gradient(90deg, #ef4444, #dc2626)";
                    } else if (volumePercent > 30) {
                        audioBarEl.style.background = "linear-gradient(90deg, #f59e0b, #d97706)";
                    } else {
                        audioBarEl.style.background = "linear-gradient(90deg, #10b981, #059669)";
                    }
                }

                // ── AUDIO SPIKE DETECTION ──
                // Threshold 35% filters out breathing, fans, AC, keyboard — catches actual speech
                const AUDIO_THRESHOLD = 35;
                const SPIKE_DURATION  = 4.0;   // must be sustained for 4s
                const SILENCE_RESET   = 1500;  // must be silent 1.5s before re-arming

                if (volumePercent > AUDIO_THRESHOLD) {
                    silenceSince = null; // reset silence timer while loud
                    if (audioSpikeStartTime === null) audioSpikeStartTime = Date.now();
                    const noiseDuration = (Date.now() - audioSpikeStartTime) / 1000;

                    if (noiseDuration >= SPIKE_DURATION) {
                        if (!audioSpikeReported) {
                            addRiskPoints(15, `Sustained voice/audio activity detected (${volumePercent}% for >${SPIKE_DURATION}s) — possible external communication`, "AUDIO_SPIKE");
                            audioSpikeReported = true;
                        }
                    }
                } else {
                    // Start silence cooldown before resetting
                    if (silenceSince === null) silenceSince = Date.now();
                    if (Date.now() - silenceSince >= SILENCE_RESET) {
                        audioSpikeStartTime = null;
                        audioSpikeReported = false;
                        silenceSince = null;
                    }
                }

                requestAnimationFrame(checkAudioLevel);
            }

            checkAudioLevel();
        } catch (audioErr) {
            console.warn("Web Audio initialization error:", audioErr);
            setMicStatus("error", "Web Audio Unavailable");
        }
    }

    // ===========================================
    // WINDOW FOCUS & MALPRACTICE EVENT LISTENERS
    // ===========================================
    function initFocusAndEventProctoring() {
        // ── TAB SWITCH BLOCKING ──
        window.addEventListener("beforeunload", function (e) {
            e.preventDefault();
            e.returnValue = "Are you sure you want to leave the exam? This will be recorded.";
            return e.returnValue;
        });

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                currentFocusState = "Tab Switched";
                if (focusPillEl) {
                    focusPillEl.textContent = "Tab Switched";
                    focusPillEl.className = "proctor-pill proctor-pill--danger";
                }
                addRiskPoints(25, "Student switched browser tabs / backgrounded application (Alt+Tab or tab switch)", "TAB_SWITCH");
                showTabSwitchWarning("Alt+Tab / Tab Switch Detected");
            } else {
                currentFocusState = "In-Focus";
                if (focusPillEl) {
                    focusPillEl.textContent = "In-Focus";
                    focusPillEl.className = "proctor-pill proctor-pill--normal";
                }
                const tWarn = document.getElementById('tabWarnOverlay');
                if (tWarn) tWarn.style.display = 'none';
            }
        });

        window.addEventListener("focus", function () {
            currentFocusState = "In-Focus";
            if (!document.fullscreenElement) {
                enterFullscreen();
            }
        });

        ["copy", "paste", "cut", "contextmenu"].forEach(eventType => {
            document.addEventListener(eventType, function (e) {
                e.preventDefault();
                addRiskPoints(10, `Attempted unpermitted action: ${eventType.toUpperCase()}`, "COPY_PASTE");
            });
        });

        document.addEventListener("keydown", function (e) {
            // ── Block & warn: Alt+Tab ──
            if (e.altKey && e.key === "Tab") {
                e.preventDefault();
                e.stopImmediatePropagation();
                addRiskPoints(15, "Attempted Alt+Tab window switching during exam", "TAB_SWITCH");
                showTabSwitchWarning("Alt+Tab Blocked");
                return;
            }

            // ── Block: Ctrl/Meta + W, T, N (close/open/new tab/window) ──
            if (
                (e.ctrlKey || e.metaKey) &&
                (e.key === "w" || e.key === "t" || e.key === "n")
            ) {
                e.preventDefault();
                e.stopImmediatePropagation();
                addRiskPoints(15, `Attempted tab/window shortcut: ${e.ctrlKey ? "Ctrl" : "Meta"}+${e.key.toUpperCase()}`, "KEYBOARD_SHORTCUT");
                showTabSwitchWarning("Tab Control Shortcut Blocked");
                return;
            }

            // ── Log: Copy/Paste/Select-all / DevTools ──
            if (
                (e.ctrlKey || e.metaKey) &&
                (e.key === "c" || e.key === "v" || e.key === "a")
            ) {
                addRiskPoints(15, `Detected clipboard shortcut: ${e.key.toUpperCase()}`, "KEYBOARD_SHORTCUT");
            }
            if (e.key === "F12") {
                e.preventDefault();
                addRiskPoints(15, "Attempted to open DevTools (F12)", "KEYBOARD_SHORTCUT");
            }
        });
    }

    // Tab switch / Alt+Tab warning overlay
    function showTabSwitchWarning(title = "Tab Switching Detected") {
        let warn = document.getElementById('tabWarnOverlay');
        if (!warn) {
            warn = document.createElement('div');
            warn.id = 'tabWarnOverlay';
            warn.style.cssText = `
                position: fixed; inset: 0; z-index: 99997;
                background: rgba(109,40,217,0.95);
                display: flex; align-items: center; justify-content: center;
                font-family: 'Inter', system-ui, sans-serif; color: white; text-align: center;
                backdrop-filter: blur(6px);
            `;
            document.body.appendChild(warn);
        }
        warn.innerHTML = `
            <div style="background:rgba(0,0,0,0.45);border-radius:20px;padding:36px 44px;max-width:420px;border:1.5px solid rgba(255,255,255,0.12);">
                <div style="font-size:2.5rem;margin-bottom:12px;">🚫</div>
                <h2 style="font-size:1.35rem;font-weight:800;margin:0 0 10px;">${title}</h2>
                <p style="opacity:0.88;margin:0 0 18px;line-height:1.6;font-size:0.9rem;">Switching tabs or applications is <strong>not allowed</strong> during the exam. This action has been flagged and recorded.</p>
                <div style="font-size:0.95rem;font-weight:700;background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 16px;margin-bottom:14px;">
                    +15–25 Risk Points Added
                </div>
                <p style="font-size:0.78rem;opacity:0.65;margin:0;">Return focus to the exam immediately. Repeated violations will be escalated.</p>
            </div>
        `;
        warn.style.display = 'flex';

        // Auto-hide after 4 seconds when page is visible again
        setTimeout(() => {
            if (warn && !document.hidden) warn.style.display = 'none';
        }, 4000);
    }

    // ── AUTO-REQUEST ALL PERMISSIONS (Camera, Mic, Screen Share) ──────────────────────
    // Show a guidance overlay while requesting permissions
    function showPermissionRequestOverlay() {
        let overlay = document.getElementById('permissionOverlay');
        if (overlay) return;
        overlay = document.createElement('div');
        overlay.id = 'permissionOverlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 99990;
            background: rgba(10,15,30,0.95);
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(10px);
            font-family: system-ui, sans-serif; color: white; text-align: center;
        `;
        overlay.innerHTML = `
            <div style="max-width:400px;padding:40px 32px;">
                <div style="font-size:3rem;margin-bottom:16px;">🔐</div>
                <h2 style="font-size:1.5rem;font-weight:800;margin:0 0 12px;">Requesting Exam Permissions</h2>
                <p style="opacity:0.8;margin:0 0 20px;line-height:1.6;">Please allow access to your <strong>camera</strong>, <strong>microphone</strong>, and <strong>screen sharing</strong> when prompted. These are required to take the exam.</p>
                <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:8px;">
                    <span style="background:rgba(255,255,255,0.1);border-radius:8px;padding:8px 16px;font-size:0.85rem;">📷 Camera</span>
                    <span style="background:rgba(255,255,255,0.1);border-radius:8px;padding:8px 16px;font-size:0.85rem;">🎤 Microphone</span>
                    <span style="background:rgba(255,255,255,0.1);border-radius:8px;padding:8px 16px;font-size:0.85rem;">🖥️ Screen Share</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    function hidePermissionOverlay() {
        const overlay = document.getElementById('permissionOverlay');
        if (overlay) {
            overlay.style.transition = 'opacity 0.4s';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 400);
        }
    }

    showPermissionRequestOverlay();
    showScreenShareWall(); // Block exam until screen share is granted

    // Request Camera & Microphone
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(function (stream) {
            mediaStream = stream;
            if (videoEl) videoEl.srcObject = stream;

            const placeholder = document.getElementById("cameraPlaceholder");
            if (placeholder) {
                videoEl.addEventListener("playing", () => placeholder.classList.add("hidden"));
            }

            setCameraStatus("connected", "Connected");
            setMicStatus("connected", "Connected");
            setStatusMessage("success", "Camera & Microphone active. Requesting screen share...");

            startAIVision();
            initAudioProctoring(stream);
            initFocusAndEventProctoring();
            sendTelemetryHeartbeat();

            // Now auto-request screen share (wall is already showing)
            startScreenShare().finally(() => {
                hidePermissionOverlay();
            });
        })
        .catch(function (err) {
            console.warn("Media stream access denied or unavailable:", err);
            setCameraStatus("denied", "Denied");
            setMicStatus("denied", "Denied");
            setStatusMessage("error", "Camera/Microphone permission denied. Allow permissions & reload.");
            hidePermissionOverlay();
        });

    // ── QUESTION RENDERING & NAVIGATION ─────────────────
    let currentQuestion = 0;
    const answers = [];

    const questionHeader = document.getElementById("questionHeader");
    const questionText = document.getElementById("questionText");
    const optionsList = document.getElementById("optionsList");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const progressFill = document.getElementById("progressFill");

    const letters = ["A", "B", "C", "D"];

    function renderQuestion(index) {
        if (!questionText || !optionsList) return;

        const q = questions[index];
        const total = questions.length;

        if (questionHeader) questionHeader.textContent = "Question " + (index + 1) + " of " + total;
        questionText.textContent = q.question;

        if (progressFill) progressFill.style.width = (((index + 1) / total) * 100) + "%";

        optionsList.innerHTML = "";

        q.options.forEach((opt, i) => {
            const li = document.createElement("li");
            li.className = "option-item";
            const inputId = "option_" + index + "_" + i;

            li.innerHTML = `
                <input type="radio" id="${inputId}" name="question_${index}" value="${i}">
                <label class="option-label" for="${inputId}">
                    <span class="option-letter">${letters[i]}</span>
                    <span>${opt}</span>
                </label>
            `;
            optionsList.appendChild(li);
        });

        if (answers[index] !== undefined) {
            const savedRadio = document.getElementById("option_" + index + "_" + answers[index]);
            if (savedRadio) {
                savedRadio.checked = true;
                if (nextBtn) nextBtn.disabled = false;
            }
        } else {
            if (nextBtn) nextBtn.disabled = true;
        }

        if (index === total - 1) {
            if (nextBtn) nextBtn.classList.add("btn--hidden");
            if (submitBtn) {
                submitBtn.classList.remove("btn--hidden");
                submitBtn.disabled = answers[index] === undefined;
            }
        } else {
            if (nextBtn) nextBtn.classList.remove("btn--hidden");
            if (submitBtn) submitBtn.classList.add("btn--hidden");
        }

        const radios = optionsList.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener("change", function () {
                answers[currentQuestion] = parseInt(radio.value);
                if (nextBtn) nextBtn.disabled = false;
                if (currentQuestion === questions.length - 1 && submitBtn) {
                    submitBtn.disabled = false;
                }
                sessionStorage.setItem("assessmentAnswers", JSON.stringify(answers));
                sendTelemetryHeartbeat();
            });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function () {
            if (nextBtn.disabled) return;
            currentQuestion++;
            renderQuestion(currentQuestion);
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener("click", function () {
            if (submitBtn.disabled) return;

            sessionStorage.setItem("assessmentAnswers", JSON.stringify(answers));

            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
            if (screenStream) {
                screenStream.getTracks().forEach(track => track.stop());
            }

            const overlay = document.getElementById("submissionOverlay");
            if (overlay) overlay.classList.add("visible");

            submitBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;

            sendTelemetryHeartbeat();
        });
    }

    renderQuestion(0);
}

// ===========================================
// MULTI-STUDENT INVIGILATOR COMMAND DASHBOARD
// ===========================================
function initDashboardPage() {
    console.log("Initializing Multi-Student Invigilator Dashboard System...");

    let soundEnabled = true;
    let currentFilter = "all"; // 'all' or 'high_risk'
    let currentViewMode = "grid"; // 'grid' or 'list'
    let lastEscalatedTimeMap = new Map();

    // UI Elements
    const studentGridEl = document.getElementById("studentGrid");
    const activeCountBadgeEl = document.getElementById("activeCountBadge");
    const dashTotalStudentsEl = document.getElementById("dashTotalStudents");
    const dashLowRiskCountEl = document.getElementById("dashLowRiskCount");
    const dashHighRiskCountEl = document.getElementById("dashHighRiskCount");
    const dashAvgIntegrityEl = document.getElementById("dashAvgIntegrity");
    const dashTotalEventsBadgeEl = document.getElementById("dashTotalEventsBadge");
    const globalAuditFeedEl = document.getElementById("globalAuditFeed");

    const toggleAlarmSoundBtn = document.getElementById("toggleAlarmSoundBtn");
    const clearSessionsBtn = document.getElementById("clearSessionsBtn");

    // Anomaly Escalation Modal UI Elements
    const anomalyModalEl = document.getElementById("anomalyModal");
    const closeAnomalyModalBtn = document.getElementById("closeAnomalyModalBtn");
    const dismissAnomalyBtn = document.getElementById("dismissAnomalyBtn");
    const logWarningBtn = document.getElementById("logWarningBtn");

    const modalStudentNameEl = document.getElementById("modalStudentName");
    const modalStudentIdEl = document.getElementById("modalStudentId");
    const modalRiskBadgeEl = document.getElementById("modalRiskBadge");
    const modalCameraImgEl = document.getElementById("modalCameraImg");
    const modalScreenImgEl = document.getElementById("modalScreenImg");

    const modalGazePillEl = document.getElementById("modalGazePill");
    const modalHeadPillEl = document.getElementById("modalHeadPill");
    const modalFocusPillEl = document.getElementById("modalFocusPill");
    const modalAudioLevelEl = document.getElementById("modalAudioLevel");

    const modalIncidentCategoryEl = document.getElementById("modalIncidentCategory");
    const modalIncidentReasonEl = document.getElementById("modalIncidentReason");

    // Web Audio Synthesizer Alarm Chime
    function playAlarmSound() {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {
            console.warn("Audio alarm warning:", e);
        }
    }

    const seedDemoBtn = document.getElementById("seedDemoBtn");
    if (seedDemoBtn) {
        seedDemoBtn.addEventListener("click", async () => {
            seedDemoBtn.disabled = true;
            seedDemoBtn.textContent = "⚡ Generating Demo Class...";
            try {
                await fetch("/api/proctor/seed-demo", { method: "POST" });
                await fetchAndRenderSessions();
            } catch (err) {
                console.warn("Failed to seed demo class:", err);
            } finally {
                seedDemoBtn.disabled = false;
                seedDemoBtn.textContent = "⚡ Simulate Demo Class";
            }
        });
    }

    if (toggleAlarmSoundBtn) {
        toggleAlarmSoundBtn.addEventListener("click", () => {
            soundEnabled = !soundEnabled;
            toggleAlarmSoundBtn.textContent = soundEnabled ? "🔔 Alarm: ON" : "🔕 Alarm: OFF";
            toggleAlarmSoundBtn.className = soundEnabled ? "btn btn--secondary btn--sm" : "btn btn--outline btn--sm";
        });
    }

    if (clearSessionsBtn) {
        clearSessionsBtn.addEventListener("click", async () => {
            if (confirm("Clear all active student sessions from the invigilator dashboard?")) {
                await fetch("/api/proctor/clear", { method: "POST" });
                fetchAndRenderSessions();
            }
        });
    }

    // Modal Close Handlers & Backdrop/ESC Handlers
    if (closeAnomalyModalBtn) closeAnomalyModalBtn.addEventListener("click", () => anomalyModalEl.classList.add("hidden"));
    if (dismissAnomalyBtn) dismissAnomalyBtn.addEventListener("click", () => anomalyModalEl.classList.add("hidden"));
    if (logWarningBtn) {
        logWarningBtn.addEventListener("click", () => {
            alert("Official malpractice warning logged for candidate!");
            anomalyModalEl.classList.add("hidden");
        });
    }
    if (anomalyModalEl) {
        anomalyModalEl.addEventListener("click", (e) => {
            if (e.target === anomalyModalEl) anomalyModalEl.classList.add("hidden");
        });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && anomalyModalEl && !anomalyModalEl.classList.contains("hidden")) {
            anomalyModalEl.classList.add("hidden");
        }
    });

    // View Mode Toggle Listeners
    const gridViewBtn = document.getElementById("gridViewBtn");
    const listViewBtn = document.getElementById("listViewBtn");

    if (gridViewBtn && listViewBtn) {
        gridViewBtn.addEventListener("click", () => {
            currentViewMode = "grid";
            gridViewBtn.classList.add("active");
            listViewBtn.classList.remove("active");
            fetchAndRenderSessions();
        });
        listViewBtn.addEventListener("click", () => {
            currentViewMode = "list";
            listViewBtn.classList.add("active");
            gridViewBtn.classList.remove("active");
            fetchAndRenderSessions();
        });
    }

    // Filter Buttons
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.getAttribute("data-filter");
            fetchAndRenderSessions();
        });
    });

    // Helper: Trigger Anomaly Full-Screen Modal View
    function triggerAnomalyEscalation(session) {
        if (!session) return;

        const now = Date.now();
        const lastEscalated = lastEscalatedTimeMap.get(session.studentId) || 0;

        // Prevent spamming modal if triggered within 10 seconds
        if (now - lastEscalated < 10000 && !anomalyModalEl.classList.contains("hidden")) {
            return;
        }
        lastEscalatedTimeMap.set(session.studentId, now);

        if (modalStudentNameEl) modalStudentNameEl.textContent = session.studentName;
        if (modalStudentIdEl) modalStudentIdEl.textContent = session.studentId;

        if (modalRiskBadgeEl) {
            modalRiskBadgeEl.textContent = "Risk: " + session.riskScore + " (" + session.riskLevel + ")";
            modalRiskBadgeEl.className = "risk-badge risk-badge--" + (session.riskLevel ? session.riskLevel.toLowerCase() : "low");
        }

        if (modalCameraImgEl) {
            modalCameraImgEl.src = session.cameraFrame || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240' fill='%23e2e8f0'><rect width='320' height='240'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='14'>Camera Frame Standby</text></svg>";
        }

        if (modalScreenImgEl) {
            modalScreenImgEl.src = session.screenFrame || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240' fill='%23f1f5f9'><rect width='320' height='240'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='14'>Desktop Screen Stream Off</text></svg>";
        }

        if (modalGazePillEl) {
            modalGazePillEl.textContent = session.gazeDirection || "Center";
            modalGazePillEl.className = "proctor-pill proctor-pill--" + (session.gazeDirection === "Center" ? "normal" : "danger");
        }

        if (modalHeadPillEl) {
            modalHeadPillEl.textContent = session.headPose || "Frontal";
            modalHeadPillEl.className = "proctor-pill proctor-pill--" + (session.headPose === "Frontal" ? "normal" : "warning");
        }

        if (modalFocusPillEl) {
            modalFocusPillEl.textContent = session.focusState || "In-Focus";
            modalFocusPillEl.className = "proctor-pill proctor-pill--" + (session.focusState === "In-Focus" ? "normal" : "danger");
        }

        if (modalAudioLevelEl) {
            const level = session.audioLevel || 0;
            modalAudioLevelEl.textContent = level > 22 ? "Voice Activity (" + level + "%)" : "Normal (" + level + "%)";
            modalAudioLevelEl.className = "proctor-pill proctor-pill--" + (level > 22 ? "warning" : "normal");
        }

        const incident = session.latestIncident;
        if (modalIncidentCategoryEl && modalIncidentReasonEl) {
            if (incident) {
                modalIncidentCategoryEl.textContent = `[${incident.category || 'MALPRACTICE ALERT'}] +${incident.points || 15} Pts`;
                modalIncidentReasonEl.textContent = incident.reason || "Suspicious behavior logged during session";
            } else {
                modalIncidentCategoryEl.textContent = "[ELEVATED RISK SCORE]";
                modalIncidentReasonEl.textContent = "Student risk score spiked above threshold";
            }
        }

        // Show Fullscreen Anomaly Modal
        anomalyModalEl.classList.remove("hidden");
        playAlarmSound();
    }

    // Fetch and Render Parallel Desktop Cards
    async function fetchAndRenderSessions() {
        try {
            const res = await fetch("/api/proctor/sessions");
            const data = await res.json();
            const sessions = data.sessions || [];

            // Sort all active sessions by risk score descending (highest risk at top)
            sessions.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

            // Metrics Update
            if (activeCountBadgeEl) activeCountBadgeEl.textContent = `● ${sessions.length} Student${sessions.length !== 1 ? 's' : ''} Monitored`;
            if (dashTotalStudentsEl) dashTotalStudentsEl.textContent = sessions.length;

            let lowCount = 0;
            let highCount = 0;
            let sumIntegrity = 0;
            let allEvents = [];

            sessions.forEach(s => {
                if (s.riskScore >= 35) highCount++;
                else lowCount++;
                sumIntegrity += (s.integrityPercent || 100);

                if (s.riskEvents && Array.isArray(s.riskEvents)) {
                    s.riskEvents.forEach(ev => allEvents.push({ ...ev, studentName: s.studentName, studentId: s.studentId }));
                }
            });

            if (dashLowRiskCountEl) dashLowRiskCountEl.textContent = lowCount;
            if (dashHighRiskCountEl) dashHighRiskCountEl.textContent = highCount;
            if (dashAvgIntegrityEl) dashAvgIntegrityEl.textContent = sessions.length > 0 ? Math.round(sumIntegrity / sessions.length) + "%" : "100%";

            // Filter Sessions for Grid or List
            const filtered = sessions.filter(s => {
                if (currentFilter === "high_risk") return s.riskScore >= 35;
                return true;
            });

            // Render Multi-Student Desktop Wall Grid or Priority List View
            if (studentGridEl) {
                if (filtered.length === 0) {
                    studentGridEl.innerHTML = `
                        <div class="grid-empty">
                            <div class="grid-empty__icon">🖥️</div>
                            <h3>${currentFilter === 'high_risk' ? 'No High Risk Candidates Flagged' : 'Waiting for student laptops to join...'}</h3>
                            <p>Open <a href="exam.html" target="_blank" style="color: #2563eb; text-decoration: underline;">exam.html</a> on candidate laptops or click '⚡ Simulate Demo Class' above to populate students.</p>
                        </div>
                    `;
                } else if (currentViewMode === "list") {
                    // Priority List Table View — Screen Share Primary
                    studentGridEl.innerHTML = `
                        <div class="student-list-container">
                            <table class="priority-table">
                                <thead>
                                    <tr>
                                        <th>Priority Rank</th>
                                        <th>Candidate</th>
                                        <th style="width:260px;">🖥️ Desktop Screen (Primary)</th>
                                        <th>Telemetry Status</th>
                                        <th>Risk Score</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filtered.map((s, idx) => {
                                        const initial = (s.studentName || "ST").charAt(0).toUpperCase();
                                        const isFlagged = s.riskScore >= 35;
                                        return `
                                            <tr class="${isFlagged ? 'row-flagged' : ''}">
                                                <td>
                                                    <span class="risk-badge risk-badge--${(s.riskLevel || 'low').toLowerCase()}">
                                                        #${idx + 1} Priority
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style="display:flex; align-items:center; gap:8px;">
                                                        <div class="header__avatar" style="width:28px; height:28px; font-size:0.75rem;">${initial}</div>
                                                        <div>
                                                            <div style="font-weight:700;">${s.studentName}</div>
                                                            <div style="font-size:0.725rem; color:#64748b;">${s.studentId}</div>
                                                        </div>
                                                    </div>
                                                    ${s.cameraFrame ? `<div style="margin-top:4px;"><img src="${s.cameraFrame}" style="width:48px;height:36px;border-radius:4px;object-fit:cover;border:1px solid #334155;" title="Camera Feed"></div>` : ''}
                                                </td>
                                                <td>
                                                    <!-- Screen Share is the primary display -->
                                                    ${s.screenFrame 
                                                        ? `<img src="${s.screenFrame}" class="list-stream-thumb" alt="Desktop Screen" style="width:240px;height:140px;">` 
                                                        : `<div class="list-stream-placeholder" style="width:240px;height:140px;">Desktop Screen Off</div>`
                                                    }
                                                </td>
                                                <td>
                                                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                                                        <span class="proctor-pill proctor-pill--${s.gazeDirection === 'Center' ? 'normal' : 'warning'}">${s.gazeDirection || 'Center'}</span>
                                                        <span class="proctor-pill proctor-pill--${s.focusState === 'In-Focus' ? 'normal' : 'danger'}">${s.focusState || 'In-Focus'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <strong style="color:${isFlagged ? '#dc2626' : '#059669'}; font-size:0.9375rem;">
                                                        ${s.riskScore} <span style="font-size:0.725rem; font-weight:normal;">(${s.riskLevel || 'LOW'})</span>
                                                    </strong>
                                                </td>
                                                <td>
                                                    <button class="btn btn--secondary btn--xs inspect-btn" data-id="${s.studentId}">
                                                        🔍 Inspect
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join("")}
                                </tbody>
                            </table>
                        </div>
                    `;

                    // Attach Inspect Listeners
                    document.querySelectorAll(".inspect-btn").forEach(b => {
                        b.addEventListener("click", () => {
                            const sid = b.getAttribute("data-id");
                            const session = sessions.find(s => s.studentId === sid);
                            if (session) triggerAnomalyEscalation(session);
                        });
                    });
                } else {
                    // Parallel Streams Extra Large Icon Grid View — Screen Share is DOMINANT
                    studentGridEl.innerHTML = filtered.map((s, idx) => {
                        const hasScreen = !!s.screenFrame;
                        const hasCam = !!s.cameraFrame;
                        const initial = (s.studentName || "ST").charAt(0).toUpperCase();
                        const isFlagged = s.riskScore >= 35;

                        return `
                            <div class="student-card ${isFlagged ? 'student-card--flagged' : ''}" data-id="${s.studentId}">
                                <div class="student-card__header">
                                    <div class="student-card__info">
                                        <div class="header__avatar" style="width:28px; height:28px; font-size:0.75rem;">${initial}</div>
                                        <div>
                                            <h3 class="student-card__name">${s.studentName}</h3>
                                            <span class="student-card__id">ID: ${s.studentId}</span>
                                        </div>
                                    </div>
                                    <span class="risk-badge risk-badge--${(s.riskLevel || 'low').toLowerCase()}">
                                        #${idx + 1} Priority
                                    </span>
                                </div>

                                <!-- PRIMARY: Full Desktop Screen Share (dominant display) -->
                                <div class="stream-box stream-box--large" style="position:relative;">
                                    <span class="stream-label">🖥️ Desktop Screen ${hasScreen ? '● Live' : '— Awaiting Share'}</span>
                                    ${s.screenFrame 
                                        ? `<img src="${s.screenFrame}" class="stream-img" alt="Desktop Screen Stream" style="width:100%;height:100%;object-fit:cover;">` 
                                        : `<div class="stream-placeholder" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;"><span style="font-size:1.5rem;">🖥️</span><span style="font-size:0.7rem;">Awaiting Screen Share</span></div>`
                                    }

                                    <!-- Small PIP: Camera feed overlay (bottom-right) -->
                                    <div class="pip-camera-box" title="Candidate Camera Feed">
                                        <span class="pip-label">📷 Cam</span>
                                        ${hasCam 
                                            ? `<img src="${s.cameraFrame}" class="stream-img" alt="Camera">` 
                                            : `<div class="stream-placeholder" style="font-size:0.55rem;padding:2px;">Cam Off</div>`
                                        }
                                    </div>
                                </div>

                                <!-- Live Telemetry Grid -->
                                <div class="card-telemetry-row">
                                    <span class="proctor-pill proctor-pill--${s.gazeDirection === 'Center' ? 'normal' : 'warning'}">${s.gazeDirection || 'Center'}</span>
                                    <span class="proctor-pill proctor-pill--${s.focusState === 'In-Focus' ? 'normal' : 'danger'}">${s.focusState || 'In-Focus'}</span>
                                    <strong style="font-size:0.775rem; margin-left:auto; color:${isFlagged ? '#dc2626' : '#059669'}">
                                        Risk: ${s.riskScore}
                                    </strong>
                                </div>

                                <button class="btn btn--secondary btn--xs inspect-btn" data-id="${s.studentId}">
                                    🔍 Inspect Candidate
                                </button>
                            </div>
                        `;
                    }).join("");

                    // Attach Inspect Listeners
                    document.querySelectorAll(".student-card").forEach(card => {
                        card.addEventListener("click", (e) => {
                            const sid = card.getAttribute("data-id");
                            const session = sessions.find(s => s.studentId === sid);
                            if (session) triggerAnomalyEscalation(session);
                        });
                    });
                }
            }

            // Global Audit Incident Feed
            if (globalAuditFeedEl) {
                if (allEvents.length === 0) {
                    globalAuditFeedEl.innerHTML = '<div class="log-empty">No malpractice incidents or unusual behavior recorded.</div>';
                    if (dashTotalEventsBadgeEl) dashTotalEventsBadgeEl.textContent = "0 Anomaly Events";
                } else {
                    if (dashTotalEventsBadgeEl) dashTotalEventsBadgeEl.textContent = `${allEvents.length} Anomaly Event${allEvents.length > 1 ? 's' : ''}`;
                    globalAuditFeedEl.innerHTML = allEvents.slice().reverse().map(ev => `
                        <div class="log-item log-item--${ev.category ? ev.category.toLowerCase() : 'general'}">
                            <div class="log-item__header">
                                <span>[${ev.studentName || 'Student'} - ID: ${ev.studentId || ''}] +${ev.points} pts</span>
                                <span class="log-item__time">${ev.time}</span>
                            </div>
                            <div class="log-item__desc">${ev.reason}</div>
                        </div>
                    `).join("");
                }
            }

        } catch (err) {
            console.warn("Error fetching invigilator session state:", err);
        }
    }

    // Connect to Server-Sent Events (SSE) for Instant Anomaly Pushes
    try {
        const evtSource = new EventSource("/api/proctor/events");

        evtSource.addEventListener("malpractice_anomaly", (e) => {
            const data = JSON.parse(e.data);
            console.log("SSE Malpractice Anomaly received:", data);
            // Grid refreshes automatically — invigilator clicks Inspect to view details
            fetchAndRenderSessions();
        });

        evtSource.addEventListener("session_update", () => {
            fetchAndRenderSessions();
        });

        evtSource.addEventListener("session_removed", () => {
            fetchAndRenderSessions();
        });
    } catch (sseErr) {
        console.warn("SSE connection fallback to interval polling:", sseErr);
    }

    // Interval polling every 1.5s
    setInterval(fetchAndRenderSessions, 1500);
    fetchAndRenderSessions();
}

// ===========================================
// MAIN ENTRY POINT — ROUTE BASED ON PAGE
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
    if (isDashboardPage()) {
        initDashboardPage();
    } else if (isExamPage()) {
        initExamPage();
    } else if (isIndexPage()) {
        initIndexPage();
    }
});
