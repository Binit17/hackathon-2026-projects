import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Bot,
  CreditCard,
  Download,
  FileText,
  HeartPulse,
  Info,
  Lock,
  Loader2,
  Pill,
  PhoneCall,
  QrCode,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { generateBrief, getDrugWarnings, getPatient, getQr } from "./api/careRelayApi";
import { compactCondition, display, shortMedName, titleCase } from "./utils/format";

const views = [
  { id: "snapshot", label: "Snapshot", icon: Stethoscope },
  { id: "deepDive", label: "Deep Dive", icon: Activity },
  { id: "idCard", label: "ID Card", icon: CreditCard },
];

const metricOrder = ["hba1c", "blood_pressure", "ldl", "egfr", "weight", "glucose"];

export default function App() {
  const [activeView, setActiveView] = useState("snapshot");
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPatient()
      .then(setPatientData)
      .catch(() => setError("Backend is not reachable. Start Flask at http://127.0.0.1:5000."));
  }, []);

  if (error) {
    return (
      <main className="center-screen">
        <div className="error-card">
          <AlertTriangle size={28} />
          <h1>CareRelay backend needed</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!patientData) {
    return (
      <main className="center-screen">
        <Loader2 className="spin" size={32} />
        <p>Loading patient snapshot...</p>
      </main>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CR</div>
          <div>
            <strong>CareRelay</strong>
            <span>Clinician snapshot</span>
          </div>
        </div>
        <nav className="nav">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                className={activeView === view.id ? "nav-item active" : "nav-item"}
                key={view.id}
                onClick={() => setActiveView(view.id)}
              >
                <Icon size={18} />
                {view.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <BadgeCheck size={16} />
          Synthetic Synthea data. Not for clinical use.
        </div>
      </aside>

      <main className="main">
        <DisclaimerBanner text={patientData.disclaimer} />
        {activeView === "snapshot" && <Snapshot data={patientData} />}
        {activeView === "deepDive" && <DeepDive data={patientData} />}
        {activeView === "idCard" && <IDCard data={patientData} />}
      </main>
    </div>
  );
}

function DisclaimerBanner({ text }) {
  return (
    <div className="disclaimer">
      <AlertTriangle size={16} />
      {text}
    </div>
  );
}

function Snapshot({ data }) {
  return (
    <section className="page">
      <PatientHeader data={data} />
      <MetricGrid metrics={data.snapshot.latestMetrics} />
      <div className="snapshot-grid">
        <ClinicalState data={data} />
        <AIBriefPanel />
      </div>
      <div className="three-col">
        <AllergyPanel allergies={data.snapshot.allergies} />
        <ConditionsPanel conditions={data.snapshot.activeConditions} />
        <MedicationPanel medications={data.snapshot.currentMedications} />
      </div>
      <DrugWarnings medications={data.snapshot.currentMedications} />
    </section>
  );
}

function PatientHeader({ data }) {
  const patient = data.patient;
  return (
    <header className="patient-hero">
      <div>
        <div className="eyebrow">QR-linked synthetic patient record</div>
        <h1>{patient.name}</h1>
        <p>
          {titleCase(patient.gender)} · {patient.age} · MRN {patient.mrn}
        </p>
      </div>
      <div className="header-facts">
        <Fact label="Blood type" value={patient.bloodType} />
        <Fact label="Code status" value={patient.codeStatus} />
        <Fact label="Address" value={patient.address} />
      </div>
    </header>
  );
}

function Fact({ label, value }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{display(value)}</strong>
    </div>
  );
}

function MetricGrid({ metrics }) {
  return (
    <div className="metric-grid">
      {metricOrder.map((key) => {
        const metric = metrics[key];
        if (!metric) return null;
        return (
          <article className="metric-card" key={key}>
            <span>{metric.label}</span>
            <strong>{metric.displayValue}</strong>
            <small>{metric.date}</small>
          </article>
        );
      })}
    </div>
  );
}

function ClinicalState({ data }) {
  return (
    <section className="panel clinical-state">
      <div className="panel-title">
        <HeartPulse size={18} />
        <h2>Clinical State At A Glance</h2>
      </div>
      <div className="status-pill">Structured snapshot</div>
      <p>{data.snapshot.aiStatusLine}</p>
      <div className="mini-stats">
        <span>{data.conditions.length} conditions</span>
        <span>{data.medications.length} medications</span>
        <span>{data.encounters.length} recent encounters</span>
      </div>
    </section>
  );
}

function AIBriefPanel() {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBrief() {
    setLoading(true);
    setError("");
    try {
      setBrief(await generateBrief());
    } catch {
      setError("Unable to generate brief. Check backend and Hugging Face token.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-title">
        <Bot size={18} />
        <h2>First Visit Brief</h2>
      </div>
      <button className="primary-button" disabled={loading} onClick={handleBrief}>
        {loading ? <Loader2 className="spin" size={16} /> : <FileText size={16} />}
        {loading ? "Generating..." : "Generate First Visit Brief"}
      </button>
      {error && <p className="error-text">{error}</p>}
      {brief && (
        <div className="brief-box">
          <p>{brief.brief}</p>
          <small>
            Source: {brief.source} · Model: {brief.model || "fallback"}
          </small>
        </div>
      )}
    </section>
  );
}

function AllergyPanel({ allergies }) {
  return (
    <section className="panel">
      <div className="panel-title danger-title">
        <AlertTriangle size={18} />
        <h2>Allergies</h2>
      </div>
      <div className="chip-wrap">
        {allergies.length ? (
          allergies.map((allergy) => (
            <span className="chip danger" key={allergy.name}>
              {compactCondition(allergy.name)}
            </span>
          ))
        ) : (
          <p className="muted">No allergies documented.</p>
        )}
      </div>
    </section>
  );
}

function ConditionsPanel({ conditions }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <Activity size={18} />
        <h2>Active Conditions</h2>
      </div>
      <div className="chip-wrap">
        {conditions.slice(0, 12).map((condition) => (
          <span className="chip" key={condition.name}>
            {compactCondition(condition.name)}
          </span>
        ))}
      </div>
    </section>
  );
}

function MedicationPanel({ medications }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <Pill size={18} />
        <h2>Current Medications</h2>
      </div>
      <div className="list">
        {medications.slice(0, 8).map((med) => (
          <div className="list-row" key={med.name}>
            <strong>{shortMedName(med.name)}</strong>
            <span>{med.status} · {med.authoredOn || "date unknown"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DrugWarnings({ medications }) {
  const [warnings, setWarnings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkWarnings() {
    setLoading(true);
    setError("");
    try {
      const medNames = medications.slice(0, 5).map((med) => med.name);
      setWarnings(await getDrugWarnings(medNames));
    } catch {
      setError("Unable to check OpenFDA labels.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel wide-panel">
      <div className="panel-title danger-title">
        <AlertTriangle size={18} />
        <h2>OpenFDA Medication Warnings</h2>
      </div>
      <button className="secondary-button" disabled={loading} onClick={checkWarnings}>
        {loading ? <Loader2 className="spin" size={16} /> : <Pill size={16} />}
        {loading ? "Checking..." : "Check Current Medications"}
      </button>
      {error && <p className="error-text">{error}</p>}
      {warnings && (
        <div className="warning-grid">
          {warnings.warnings.map((warning) => (
            <article className="warning-card" key={warning.medication}>
              <strong>{warning.medication}</strong>
              <p>{warning.interaction || warning.warning}</p>
              <small>{warning.source}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function DeepDive({ data }) {
  return (
    <section className="page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Patient timeline and trends</div>
          <h1>Deep Dive</h1>
        </div>
        <div className="segment">
          {["All", "Cardiology", "Endocrinology", "Nephrology"].map((item) => (
            <button key={item}>{item}</button>
          ))}
        </div>
      </div>
      <TrendCharts trends={data.trends} />
      <div className="deep-grid">
        <Timeline timeline={data.timeline} />
        <ConditionThreads threads={data.conditionThreads} />
      </div>
      <EncounterReel encounters={data.encounters} />
    </section>
  );
}

function TrendCharts({ trends }) {
  const bp = (trends.blood_pressure || []).map((item) => ({
    date: item.date,
    systolic: item.value?.systolic,
    diastolic: item.value?.diastolic,
  }));
  return (
    <div className="chart-grid">
      <ChartPanel title="HbA1c" data={trends.hba1c || []} dataKey="value" unit="%" />
      <ChartPanel title="LDL" data={trends.ldl || []} dataKey="value" unit="mg/dL" />
      <ChartPanel title="eGFR" data={trends.egfr || []} dataKey="value" unit="" />
      <section className="panel chart-panel">
        <h2>Blood Pressure</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={bp.slice(-30)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7eeee" />
            <XAxis dataKey="date" hide />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="systolic" stroke="#0b4f4a" dot={false} />
            <Line type="monotone" dataKey="diastolic" stroke="#00baa7" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

function ChartPanel({ title, data, dataKey, unit }) {
  return (
    <section className="panel chart-panel">
      <h2>{title}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={(data || []).slice(-30)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7eeee" />
          <XAxis dataKey="date" hide />
          <YAxis />
          <Tooltip formatter={(value) => `${value} ${unit}`} />
          <Line type="monotone" dataKey={dataKey} stroke="#00baa7" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}

function Timeline({ timeline }) {
  return (
    <section className="panel">
      <h2>Patient Timeline</h2>
      <div className="timeline">
        {timeline.slice(-18).reverse().map((event, index) => (
          <div className="timeline-row" key={`${event.date}-${event.title}-${index}`}>
            <span className={`timeline-dot ${event.type}`} />
            <div>
              <strong>{event.title}</strong>
              <p>{event.date} · {event.type}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ConditionThreads({ threads }) {
  return (
    <section className="panel">
      <h2>Condition Threads</h2>
      <div className="list">
        {threads.map((thread) => (
          <div className="list-row" key={thread.title}>
            <strong>{thread.title}</strong>
            <span>
              {thread.conditions.length} conditions · {thread.medications.length} meds ·{" "}
              {thread.recentLabs.length} labs
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function EncounterReel({ encounters }) {
  return (
    <section className="panel wide-panel">
      <h2>Recent Encounters</h2>
      <div className="encounter-grid">
        {encounters.slice(-12).reverse().map((encounter) => (
          <article className="encounter-card" key={encounter.id}>
            <strong>{encounter.type}</strong>
            <span>{encounter.date}</span>
            <p>{encounter.provider || "Provider not listed"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function IDCard({ data }) {
  const [qr, setQr] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getQr().then(setQr).catch(() => setQr(null));
  }, []);

  const meds = data.snapshot.currentMedications.slice(0, 4);
  const allergies = data.snapshot.allergies;
  const conditions = data.snapshot.activeConditions.slice(0, 4);
  const emergencyContact = "S. Mitchell (Proxy)";
  const emergencyPhone = "(512) 555-0187";

  async function downloadCard() {
    if (!qr?.qr) return;
    setDownloading(true);
    try {
      await downloadIdCardImage({ data, qr, meds, allergies, conditions, emergencyContact, emergencyPhone });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Patient-carried access</div>
          <h1>Medical ID Card</h1>
        </div>
        <button className="primary-button" disabled={!qr || downloading} onClick={downloadCard}>
          {downloading ? <Loader2 className="spin" size={16} /> : <Download size={16} />}
          {downloading ? "Preparing..." : "Download PNG"}
        </button>
      </div>

      <div className="id-card-stack" id="care-relay-id-card">
        <div className="side-label">Front side</div>
        <article className="id-card-surface">
          <div className="id-card-header">
            <div className="id-logo">
              <span className="id-heart">+</span>
              <strong>CareRelay</strong>
            </div>
            <div className="id-heading">
              <strong>Patient ID Card</strong>
              <span>Emergency Medical Reference</span>
            </div>
          </div>

          <div className="id-card-body front">
            <section className="identity-block">
              <div className="id-section-title">
                <User size={21} />
                <span>Identity</span>
              </div>
              <label>Name</label>
              <h2>{data.patient.name}</h2>
              <label>Sex / Age</label>
              <strong>{titleCase(data.patient.gender)} / {data.patient.age}</strong>
              <label>MRN</label>
              <strong>{data.patient.mrn}</strong>
              <label>Blood Group</label>
              <strong>{display(data.patient.bloodType, "Unknown")}</strong>
            </section>

            <section className="medical-lines">
              <CardLine
                tone="danger"
                icon={<AlertTriangle size={26} />}
                label="Allergies"
                value={allergies.map((item) => compactCondition(item.name)).join(", ") || "None documented"}
              />
              <CardLine
                icon={<Pill size={26} />}
                label="Medications"
                value={meds.map((item) => shortMedName(item.name)).join(", ")}
              />
              <CardLine
                icon={<HeartPulse size={26} />}
                label="Diagnoses"
                value={conditions.map((item) => compactCondition(item.name)).join(", ")}
              />
              <div className="emergency-contact">
                <Users size={27} />
                <div>
                  <span>Emergency Contact</span>
                  <strong>{emergencyContact}</strong>
                </div>
                <div className="phone">
                  <PhoneCall size={20} />
                  {emergencyPhone}
                </div>
              </div>
            </section>
          </div>

          <div className="id-card-footer">
            <ShieldCheck size={19} />
            <span>For emergency use by healthcare professionals</span>
            <strong>CR-{data.patient.mrn}</strong>
          </div>
        </article>

        <div className="side-label">Back side</div>
        <article className="id-card-surface">
          <div className="id-card-header centered">
            <span className="rule" />
            <div className="id-logo">
              <span className="id-heart">+</span>
              <strong>CareRelay</strong>
            </div>
            <span className="rule" />
          </div>

          <div className="id-card-body back">
            <div className="qr-frame">
              {qr ? <img src={qr.qr} alt="CareRelay QR code" /> : <QrCode size={132} />}
            </div>
            <div className="scan-copy">
              <Lock size={26} />
              <strong>Scan for Secure Access</strong>
              <p>Full clinician snapshot, medication warnings, visit brief, and emergency resources.</p>
            </div>
            <div className="card-guidance">
              <Guidance icon={<Info size={24} />} text="This card is for emergency medical reference only, not a substitute for official medical records." />
              <Guidance icon={<PhoneCall size={24} />} text="In life-threatening emergencies, call 911 immediately." tone="danger" />
              <Guidance icon={<ShieldCheck size={24} />} text="Report lost or stolen card to the CareRelay care team." />
            </div>
          </div>

          <div className="id-card-footer light">
            <ShieldCheck size={19} />
            <span>Property of CareRelay. Not transferable.</span>
            <strong>{qr?.url || "http://localhost:5173/patient/default"}</strong>
          </div>
        </article>
      </div>
    </section>
  );
}

function CardLine({ icon, label, value, tone = "default" }) {
  return (
    <div className={`card-line ${tone}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Guidance({ icon, text, tone = "default" }) {
  return (
    <div className={`guidance ${tone}`}>
      {icon}
      <p>{text}</p>
    </div>
  );
}

async function downloadIdCardImage({ data, qr, meds, allergies, conditions, emergencyContact, emergencyPhone }) {
  const canvas = document.createElement("canvas");
  const scale = 2;
  const width = 1420;
  const height = 1160;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const qrImage = await loadImage(qr.qr);
  ctx.fillStyle = "#f7faf9";
  ctx.fillRect(0, 0, width, height);
  drawCardSide(ctx, 80, 60, "front", { data, meds, allergies, conditions, emergencyContact, emergencyPhone, qrImage, qr });
  drawCardSide(ctx, 80, 625, "back", { data, meds, allergies, conditions, emergencyContact, emergencyPhone, qrImage, qr });

  const link = document.createElement("a");
  link.download = `CareRelay-ID-${data.patient.mrn}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCardSide(ctx, x, y, side, context) {
  const cardWidth = 1260;
  const cardHeight = 470;
  roundRect(ctx, x, y, cardWidth, cardHeight, 22, "#ffffff", "#d9e5e2");
  ctx.fillStyle = "#0b3037";
  roundTop(ctx, x, y, cardWidth, 112, 22);
  ctx.fill();
  ctx.fillStyle = "#ffffff";

  if (side === "front") {
    ctx.font = "700 42px Arial";
    ctx.fillText("✚ CareRelay", x + 70, y + 70);
    drawFrontCard(ctx, x, y, context);
  } else {
    ctx.strokeStyle = "#7be7d9";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 60, y + 58);
    ctx.lineTo(x + 470, y + 58);
    ctx.moveTo(x + 790, y + 58);
    ctx.lineTo(x + 1200, y + 58);
    ctx.stroke();
    ctx.font = "700 42px Arial";
    ctx.fillText("✚ CareRelay", x + 520, y + 72);
    drawBackCard(ctx, x, y, context);
  }
}

function drawFrontCard(ctx, x, y, { data, meds, allergies, conditions, emergencyContact, emergencyPhone }) {
  ctx.fillStyle = "#8ff5e4";
  ctx.font = "700 25px Arial";
  ctx.fillText("PATIENT ID CARD", x + 960, y + 48);
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 21px Arial";
  ctx.fillText("Emergency Medical Reference", x + 850, y + 82);

  ctx.strokeStyle = "#d3dedb";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 400, y + 142);
  ctx.lineTo(x + 400, y + 360);
  ctx.stroke();

  ctx.fillStyle = "#145d58";
  ctx.font = "700 22px Arial";
  ctx.fillText("IDENTITY", x + 105, y + 158);
  ctx.fillStyle = "#0f172b";
  ctx.font = "600 17px Arial";
  ctx.fillText("Name", x + 48, y + 202);
  ctx.font = "700 29px Arial";
  fitCanvasText(ctx, data.patient.name, x + 48, y + 238, 300);
  ctx.font = "600 17px Arial";
  ctx.fillText("Sex / Age", x + 48, y + 278);
  ctx.font = "700 24px Arial";
  ctx.fillText(`${titleCase(data.patient.gender)} / ${data.patient.age}`, x + 48, y + 310);
  ctx.font = "600 17px Arial";
  ctx.fillText("MRN", x + 48, y + 348);
  ctx.font = "700 22px Arial";
  ctx.fillText(data.patient.mrn, x + 48, y + 378);

  const allergyText = allergies.map((item) => compactCondition(item.name)).join(", ") || "None documented";
  const medicationText = meds.map((item) => shortMedName(item.name)).join(", ");
  const diagnosisText = conditions.map((item) => compactCondition(item.name)).join(", ");
  drawCanvasLine(ctx, x + 455, y + 165, "⚠", "ALLERGIES", allergyText, "#b42318", 1);
  drawCanvasLine(ctx, x + 455, y + 240, "●", "MEDICATIONS", medicationText, "#145d58", 2);
  drawCanvasLine(ctx, x + 455, y + 322, "♥", "DIAGNOSES", diagnosisText, "#145d58", 2);

  ctx.strokeStyle = "#c9d5d2";
  ctx.strokeRect(x + 445, y + 365, 760, 60);
  ctx.fillStyle = "#145d58";
  ctx.font = "700 20px Arial";
  ctx.fillText("EMERGENCY CONTACT", x + 520, y + 389);
  ctx.fillStyle = "#0f172b";
  ctx.font = "700 23px Arial";
  ctx.fillText(emergencyContact, x + 520, y + 415);
  ctx.font = "700 22px Arial";
  ctx.fillText(emergencyPhone, x + 980, y + 405);

  ctx.fillStyle = "#176a64";
  ctx.fillRect(x, y + 422, 1260, 48);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 20px Arial";
  ctx.fillText("For emergency use by healthcare professionals", x + 74, y + 453);
  ctx.fillText(`CR-${data.patient.mrn}`, x + 1070, y + 453);
}

function drawBackCard(ctx, x, y, { qrImage, qr }) {
  ctx.drawImage(qrImage, x + 65, y + 160, 235, 235);
  ctx.fillStyle = "#145d58";
  ctx.font = "700 23px Arial";
  ctx.fillText("SCAN FOR SECURE ACCESS", x + 390, y + 235);
  ctx.fillStyle = "#0f172b";
  ctx.font = "500 22px Arial";
  wrapCanvasText(ctx, "Full medical profile, medication warnings, visit brief, and emergency resources.", x + 390, y + 285, 330, 30, 4);

  ctx.strokeStyle = "#d3dedb";
  ctx.beginPath();
  ctx.moveTo(x + 700, y + 142);
  ctx.lineTo(x + 700, y + 370);
  ctx.stroke();
  drawGuidanceText(ctx, x + 750, y + 170, "ℹ", "This card is for emergency medical reference only, not a substitute for official medical records.");
  drawGuidanceText(ctx, x + 750, y + 250, "☎", "In life-threatening emergencies, call 911 immediately.", "#b42318");
  drawGuidanceText(ctx, x + 750, y + 330, "✓", "Report lost or stolen card to the CareRelay care team.");

  ctx.strokeStyle = "#d3dedb";
  ctx.beginPath();
  ctx.moveTo(x + 45, y + 382);
  ctx.lineTo(x + 1215, y + 382);
  ctx.stroke();
  ctx.fillStyle = "#0f172b";
  ctx.font = "700 20px Arial";
  ctx.fillText("Property of CareRelay. Not transferable.", x + 105, y + 414);
  ctx.fillText(qr.url, x + 675, y + 414);
}

function drawCanvasLine(ctx, x, y, icon, label, value, color, maxLines = 2) {
  ctx.fillStyle = color;
  ctx.font = "700 24px Arial";
  ctx.fillText(icon, x, y);
  ctx.font = "700 21px Arial";
  ctx.fillText(label, x + 80, y);
  ctx.fillStyle = "#0f172b";
  ctx.font = "600 21px Arial";
  wrapCanvasText(ctx, value || "None documented", x + 280, y, 470, 26, maxLines);
}

function drawGuidanceText(ctx, x, y, icon, text, color = "#145d58") {
  ctx.fillStyle = color;
  ctx.font = "700 25px Arial";
  ctx.fillText(icon, x, y);
  ctx.fillStyle = "#0f172b";
  ctx.font = "600 21px Arial";
  wrapCanvasText(ctx, text, x + 72, y, 390, 28, 3);
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 999) {
  const words = String(text).split(" ");
  let line = "";
  let lines = 1;
  for (const word of words) {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      if (lines >= maxLines) {
        fitCanvasText(ctx, `${line.trim()}...`, x, y, maxWidth);
        return;
      }
      ctx.fillText(line.trim(), x, y);
      line = `${word} `;
      y += lineHeight;
      lines += 1;
    } else {
      line = testLine;
    }
  }
  fitCanvasText(ctx, line.trim(), x, y, maxWidth);
}

function fitCanvasText(ctx, text, x, y, maxWidth) {
  let output = String(text || "");
  while (output.length > 4 && ctx.measureText(output).width > maxWidth) {
    output = `${output.slice(0, -4)}...`;
  }
  ctx.fillText(output, x, y);
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function roundTop(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}
