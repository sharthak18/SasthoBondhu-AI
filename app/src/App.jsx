import { lazy, Suspense, useState, useEffect } from "react";
import { 
  Users, AlertTriangle, UserCheck, Mic, MicOff, Activity, Heart, Droplets, 
  Wind, ChevronRight, ChevronLeft, Check, Phone, MapPin, Clock, Star, Bell, 
  Home, UserPlus, BarChart2, Play, Loader2, Volume2, Printer,
  Info, ShieldAlert, FileText
} from "lucide-react";
import { 
  DEMO_PATIENT, DASHBOARD_KPIS, TIER_DATA,
  TREND_DATA, CHW_DATA, DIVISIONS, VOICE_PRESETS, FACILITY_MAPPING
} from "./data";
import { calculateRisk, validateVitals } from "./clinicalRisk";

const DashboardCharts = lazy(() => import("./DashboardCharts"));

// ==========================================
// CLINICAL ENGINE & RISK CALCULATION METHODS
// ==========================================

const createCaseId = (upazila = "Faridpur Sadar") => {
  const districtCode = upazila.substring(0, 3).toUpperCase();
  const randomPart = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID().split("-")[0].toUpperCase()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

  return `BD-${districtCode}-${randomPart}`;
};

const createInitialDraft = () => ({
  id: "",
  name: DEMO_PATIENT.name,
  age: DEMO_PATIENT.age,
  sex: DEMO_PATIENT.sex,
  village: DEMO_PATIENT.village,
  phone: DEMO_PATIENT.phone,
  nid: "8472910384",
  upazila: "Faridpur Sadar",
  hasFamilyHistory: false,
  smoker: false,
  sedentary: true,
  poorDiet: true,
  voiceTranscript: "",
  transcriptEn: "",
  symptomsList: [],
  durationDays: 3,
  vitals: { ...DEMO_PATIENT.vitals, height: 150 },
  riskScore: DEMO_PATIENT.riskScore,
  riskTier: DEMO_PATIENT.riskTier,
  factors: DEMO_PATIENT.factors,
  criticalFlags: { chestPain: false, speechDiff: false, alteredCon: false }
});

const INITIAL_PATIENTS = [
  { id: "BD-FAR-00847", name: "Rina Begum", age: 52, risk: "RED", score: 68.4, time: "3:45 PM", loc: "Faridpur Sadar", status: "Referred", sex: "Female", vitals: { systolic: 162, diastolic: 98, glucose: 9.4, spo2: 97, weight: 61, height: 150 } },
  { id: "BD-BHA-01024", name: "Salma Khatun", age: 45, risk: "AMBER", score: 47.8, time: "11:15 AM", loc: "Bhanga", status: "Pending", sex: "Female", vitals: { systolic: 135, diastolic: 85, glucose: 6.2, spo2: 98, weight: 55, height: 155 } },
  { id: "BD-BOA-00561", name: "Karim Hossain", age: 58, risk: "GREEN", score: 24.1, time: "9:30 AM", loc: "Boalmari", status: "Resolved", sex: "Male", vitals: { systolic: 120, diastolic: 80, glucose: 5.4, spo2: 99, weight: 65, height: 160 } },
];

const readPreference = (key, allowedValues, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return allowedValues.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

const writePreference = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Preferences are optional; the demo still works when storage is unavailable.
  }
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [mode, setMode] = useState(() => readPreference("demo_mode", ["CHW", "DASHBOARD"], "CHW"));
  
  const [eventNotification, setEventNotification] = useState(null);
  const [patients, setPatients] = useState(() => INITIAL_PATIENTS.map((patient) => ({ ...patient })));
  const [currentDraft, setCurrentDraft] = useState(createInitialDraft);
  const [demoResetVersion, setDemoResetVersion] = useState(0);

  useEffect(() => {
    writePreference("demo_mode", mode);
  }, [mode]);

  useEffect(() => {
    if (!eventNotification) return undefined;
    const timer = setTimeout(() => setEventNotification(null), 6000);
    return () => clearTimeout(timer);
  }, [eventNotification]);

  const triggerDashboardNotification = (patient) => {
    setEventNotification(patient);
  };

  const resetDemo = () => {
    setPatients(INITIAL_PATIENTS.map((patient) => ({ ...patient })));
    setCurrentDraft(createInitialDraft());
    setEventNotification(null);
    setDemoResetVersion((version) => version + 1);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-ink-dark flex flex-col relative overflow-x-hidden selection:bg-primary-teal selection:text-white">
      {/* Mode Selector Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center px-4 sm:px-6 py-4 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/95">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-teal to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-teal-100">
            <HeartPulse size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-navy-dark leading-tight">ShasthoBondhu AI</h1>
            <p className="text-[10px] font-medium tracking-wide text-primary-teal uppercase">IEEE ICADHI 2026 Showcase</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#F1F5F9] p-1 rounded-full border border-gray-200 shadow-inner">
            <button
              onClick={() => setMode("CHW")}
              className={`px-3 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center space-x-1.5 ${mode === "CHW" ? "bg-primary-teal text-white shadow-md" : "text-gray-600 hover:text-primary-teal"}`}
            >
              <span>CHW Simulator</span>
            </button>
            <button
              onClick={() => setMode("DASHBOARD")}
              className={`px-3 sm:px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center space-x-1.5 ${mode === "DASHBOARD" ? "bg-primary-teal text-white shadow-md" : "text-gray-600 hover:text-primary-teal"}`}
            >
              <span>District Dashboard</span>
            </button>
          </div>
          <button
            type="button"
            onClick={resetDemo}
            className="rounded-full border border-gray-200 bg-white px-3 py-2 text-[10px] font-bold text-gray-500 hover:border-gray-300 hover:text-navy-dark"
          >
            Reset demo
          </button>
        </div>
      </div>

      {/* Event Notification Banner */}
      {eventNotification && mode === "DASHBOARD" && (
        <div className="fixed top-20 right-6 z-50 max-w-sm bg-white border-l-4 border-risk-red rounded-xl shadow-2xl p-4 flex items-start space-x-3 slide-in border border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-full bg-red-50 text-risk-red flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="animate-bounce" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-navy-dark">High-risk demo record added</h4>
            <p className="text-xs text-gray-500 mt-1">Synthetic referral: <span className="font-semibold">{eventNotification.name}</span> ({eventNotification.age}y, {eventNotification.loc})</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#faeee9] text-[#7e2a18]">Risk: {eventNotification.score.toFixed(1)}</span>
              <span className="text-[10px] font-mono text-gray-400">{eventNotification.id}</span>
            </div>
          </div>
          <button onClick={() => setEventNotification(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 p-3 sm:p-6 flex justify-center items-start overflow-x-auto">
        {mode === "CHW" ? (
          <CHWApp 
            key={demoResetVersion}
            patients={patients} 
            setPatients={setPatients} 
            currentDraft={currentDraft} 
            setCurrentDraft={setCurrentDraft} 
            triggerDashboardNotification={triggerDashboardNotification}
          />
        ) : (
          <DashboardApp patients={patients} />
        )}
      </div>
    </div>
  );
}

function BrandingFooter() {
  return (
    <div className="text-center mt-6 text-gray-400 text-xs tracking-wide">
      Team DIUxDIU · Dhaka International University × Daffodil International University · IEEE ICADHI 2026
    </div>
  );
}

function BackButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={onClick}
      className={`text-navy-dark hover:text-primary-teal ${className}`}
    >
      <ChevronLeft size={24} />
    </button>
  );
}

// Custom X Icon if lucide is missing it
function X({ size = 16, className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

// Custom HeartPulse Icon
function HeartPulse({ size = 20, className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
      <path d="M3.22 12H7.5l2-5 3 10 1.5-7 1.5 4h4.3"></path>
    </svg>
  );
}

// ==========================================
// CHW APP SIMULATOR (MOBILE CASING)
// ==========================================

function CHWApp({ patients, setPatients, currentDraft, setCurrentDraft, triggerDashboardNotification }) {
  const [currentScreen, setCurrentScreen] = useState('home');

  const navigate = (screen) => setCurrentScreen(screen);

  return (
    <div className="flex flex-col items-center w-full fade-in">
      {/* Mobile Device Shell */}
      <div className="w-full max-w-[390px] h-[844px] bg-white border-[10px] border-ink-dark rounded-[3.2rem] overflow-hidden shadow-2xl relative flex flex-col transform hover:scale-[1.005] transition-transform duration-300">
        
        {/* Notch / Speaker */}
        <div className="absolute top-0 inset-x-0 h-7 bg-ink-dark rounded-b-3xl w-44 mx-auto z-50 flex items-center justify-center space-x-2">
          <div className="w-16 h-1 bg-gray-700 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-gray-800 rounded-full border border-gray-900"></div>
        </div>

        {/* Battery & Network Status Bar */}
        <div className="bg-white px-6 pt-7 pb-2 flex justify-between items-center text-[10px] font-bold text-gray-500 select-none">
          <span>9:41 AM</span>
          <div className="flex items-center space-x-1.5">
            <span className="bg-primary-teal/15 text-primary-teal text-[9px] px-1 rounded font-extrabold tracking-wide uppercase">Local demo state</span>
            <span>📶</span>
            <span>🔋 85%</span>
          </div>
        </div>
        
        {/* Dynamic Screen Output */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col bg-gray-50">
          {currentScreen === 'home' && (
            <ScreenHome 
              navigate={navigate} 
              patients={patients} 
            />
          )}
          {currentScreen === 'register' && (
            <ScreenRegister 
              navigate={navigate} 
              currentDraft={currentDraft} 
              setCurrentDraft={setCurrentDraft} 
            />
          )}
          {currentScreen === 'voice' && (
            <ScreenVoice 
              navigate={navigate} 
              currentDraft={currentDraft} 
              setCurrentDraft={setCurrentDraft}
            />
          )}
          {currentScreen === 'vitals' && (
            <ScreenVitals 
              navigate={navigate} 
              currentDraft={currentDraft} 
              setCurrentDraft={setCurrentDraft} 
            />
          )}
          {currentScreen === 'result' && (
            <ScreenResult 
              navigate={navigate} 
              currentDraft={currentDraft} 
            />
          )}
          {currentScreen === 'guidance' && (
            <ScreenGuidance 
              navigate={navigate}
              currentDraft={currentDraft}
            />
          )}
          {currentScreen === 'referral' && (
            <ScreenReferral 
              navigate={navigate} 
              currentDraft={currentDraft} 
              setCurrentDraft={setCurrentDraft}
              setPatients={setPatients} 
              triggerDashboardNotification={triggerDashboardNotification}
            />
          )}
          {currentScreen === 'success' && (
            <ScreenSuccess 
              navigate={navigate} 
              currentDraft={currentDraft}
              setCurrentDraft={setCurrentDraft}
            />
          )}
        </div>

        {/* Safe Home Indicator Bar */}
        <div className="bg-gray-50 py-3 flex justify-center items-center">
          <div className="w-32 h-1 bg-ink-dark/40 rounded-full"></div>
        </div>
      </div>
      <BrandingFooter />
    </div>
  );
}

// ==========================================
// CHW SCREENS IMPLEMENTATION
// ==========================================

function ScreenHome({ navigate, patients }) {
  const todayPatients = patients.length;
  const highRisk = patients.filter(p => p.risk === 'RED' || p.risk === 'CRITICAL').length;
  const referrals = patients.filter(p => p.status === 'Referred').length;

  return (
    <div className="flex flex-col h-full bg-gray-50 fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-b from-primary-teal to-[#0b6652] pt-8 pb-10 px-5 text-white rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-bold">Good afternoon, Fatema Akter 👋</h1>
            <p className="text-teal-100 text-xs font-medium mt-0.5">Community Health Worker • Faridpur Sadar</p>
            <p className="text-[10px] text-teal-200 mt-1 bg-black/10 inline-block px-2 py-0.5 rounded-full">Synthetic field workflow preview</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Users size={16} />
          </div>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="px-4 py-4 flex-1 relative -mt-6">
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100/80 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black text-primary-teal">{todayPatients}</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight mt-1">Screened Today</span>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100/80 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black text-risk-red">{highRisk}</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight mt-1">High Risk</span>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100/80 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black text-risk-amber">{referrals}</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight mt-1">Referrals</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex justify-between items-center mb-3.5 px-1">
          <h2 className="text-sm font-bold text-navy-dark uppercase tracking-wider">Field Patient Log</h2>
          <span className="text-primary-teal text-xs font-semibold hover:underline cursor-pointer">Registry</span>
        </div>

        {/* Scrollable Patient List */}
        <div className="space-y-2.5 overflow-y-auto max-h-[400px] no-scrollbar">
          {patients.map((p, i) => (
            <div key={i} className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-gray-200 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  p.risk === 'CRITICAL' || p.risk === 'RED' ? 'bg-red-50 text-risk-red' :
                  p.risk === 'AMBER' ? 'bg-amber-50 text-risk-amber' : 'bg-teal-50 text-primary-teal'
                }`}>
                  {p.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-navy-dark">{p.name}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">{p.age}y • {p.loc} • {p.time}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                  p.risk === 'CRITICAL' ? 'bg-red-950 text-red-200 border border-red-900' :
                  p.risk === 'RED' ? 'bg-[#faeee9] text-[#7e2a18] border border-red-100' :
                  p.risk === 'AMBER' ? 'bg-[#fdf3dd] text-[#7a4e00] border border-amber-100' :
                  'bg-[#d1f5ea] text-[#0a5e42] border border-teal-100'
                }`}>
                  {p.risk}
                </span>
                <span className="text-[10px] font-bold text-gray-500 mt-1">Score: {p.score.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Button */}
        <button 
          onClick={() => navigate('register')}
          aria-label="Start a new synthetic patient screen"
          className="absolute bottom-4 right-2 w-12 h-12 bg-primary-teal text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-700/35 hover:bg-teal-700 transition-all z-10 hover:scale-105 active:scale-95"
        >
          <span className="text-2xl font-light mb-1">+</span>
        </button>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-100 px-6 py-3.5 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-center text-primary-teal cursor-pointer">
          <Home size={18} />
          <span className="text-[9px] font-bold mt-1">Home</span>
        </div>
        <button type="button" onClick={() => navigate('register')} className="flex flex-col items-center text-gray-400 hover:text-primary-teal">
          <UserPlus size={18} />
          <span className="text-[9px] font-bold mt-1">New</span>
        </button>
        <div className="flex flex-col items-center text-gray-400 hover:text-primary-teal cursor-pointer relative">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-risk-red rounded-full"></span>
          <span className="text-[9px] font-bold mt-1">Alerts</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 hover:text-primary-teal cursor-pointer">
          <Users size={18} />
          <span className="text-[9px] font-bold mt-1">Profile</span>
        </div>
      </div>
    </div>
  );
}

function ScreenRegister({ navigate, currentDraft, setCurrentDraft }) {
  const [formError, setFormError] = useState("");
  const handleChange = (e) => setCurrentDraft({ ...currentDraft, [e.target.name]: e.target.value });

  const loadPreset = (preset) => {
    const sys = preset.systolic || 120;
    const glu = preset.glucose || 5.5;
    const spo2 = preset.spo2 || 98;
    const weight = preset.weight || 60;
    const height = preset.height || 160;
    const age = preset.age || 30;

    const presetDraft = {
      ...currentDraft,
      id: createCaseId(preset.upazila),
      name: preset.name.split(' (')[0],
      age: age,
      sex: preset.sex,
      village: preset.upazila === "Faridpur Sadar" ? "Faridpur Sadar, Faridpur" : `${preset.upazila}, Faridpur`,
      phone: "01712-345678",
      nid: "8472910384",
      upazila: preset.upazila || "Faridpur Sadar",
      hasFamilyHistory: preset.hasFamilyHistory,
      smoker: preset.smoker,
      sedentary: preset.sedentary,
      poorDiet: preset.poorDiet,
      voiceTranscript: preset.textBn,
      transcriptEn: preset.textEn,
      symptomsList: preset.symptoms,
      durationDays: preset.duration,
      vitals: { 
        systolic: sys, 
        diastolic: preset.diastolic || 80, 
        glucose: glu, 
        spo2: spo2, 
        weight: weight, 
        height: height 
      },
      criticalFlags: {
        chestPain: preset.criticalOverride || false,
        speechDiff: false,
        alteredCon: false
      }
    };
    const validation = validateVitals(presetDraft);
    const result = calculateRisk(presetDraft, validation.values);

    setCurrentDraft({ ...presetDraft, ...result });
    setFormError("");

    navigate('voice');
  };

  const handleContinue = () => {
    const name = currentDraft.name.trim();
    const age = Number(currentDraft.age);

    if (!name) {
      setFormError("Patient name is required for the demo workflow.");
      return;
    }
    if (!Number.isFinite(age) || age < 18 || age > 120) {
      setFormError("Enter an age between 18 and 120.");
      return;
    }

    setCurrentDraft((draft) => ({
      ...draft,
      name,
      age,
      id: draft.id || createCaseId(draft.upazila),
    }));
    setFormError("");
    navigate('voice');
  };

  return (
    <div className="flex flex-col h-full bg-white fade-in relative">
      {/* Header */}
      <div className="pt-6 pb-3 px-5 flex items-center border-b border-gray-100 justify-between">
        <div className="flex items-center">
          <BackButton onClick={() => navigate('home')} className="mr-3" />
          <h1 className="text-md font-bold text-navy-dark">Patient Registration</h1>
        </div>
        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Screen 2/8</span>
      </div>
      
      {/* Body */}
      <div className="flex-1 px-5 py-4 overflow-y-auto pb-24 space-y-4">
        
        {/* Load worked preset warning */}
        <div className="bg-[#eff6ff] border border-blue-100 p-3 rounded-2xl">
          <span className="text-[10px] font-black text-blue-600 uppercase flex items-center"><Star size={11} className="mr-1 text-blue-500 fill-blue-500" /> IEEE Showcase Quick Presets</span>
          <p className="text-[10px] text-blue-700 mt-1 leading-normal">Load a predefined patient profile from the IEEE technical paper to test clinical calculations:</p>
          
          <div className="mt-2.5 space-y-1.5">
            {VOICE_PRESETS.map((vp) => (
              <button 
                key={vp.id}
                onClick={() => loadPreset({...vp, upazila: vp.id === "rina" ? "Faridpur Sadar" : vp.id === "kashem" ? "Bhanga" : "Boalmari"})}
                className="w-full bg-white border border-blue-200 text-left px-3 py-2 rounded-xl text-xs font-bold text-[#1e40af] hover:bg-blue-50 transition-colors flex justify-between items-center"
              >
                <span>{vp.name}</span>
                <span className="text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase">Load</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Full Name</label>
              <input type="text" name="name" value={currentDraft.name} onChange={handleChange} placeholder="Rina Begum" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-dark font-medium focus:outline-none focus:border-primary-teal focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Upazila (Jurisdiction)</label>
              <select name="upazila" value={currentDraft.upazila} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2.5 text-xs text-navy-dark font-medium focus:outline-none focus:border-primary-teal focus:bg-white transition-all">
                <option value="Faridpur Sadar">Faridpur Sadar</option>
                <option value="Bhanga">Bhanga</option>
                <option value="Boalmari">Boalmari</option>
                <option value="Alfadanga">Alfadanga</option>
                <option value="Charbhadrasan">Charbhadrasan</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Age</label>
              <input type="number" name="age" min="18" max="120" value={currentDraft.age} onChange={handleChange} placeholder="52" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-dark font-medium focus:outline-none focus:border-primary-teal focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sex</label>
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-0.5 flex">
                <button onClick={() => setCurrentDraft({...currentDraft, sex: 'Male'})} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${currentDraft.sex === 'Male' ? 'bg-white shadow text-primary-teal' : 'text-gray-400 hover:text-gray-600'}`}>M</button>
                <button onClick={() => setCurrentDraft({...currentDraft, sex: 'Female'})} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${currentDraft.sex === 'Female' ? 'bg-white shadow text-primary-teal' : 'text-gray-400 hover:text-gray-600'}`}>F</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">NID (National ID)</label>
              <input type="text" name="nid" value={currentDraft.nid} onChange={handleChange} placeholder="e.g. 8472910384" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-dark font-medium focus:outline-none focus:border-primary-teal focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Phone</label>
              <input type="text" name="phone" value={currentDraft.phone} onChange={handleChange} placeholder="e.g. 01712-345678" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-dark font-medium focus:outline-none focus:border-primary-teal focus:bg-white transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Village / Union</label>
            <input type="text" name="village" value={currentDraft.village} onChange={handleChange} placeholder="Faridpur Sadar, Faridpur" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-dark font-medium focus:outline-none focus:border-primary-teal focus:bg-white transition-all" />
          </div>

          <div className="border-t border-gray-100 pt-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Clinical Pre-Conditions</h4>
            <div className="bg-gray-50 p-3 rounded-2xl space-y-2 border border-gray-100">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-gray-600 font-medium">Family History of Diabetes/BP</span>
                <input 
                  type="checkbox" 
                  checked={currentDraft.hasFamilyHistory} 
                  onChange={(e) => setCurrentDraft({...currentDraft, hasFamilyHistory: e.target.checked})}
                  className="rounded text-primary-teal focus:ring-primary-teal w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Button footer */}
      <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100 pb-7">
        {formError && <p role="alert" className="mb-2 text-center text-[10px] font-bold text-risk-red">{formError}</p>}
        <button 
          onClick={handleContinue}
          className="w-full bg-primary-teal text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center hover:bg-teal-700 transition-colors shadow-md hover:scale-[1.01] active:scale-95"
        >
          Continue to Voice Input <ChevronRight size={14} className="ml-1" />
        </button>
      </div>
    </div>
  );
}

function ScreenVoice({ navigate, currentDraft, setCurrentDraft }) {
  const [state, setState] = useState(currentDraft.voiceTranscript ? 'done' : 'idle'); // idle | recording | done
  const showNLPDebugger = true;
  const [isSyncingNLP, setIsSyncingNLP] = useState(false);

  const handleStartRecording = () => {
    setState('recording');
    setTimeout(() => {
      // Simulate Whisper transcription if nothing is loaded
      if (!currentDraft.voiceTranscript) {
        setCurrentDraft((draft) => ({
          ...draft,
          voiceTranscript: "বুক ধড়ফড় করছে, মাথা ঘোরাচ্ছে, তিন দিন ধরে।",
          transcriptEn: "Heart is pounding, feeling dizzy, for three days.",
          symptomsList: ["Chest palpitation 🫀", "Dizziness 💫", "Duration: 3 days ⏱️"],
          durationDays: 3
        }));
      }
      setState('done');
    }, 2500);
  };

  const handleCustomVoiceInput = (text) => {
    setIsSyncingNLP(true);
    setTimeout(() => {
      let textBn = text;
      let textEn = "Custom symptom statement.";
      let duration = 1;
      let symptoms = [];

      // Simple keyword matching for interactive demonstration
      if (text.includes("বুক") || text.includes("ধড়ফড়")) {
        symptoms.push("Chest palpitation 🫀");
        textEn = "Chest is palpitating, feeling discomfort.";
      }
      if (text.includes("মাথা") || text.includes("ঘোর")) {
        symptoms.push("Dizziness 💫");
        if (symptoms.length > 1) {
          textEn = "Chest is pounding and feeling dizzy.";
        } else {
          textEn = "Feeling dizzy.";
        }
      }
      if (text.includes("ক্লান্ত") || text.includes("দুর্বল")) {
        symptoms.push("Fatigue 💤");
        textEn = "Feeling very fatigued and weak.";
      }
      if (text.includes("ঝাপসা")) {
        symptoms.push("Blurred vision 👁️");
        textEn = "Vision is occasionally blurred.";
      }
      if (text.includes("ব্যথা") && (text.includes("হাত") || text.includes("বাম"))) {
        symptoms.push("Severe chest pain 🚨");
        symptoms.push("Left-arm radiation ⚡");
        textEn = "Severe chest pain radiating to the left arm.";
      }

      // Extract duration
      if (text.includes("তিন")) duration = 3;
      else if (text.includes("পাঁচ")) duration = 5;
      else if (text.includes("সাত") || text.includes("এক সপ্তাহ")) duration = 7;
      else if (text.includes("দুই") || text.includes("দু দিন")) duration = 2;

      symptoms.push(`Duration: ${duration} days ⏱️`);

      setCurrentDraft({
        ...currentDraft,
        voiceTranscript: textBn,
        transcriptEn: textEn,
        symptomsList: symptoms,
        durationDays: duration
      });
      setIsSyncingNLP(false);
      setState('done');
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-white fade-in relative">
      {/* Header */}
      <div className="pt-6 pb-3 px-5 flex items-center border-b border-gray-100 justify-between">
        <div className="flex items-center">
          <BackButton onClick={() => navigate('register')} className="mr-3" />
          <h1 className="text-md font-bold text-navy-dark">Voice Symptom Entry</h1>
        </div>
        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Screen 3/8</span>
      </div>

      {/* Body */}
      <div className="flex-1 p-5 overflow-y-auto pb-28 space-y-4">
        <div className="text-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Patient: {currentDraft.name || "Unnamed"}</span>
        </div>

        {/* Large Microphone Record Circle */}
        <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-3xl border border-gray-100 relative">
          
          <div className="relative mb-6 flex justify-center items-center h-28 w-28">
            {state === 'recording' && (
              <div className="absolute inset-0 bg-risk-red rounded-full pulse-ring"></div>
            )}
            <button 
              onClick={handleStartRecording}
              disabled={state === 'done'}
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 ${
                state === 'idle' ? 'bg-primary-teal text-white hover:bg-teal-700' :
                state === 'recording' ? 'bg-risk-red text-white' :
                'bg-gray-200 text-gray-400'
              }`}
            >
              {state === 'recording' ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
          </div>

          {state === 'idle' && (
            <p className="text-xs font-bold text-gray-500">Tap to run the synthetic transcription demo</p>
          )}

          {state === 'recording' && (
            <div className="flex flex-col items-center">
              <p className="text-xs font-bold text-risk-red animate-pulse">Simulating transcription...</p>
              <div className="flex items-center space-x-1.5 h-6 mt-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 bg-risk-red rounded-full wave-bar" style={{height: '6px'}}></div>
                ))}
              </div>
            </div>
          )}

          {state === 'done' && (
            <div className="w-full px-5 text-center">
              <span className="text-[10px] font-black text-primary-teal uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-100">Synthetic transcript ready</span>
              
              <div className="bg-white p-3 rounded-2xl border border-gray-100 w-full mt-3 shadow-sm">
                <p className="text-xs font-bold text-navy-dark leading-relaxed">"{currentDraft.voiceTranscript}"</p>
                <p className="text-[10px] text-gray-400 italic mt-1">{currentDraft.transcriptEn}</p>
              </div>

              {/* Symptom Entity Chips */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {currentDraft.symptomsList.map((sym, i) => (
                  <div key={i} className="bg-teal-50/50 text-primary-teal border border-teal-100 px-2.5 py-1 rounded-full text-[10px] font-bold scale-in">
                    {sym}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Custom Speech Typing for full interactivity */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Test Custom Bangla Input</label>
          <div className="flex space-x-1.5">
            <input 
              type="text" 
              placeholder="e.g. শরীর খুব দুর্বল লাগছে, তিন দিন ধরে।" 
              id="customSpeech"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-teal"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleCustomVoiceInput(e.target.value);
                  e.target.value = "";
                }
              }}
            />
            <button 
              onClick={() => {
                const el = document.getElementById("customSpeech");
                if (el && el.value.trim()) {
                  handleCustomVoiceInput(el.value);
                  el.value = "";
                }
              }}
              className="bg-primary-teal text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors"
            >
              Analyze
            </button>
          </div>
        </div>

        {/* Transparent demonstration parser output */}
        {state === 'done' && showNLPDebugger && (
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-inner text-[10px] font-mono leading-relaxed border border-slate-800 scale-in relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-teal-500 text-slate-900 font-bold px-2 py-0.5 rounded-bl uppercase text-[8px] tracking-wide">Demo parser output</div>
            <p className="text-teal-400 font-bold mb-2">Rule-based keyword extraction:</p>
            
            {isSyncingNLP ? (
              <div className="flex items-center space-x-2 text-gray-400 py-4 justify-center">
                <Loader2 className="animate-spin" size={14} />
                <span>Running parser...</span>
              </div>
            ) : (
              <pre className="overflow-x-auto text-slate-300">
{JSON.stringify({
	  implementation: "LOCAL_KEYWORD_DEMO",
	  clinically_validated: false,
  parsed_entities: currentDraft.symptomsList.map(s => {
    const term = s.split(' ')[0];
    return {
      text: term,
      label: term.includes("day") ? "DURATION" : "SYMPTOM",
      onset_days: currentDraft.durationDays
    };
  }),
  cardiac_warning_flag: currentDraft.voiceTranscript.includes("বুক") || currentDraft.voiceTranscript.includes("ব্যথা")
}, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Button footer */}
      {state === 'done' && (
        <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100 pb-7">
          <button 
            onClick={() => navigate('vitals')}
            className="w-full bg-primary-teal text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center hover:bg-teal-700 transition-colors shadow-md hover:scale-[1.01] active:scale-95"
          >
            Continue to Vitals <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}

function ScreenVitals({ navigate, currentDraft, setCurrentDraft }) {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleVitalChange = (e) => {
    setCurrentDraft({
      ...currentDraft,
      vitals: { ...currentDraft.vitals, [e.target.name]: e.target.value }
    });
  };

  const handleAnalyze = () => {
    const validation = validateVitals(currentDraft);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors({});
    setLoading(true);
    
    setTimeout(() => {
      const result = calculateRisk(currentDraft, validation.values);

      setCurrentDraft({
        ...currentDraft,
        age: validation.values.age,
        vitals: {
          systolic: validation.values.systolic,
          diastolic: validation.values.diastolic,
          glucose: validation.values.glucose,
          spo2: validation.values.spo2,
          weight: validation.values.weight,
          height: validation.values.height,
        },
        ...result,
      });
      setLoading(false);
      navigate('result');
    }, 1200);
  };

  const sys = parseFloat(currentDraft.vitals.systolic) || 0;
  const dia = parseFloat(currentDraft.vitals.diastolic) || 0;
  const glu = parseFloat(currentDraft.vitals.glucose) || 0;
  const spo2 = parseFloat(currentDraft.vitals.spo2) || 100;
  const weight = parseFloat(currentDraft.vitals.weight) || 0;
  const height = parseFloat(currentDraft.vitals.height) || 0;

  const bmi = weight && height ? (weight / ((height/100) * (height/100))).toFixed(1) : null;

  const sysWarn = sys >= 140 || dia >= 90;
  const gluWarn = glu > 7.8;
  const spo2Crit = spo2 < 90;

  return (
    <div className="flex flex-col h-full bg-gray-50 fade-in relative">
      {/* Header */}
      <div className="pt-6 pb-3 px-5 flex items-center border-b border-gray-200 bg-white shadow-sm justify-between">
        <div className="flex items-center">
          <BackButton onClick={() => navigate('voice')} className="mr-3" />
          <h1 className="text-md font-bold text-navy-dark">Vital Sign Entry</h1>
        </div>
        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Screen 4/8</span>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 overflow-y-auto pb-24 space-y-3.5">
        {Object.keys(validationErrors).length > 0 && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-3 text-[10px] font-bold text-red-800">
            Check the highlighted measurements before calculating: {Object.values(validationErrors).join(" ")}
          </div>
        )}
        
        {/* BP */}
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border-l-4 border-l-risk-red border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3 text-risk-red">
                <Heart size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-dark">Blood Pressure</p>
                <p className="text-[9px] text-gray-400">Normal: &lt;120/80 mmHg</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <input type="number" name="systolic" min="60" max="260" value={currentDraft.vitals.systolic} onChange={handleVitalChange} placeholder="120" className={`w-12 bg-gray-50 border rounded-xl py-1.5 text-center font-bold text-navy-dark text-sm focus:outline-none focus:border-risk-red focus:bg-white ${validationErrors.systolic ? "border-risk-red" : "border-gray-200"}`} />
              <span className="text-gray-400 text-sm">/</span>
              <input type="number" name="diastolic" min="30" max="160" value={currentDraft.vitals.diastolic} onChange={handleVitalChange} placeholder="80" className={`w-12 bg-gray-50 border rounded-xl py-1.5 text-center font-bold text-navy-dark text-sm focus:outline-none focus:border-risk-red focus:bg-white ${validationErrors.diastolic ? "border-risk-red" : "border-gray-200"}`} />
            </div>
          </div>
          {sysWarn && <p className="text-[9px] text-risk-red font-bold flex items-center mt-2 ml-11"><AlertTriangle size={10} className="mr-1"/> Stage 1/2 Hypertension Detected.</p>}
        </div>

        {/* Glucose */}
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border-l-4 border-l-risk-amber border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mr-3 text-risk-amber">
                <Droplets size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-dark">Fasting Blood Glucose</p>
                <p className="text-[9px] text-gray-400">Normal: &lt;5.6 mmol/L</p>
              </div>
            </div>
            <input type="number" name="glucose" min="1" max="40" step="0.1" value={currentDraft.vitals.glucose} onChange={handleVitalChange} placeholder="5.5" className={`w-16 bg-gray-50 border rounded-xl py-1.5 text-center font-bold text-navy-dark text-sm focus:outline-none focus:border-risk-amber focus:bg-white ${validationErrors.glucose ? "border-risk-red" : "border-gray-200"}`} />
          </div>
          {gluWarn && <p className="text-[9px] text-risk-amber font-bold flex items-center mt-2 ml-11"><AlertTriangle size={10} className="mr-1"/> Hyperglycaemia (Pre-Diabetic/Diabetic).</p>}
        </div>

        {/* SpO2 */}
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border-l-4 border-l-teal-500 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center mr-3 text-teal-500">
                <Wind size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-dark">Oxygen Saturation (SpO₂)</p>
                <p className="text-[9px] text-gray-400">Normal: 95-100%</p>
              </div>
            </div>
            <input type="number" name="spo2" min="50" max="100" value={currentDraft.vitals.spo2} onChange={handleVitalChange} placeholder="98" className={`w-16 bg-gray-50 border rounded-xl py-1.5 text-center font-bold text-navy-dark text-sm focus:outline-none focus:border-teal-500 focus:bg-white ${validationErrors.spo2 ? "border-risk-red" : "border-gray-200"}`} />
          </div>
          {spo2Crit && <p className="text-[9px] text-risk-red font-black flex items-center mt-2 ml-11"><AlertTriangle size={10} className="mr-1 animate-bounce"/> CRITICAL: SpO₂ &lt; 90% (Hypoxia Alert)</p>}
        </div>

        {/* Weight, Height, BMI */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Weight (kg)</label>
              <input type="number" name="weight" min="20" max="300" value={currentDraft.vitals.weight} onChange={handleVitalChange} placeholder="61" className={`w-full bg-gray-50 border rounded-xl py-1.5 text-center font-bold text-navy-dark text-xs focus:outline-none ${validationErrors.weight ? "border-risk-red" : "border-gray-200"}`} />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Height (cm)</label>
              <input type="number" name="height" min="100" max="250" value={currentDraft.vitals.height} onChange={handleVitalChange} placeholder="150" className={`w-full bg-gray-50 border rounded-xl py-1.5 text-center font-bold text-navy-dark text-xs focus:outline-none ${validationErrors.height ? "border-risk-red" : "border-gray-200"}`} />
            </div>
          </div>
          {bmi && (
            <div className="flex justify-between items-center bg-[#F8FAFC] px-3 py-2 rounded-xl border border-gray-100 mt-2">
              <span className="text-[10px] font-bold text-gray-500">Computed BMI:</span>
              <span className={`text-[10px] font-black uppercase ${parseFloat(bmi) >= 30 ? 'text-risk-red' : parseFloat(bmi) >= 25 ? 'text-risk-amber' : 'text-primary-teal'}`}>
                {bmi} ({parseFloat(bmi) >= 30 ? 'Obese' : parseFloat(bmi) >= 25 ? 'Overweight' : 'Normal'})
              </span>
            </div>
          )}
        </div>

        {/* Lifestyle Choices */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Lifestyle Assessment Factors</h4>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-gray-600 font-medium">Tobacco / Smoking Use</span>
              <input 
                type="checkbox" 
                checked={currentDraft.smoker} 
                onChange={(e) => setCurrentDraft({...currentDraft, smoker: e.target.checked})}
                className="rounded text-primary-teal focus:ring-primary-teal w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-gray-600 font-medium">Sedentary Lifestyle (No exercise)</span>
              <input 
                type="checkbox" 
                checked={currentDraft.sedentary} 
                onChange={(e) => setCurrentDraft({...currentDraft, sedentary: e.target.checked})}
                className="rounded text-primary-teal focus:ring-primary-teal w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-gray-600 font-medium">Poor Diet (High salt/sugar/oil)</span>
              <input 
                type="checkbox" 
                checked={currentDraft.poorDiet} 
                onChange={(e) => setCurrentDraft({...currentDraft, poorDiet: e.target.checked})}
                className="rounded text-primary-teal focus:ring-primary-teal w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Critical Overrides checklist */}
        <div className="bg-[#fff1f2] border border-red-100 p-3.5 rounded-2xl">
          <span className="text-[10px] font-black text-risk-red uppercase flex items-center"><ShieldAlert size={12} className="mr-1" /> Clinical Emergency Overrides</span>
          <p className="text-[9px] text-red-700 mt-1 mb-2 leading-normal">For the simulation, these selections override the score. A real workflow requires an approved clinical protocol.</p>
          
          <div className="space-y-1.5">
            <label className="flex items-center space-x-2 text-xs text-red-950 font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={currentDraft.criticalFlags.chestPain}
                onChange={(e) => setCurrentDraft({
                  ...currentDraft,
                  criticalFlags: { ...currentDraft.criticalFlags, chestPain: e.target.checked }
                })}
                className="rounded text-risk-red focus:ring-risk-red w-3.5 h-3.5"
              />
              <span>Severe chest pain with left-arm radiation</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-red-950 font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={currentDraft.criticalFlags.speechDiff}
                onChange={(e) => setCurrentDraft({
                  ...currentDraft,
                  criticalFlags: { ...currentDraft.criticalFlags, speechDiff: e.target.checked }
                })}
                className="rounded text-risk-red focus:ring-risk-red w-3.5 h-3.5"
              />
              <span>Sudden speech difficulty / Facial asymmetry</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-red-950 font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={currentDraft.criticalFlags.alteredCon}
                onChange={(e) => setCurrentDraft({
                  ...currentDraft,
                  criticalFlags: { ...currentDraft.criticalFlags, alteredCon: e.target.checked }
                })}
                className="rounded text-risk-red focus:ring-risk-red w-3.5 h-3.5"
              />
              <span>Altered consciousness / fainting</span>
            </label>
          </div>
        </div>

      </div>

      {/* Button footer */}
      <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100 pb-7">
        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-primary-teal text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center shadow-md hover:bg-teal-700 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <>Calculate Clinical Risk <ChevronRight size={14} className="ml-1" /></>}
        </button>
      </div>
    </div>
  );
}

function ScreenResult({ navigate, currentDraft }) {
  const [score, setScore] = useState(0);
  const targetScore = currentDraft.riskScore;

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const intervalTime = 16;
    const steps = duration / intervalTime;
    const increment = targetScore / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetScore) {
        setScore(targetScore);
        clearInterval(timer);
      } else {
        setScore(start);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [targetScore]);

  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getTierColor = (tier) => {
    if (tier === 'CRITICAL') return '#7e2a18';
    if (tier === 'RED') return '#C84B2F';
    if (tier === 'AMBER') return '#C47D0C';
    return '#0D7A62';
  };

  const getTriageActionBn = (tier) => {
    if (tier === 'CRITICAL') return "ডেমো জরুরি ফ্ল্যাগ: অনুমোদিত স্থানীয় জরুরি প্রোটোকল অনুসরণ করুন এবং চিকিৎসকের মূল্যায়নে বিলম্ব করবেন না।";
    if (tier === 'RED') return "ডেমো উচ্চ-ঝুঁকি ফ্ল্যাগ: অনুমোদিত স্থানীয় প্রোটোকল অনুযায়ী দ্রুত চিকিৎসক পর্যালোচনা প্রয়োজন।";
    if (tier === 'AMBER') return "ডেমো মাঝারি-ঝুঁকি ফ্ল্যাগ: চিকিৎসক-অনুমোদিত সময়সীমায় পুনর্মূল্যায়ন ও ফলো-আপ পরিকল্পনা করুন।";
    return "ডেমো কম-ঝুঁকি ফ্ল্যাগ: এটি রোগ বাদ দেয় না; উপসর্গ থাকলে চিকিৎসকের পরামর্শ নিন।";
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 fade-in relative">
      {/* Header */}
      <div className="pt-6 pb-3 px-5 text-center relative bg-white border-b border-gray-100 shadow-sm z-10">
        <BackButton onClick={() => navigate('vitals')} className="absolute left-5 top-6" />
        <h1 className="text-md font-bold text-navy-dark">Screening Results</h1>
        <p className="text-[10px] text-gray-400 mt-0.5">{currentDraft.name} • {currentDraft.id}</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        
        {/* Animated Radial Gauge */}
        <div className="bg-white pt-6 pb-5 px-5 flex flex-col items-center justify-center shadow-sm">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Background SVG Gauge */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="72" cy="72" r={radius}
                stroke="#F1F5F9" strokeWidth="10" fill="none"
              />
              <circle
                cx="72" cy="72" r={radius}
                stroke={getTierColor(currentDraft.riskTier)} 
                strokeWidth="10" fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 0.1s linear'
                }}
              />
            </svg>
            <div className="text-center flex flex-col items-center z-10">
              <span className="text-3xl font-black text-navy-dark">{score.toFixed(1)}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Demo index</span>
            </div>
          </div>

          <div className={`mt-4 px-4 py-1.5 rounded-full font-black text-xs flex items-center scale-in shadow-sm border ${
            currentDraft.riskTier === 'CRITICAL' ? 'bg-red-950 text-red-200 border-red-900' :
            currentDraft.riskTier === 'RED' ? 'bg-[#faeee9] text-[#7e2a18] border-red-100' : 
            currentDraft.riskTier === 'AMBER' ? 'bg-[#fdf3dd] text-[#7a4e00] border-amber-100' : 
            'bg-[#d1f5ea] text-[#0a5e42] border-teal-100'
          }`} style={{animationDelay: '1.2s'}}>
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-ping" style={{backgroundColor: getTierColor(currentDraft.riskTier)}}></span>
            {currentDraft.riskTier} RISK TIER
          </div>
        </div>

        {/* SHAP Contribution Force Plot Explanation */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Heuristic Factor Scores</h3>
            <span className="text-[9px] bg-slate-900 text-slate-100 font-mono px-1.5 py-0.5 rounded">Not clinically validated</span>
          </div>

          <div className="space-y-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <SHAPBar label="Diabetes (D)" value={currentDraft.factors.D} weight="30%" color="bg-primary-teal" />
            <SHAPBar label="Hypertension (H)" value={currentDraft.factors.H} weight="25%" color="bg-[#0D7A62]" />
            <SHAPBar label="Age & Demographic (A)" value={currentDraft.factors.A} weight="20%" color="bg-[#C47D0C]" />
            <SHAPBar label="Symptom Severity (S)" value={currentDraft.factors.S} weight="15%" color="bg-[#C84B2F]" />
            <SHAPBar label="Lifestyle Habits (L)" value={currentDraft.factors.L} weight="10%" color="bg-slate-500" />
            
            <div className="border-t border-gray-100 pt-2.5 mt-1 text-[9px] text-gray-400 leading-normal">
              These bars show hand-authored demonstration factors, not SHAP values or a trained ML model.
            </div>
          </div>
        </div>

        {/* Dynamic Warning Notification */}
        <div className="px-4 mb-4">
          <div className={`border-l-4 p-3.5 rounded-2xl shadow-sm flex items-start fade-in ${
            currentDraft.riskTier === 'CRITICAL' ? 'bg-red-950 border-red-500 text-red-200' : 
            currentDraft.riskTier === 'RED' ? 'bg-[#faeee9] border-[#C84B2F] text-[#7e2a18]' : 
            currentDraft.riskTier === 'AMBER' ? 'bg-[#fdf3dd] border-[#C47D0C] text-[#7a4e00]' : 
            'bg-[#d1f5ea] border-[#0D7A62] text-[#0a5e42]'
          }`}>
            <AlertTriangle className="mr-3 shrink-0 mt-0.5" size={16} />
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wide">Action Directive</h4>
              <p className="text-xs mt-1 font-semibold leading-relaxed font-bengali">
                {getTriageActionBn(currentDraft.riskTier)}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Button footer */}
      <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100 pb-7 shadow-lg z-10 flex space-x-2">
        <button 
          onClick={() => navigate('guidance')}
          className="flex-1 border-2 border-primary-teal text-primary-teal py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center hover:bg-teal-50/50 transition-colors"
        >
          View Demo Guidance
        </button>
        <button 
          onClick={() => navigate('referral')}
          className="flex-1 bg-primary-teal text-white py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center shadow-md hover:bg-teal-700 transition-colors"
        >
          {currentDraft.riskTier === 'RED' || currentDraft.riskTier === 'CRITICAL' ? "Referral Slip" : "Save Record"} <ChevronRight size={14} className="ml-1" />
        </button>
      </div>
    </div>
  );
}

function SHAPBar({ label, value, weight, color }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-bold text-navy-dark mb-1">
        <span>{label} <span className="text-gray-400 font-light">({weight} wt)</span></span>
        <span>{value.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%`, transition: 'width 1s ease-out' }}></div>
      </div>
    </div>
  );
}

const buildDemoGuidance = (draft) => {
  const warningByTier = {
    CRITICAL: "⚠️ সতর্কতা: ডেমোতে জরুরি ফ্ল্যাগ পাওয়া গেছে। স্থানীয় অনুমোদিত জরুরি প্রোটোকল অনুসরণ করুন এবং চিকিৎসকের মূল্যায়নে বিলম্ব করবেন না।",
    RED: "⚠️ সতর্কতা: ডেমোতে উচ্চ-ঝুঁকি ফ্ল্যাগ পাওয়া গেছে। স্থানীয় ক্লিনিক্যাল প্রোটোকল অনুযায়ী দ্রুত চিকিৎসক পর্যালোচনা প্রয়োজন।",
    AMBER: "⚠️ সতর্কতা: ডেমোতে মাঝারি-ঝুঁকি ফ্ল্যাগ পাওয়া গেছে। চিকিৎসক-অনুমোদিত সময়সীমায় পুনর্মূল্যায়ন করুন।",
    GREEN: "⚠️ সতর্কতা: কম ডেমো স্কোর কোনো রোগ বাদ দেয় না। নতুন, গুরুতর বা চলমান উপসর্গ থাকলে চিকিৎসকের পরামর্শ নিন।",
  };

  return [
    `${draft.name || "রোগী"}-এর প্রদর্শনী রেকর্ডে রক্তচাপ ${draft.vitals.systolic}/${draft.vitals.diastolic}, গ্লুকোজ ${draft.vitals.glucose} mmol/L এবং SpO₂ ${draft.vitals.spo2}%। এই সারাংশটি প্রশিক্ষণ ও UI প্রদর্শনের জন্য, রোগ নির্ণয়ের জন্য নয়।`,
    warningByTier[draft.riskTier] || warningByTier.GREEN,
    "🥗 সাধারণ পরামর্শ: খাদ্য ও জীবনযাত্রার যেকোনো পরিবর্তন রোগীর অবস্থা এবং স্থানীয় ক্লিনিক্যাল নির্দেশনা অনুযায়ী একজন যোগ্য চিকিৎসক পর্যালোচনা করবেন।",
    "💊 ওষুধ: এই ডেমো কোনো ওষুধ শুরু, বন্ধ বা পরিবর্তনের নির্দেশ দেয় না। ওষুধ-সংক্রান্ত সিদ্ধান্তের জন্য চিকিৎসকের পরামর্শ প্রয়োজন।",
  ];
};

function ScreenGuidance({ navigate, currentDraft }) {
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const paragraphs = buildDemoGuidance(currentDraft);
  const words = paragraphs[0] ? paragraphs[0].split(' ') : [];

  const handlePlayTTS = () => {
    if (playing) return;
    setPlaying(true);
    let index = 0;
    setActiveWordIndex(0);
    
    const interval = setInterval(() => {
      index++;
      if (index >= words.length) {
        clearInterval(interval);
        setPlaying(false);
        setActiveWordIndex(-1);
      } else {
        setActiveWordIndex(index);
      }
    }, 380); // Simulate spoken speed of word segments
  };

  return (
    <div className="flex flex-col h-full bg-white fade-in relative">
      {/* Header */}
      <div className="pt-6 pb-3 px-5 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <BackButton onClick={() => navigate('result')} className="mr-3" />
          <h1 className="text-md font-bold text-navy-dark">Clinical Guidance</h1>
        </div>
        <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-2 py-0.5 rounded border border-purple-200 uppercase">Rule-based demo</span>
      </div>

      {/* Body */}
      <div className="flex-1 p-5 overflow-y-auto pb-24 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-primary-teal">
            <Loader2 className="animate-spin mb-3" size={24} />
            <p className="text-xs font-bold text-gray-400">Preparing synthetic guidance...</p>
          </div>
        ) : (
          <div className="space-y-4 fade-in">
            
            {/* Audio Wave/TTS Control Card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center ${playing ? 'animate-bounce' : ''}`}>
                  <Volume2 size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-purple-900 uppercase">Readback animation</h4>
                  <p className="text-[9px] text-purple-600">Visual simulation only; no audio is generated</p>
                </div>
              </div>
              <button 
                onClick={handlePlayTTS}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold text-white flex items-center space-x-1 transition-all ${
                  playing ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105 shadow-md shadow-purple-200'
                }`}
                disabled={playing}
              >
                <Play size={10} fill="white" />
                <span>{playing ? 'Simulating...' : 'Simulate'}</span>
              </button>
            </div>

            {/* Word level highlighting block */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 shadow-inner">
              <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Demo screening summary</span>
              <p className="text-sm font-semibold text-navy-dark leading-relaxed font-bengali flex flex-wrap gap-x-1 gap-y-1">
                {words.map((word, idx) => (
                  <span 
                    key={idx} 
                    className={`px-0.5 rounded transition-all duration-200 ${
                      idx === activeWordIndex ? 'bg-yellow-300 text-black font-extrabold scale-105 shadow-sm' : ''
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </p>
            </div>

            {/* Structured Guidelines */}
            {paragraphs.slice(1).map((para, i) => {
              const type = para.includes("⚠️") ? "WARNING" : para.includes("🥗") ? "DIET" : "MEDICATION";
              const colors = {
                WARNING: "bg-red-50 border-red-200 text-red-950",
                DIET: "bg-green-50 border-green-200 text-green-950",
                MEDICATION: "bg-amber-50 border-amber-200 text-amber-950"
              };
              
              return (
                <div key={i} className={`p-4 rounded-2xl border flex items-start space-x-3 ${colors[type]}`}>
                  <span className="text-lg shrink-0">{type === "WARNING" ? "⚠️" : type === "DIET" ? "🥗" : "💊"}</span>
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-wider opacity-60 mb-0.5">{type} Guidelines</h4>
	                    <p className="text-xs font-semibold leading-relaxed font-bengali">{para.replace(/^(⚠️|🥗|💊)\s*/, "")}</p>
                  </div>
                </div>
              );
            })}

            {/* Legal Safety Banner */}
            <div className="p-3 bg-gray-900 rounded-2xl border border-gray-800 text-gray-400 text-[9px] leading-normal flex items-start space-x-2">
              <Info size={12} className="text-teal-400 shrink-0 mt-0.5" />
              <p className="font-medium font-bengali">এটি কেবল একটি সিনথেটিক সফটওয়্যার ডেমো। এটি ক্লিনিক্যালি যাচাইকৃত নয় এবং রোগ নির্ণয়, চিকিৎসা বা জরুরি সেবার বিকল্প নয়।</p>
            </div>

          </div>
        )}
      </div>

      {/* Button footer */}
      {!loading && (
        <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100 pb-7 z-10 shadow-lg">
          <button 
            onClick={() => navigate('referral')}
            className="w-full bg-primary-teal text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center hover:bg-teal-700 transition-colors"
          >
            Proceed to Referral Form <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}

function ScreenReferral({ navigate, currentDraft, setCurrentDraft, setPatients, triggerDashboardNotification }) {
  const [loading, setLoading] = useState(false);
  const [notifyFamily, setNotifyFamily] = useState(true);
  const [showReferralSlip, setShowReferralSlip] = useState(false);

  // Get assigned facility and doctor based on Registered Upazila mapping
  const allocation = FACILITY_MAPPING[currentDraft.upazila] || {
    facility: "Facility to be verified",
    doctor: "Duty clinician to be assigned"
  };
  const referralMeta = {
    CRITICAL: { priority: "EMERGENCY", timeframe: "Follow approved emergency protocol" },
    RED: { priority: "URGENT", timeframe: "Prompt clinician review per local protocol" },
    AMBER: { priority: "PRIORITY", timeframe: "Clinician-approved follow-up window" },
    GREEN: { priority: "ROUTINE", timeframe: "Routine follow-up if clinically appropriate" },
  }[currentDraft.riskTier] || { priority: "ROUTINE", timeframe: "Verify with a clinician" };
  const isReferral = currentDraft.riskTier === "RED" || currentDraft.riskTier === "CRITICAL";

  const handleConfirmReferral = () => {
    setLoading(true);
    setTimeout(() => {
      const newPatientRecord = {
        id: currentDraft.id || createCaseId(currentDraft.upazila),
        name: currentDraft.name || "Unknown Patient",
        age: Number(currentDraft.age),
        sex: currentDraft.sex,
        risk: currentDraft.riskTier,
        score: currentDraft.riskScore,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        loc: currentDraft.upazila,
        status: currentDraft.riskTier === 'RED' || currentDraft.riskTier === 'CRITICAL' ? "Referred" : "Monitored",
        vitals: currentDraft.vitals
      };
      
      setCurrentDraft({ ...currentDraft, notificationRequested: notifyFamily });
      setPatients((existingPatients) => [newPatientRecord, ...existingPatients]);
      if (isReferral) triggerDashboardNotification(newPatientRecord);
      setLoading(false);
      navigate('success');
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 fade-in relative">
      {/* Header */}
      <div className="pt-6 pb-3 px-5 flex items-center border-b border-gray-200 bg-white justify-between z-10 shadow-sm">
        <div className="flex items-center">
          <BackButton onClick={() => navigate('result')} className="mr-3" />
	          <h1 className="text-md font-bold text-navy-dark">{isReferral ? "Demo Referral" : "Demo Care Record"}</h1>
        </div>
        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Screen 7/8</span>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 overflow-y-auto pb-28 space-y-4 no-scrollbar">
        
        {/* Destination Doctor Allocation Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3.5 relative overflow-hidden">
	           <div className="absolute top-0 right-0 bg-teal-500/10 text-primary-teal font-extrabold text-[8px] tracking-wide px-2 py-0.5 rounded-bl uppercase">Routing mock</div>
	           <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Suggested Destination</h4>
           
           <div className="flex items-center space-x-3 text-navy-dark">
             <UserCheck className="text-primary-teal shrink-0" size={16} />
             <div className="flex flex-col">
               <span className="text-xs font-bold">{allocation.doctor}</span>
	               <span className="text-[9px] text-gray-400">Demo label; verify clinician availability</span>
             </div>
           </div>
           
           <div className="flex items-center space-x-3 text-navy-dark">
             <MapPin className="text-primary-teal shrink-0" size={16} />
             <div className="flex flex-col">
               <span className="text-xs font-bold">{allocation.facility}</span>
	               <span className="text-[9px] text-gray-400">Verify facility and current service availability</span>
             </div>
           </div>

           <div className="flex items-center space-x-3 text-navy-dark">
             <Clock className="text-primary-teal shrink-0" size={16} />
             <div className="flex flex-col">
	               <span className="text-xs font-bold">{referralMeta.timeframe}</span>
	               <span className="text-[9px] text-gray-400">Demo workflow guidance</span>
             </div>
           </div>
        </div>

        {/* Priority Selector */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority Code:</span>
          <span className={`text-xs font-black uppercase px-3 py-1 rounded-xl ${
            currentDraft.riskTier === 'CRITICAL' ? 'bg-red-950 text-red-200' :
            currentDraft.riskTier === 'RED' ? 'bg-[#faeee9] text-[#7e2a18]' : 'bg-[#fdf3dd] text-[#7a4e00]'
          }`}>
	            {referralMeta.priority}
          </span>
        </div>

        {/* Printable slip preview button */}
        <button 
          onClick={() => setShowReferralSlip(true)}
          className="w-full bg-white border border-gray-200 text-navy-dark p-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        >
          <FileText size={14} className="mr-1.5 text-primary-teal" />
          <span>Preview Demo Referral Slip</span>
        </button>

        {/* SMS Notification Toggle */}
        <div className="space-y-2.5">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <Phone className="text-gray-400" size={16} />
	               <span className="text-xs font-bold text-navy-dark">Simulate Family Alert</span>
             </div>
	             <button 
	               onClick={() => setNotifyFamily(!notifyFamily)}
	               aria-pressed={notifyFamily}
	               aria-label="Simulate family alert"
	               className={`w-11 h-6 rounded-full transition-colors relative ${notifyFamily ? 'bg-mint-bright' : 'bg-gray-200'}`}
             >
               <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${notifyFamily ? 'transform translate-x-5' : ''}`}></span>
             </button>
          </div>
          
          {notifyFamily && (
            <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl shadow-inner scale-in">
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block mb-1">Cellular Alert Template</span>
              <p className="text-xs text-blue-900 leading-relaxed font-semibold font-bengali">
                "স্বাস্থ্যবন্ধু এলার্ট: {currentDraft.name || 'রোগী'} এর স্বাস্থ্য ঝুঁকি বেশি ({currentDraft.riskTier})। অনুগ্রহ করে দ্রুত {allocation.facility}-এ যোগাযোগ করুন।"
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Action Footer */}
      <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-100 pb-7 shadow-lg z-10 flex space-x-2">
        <button 
          onClick={handleConfirmReferral}
          disabled={loading}
          className={`w-full text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center shadow-lg transition-colors duration-200 ${
            currentDraft.riskTier === 'CRITICAL' ? 'bg-red-950 hover:bg-red-900 shadow-red-100' : 'bg-risk-red hover:bg-red-700 shadow-red-100'
          }`}
        >
	          {loading ? <Loader2 className="animate-spin" size={18} /> : isReferral ? "Log Demo Referral" : "Save Demo Record"}
        </button>
      </div>

	      {/* Synthetic referral slip preview */}
      {showReferralSlip && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-3 fade-in">
          <div className="bg-white w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90%] border border-gray-100 text-ink-dark">
            
            {/* Modal Header */}
            <div className="bg-navy-dark text-white p-4 flex justify-between items-center">
	              <h3 className="text-xs font-bold tracking-wider uppercase">Demo referral slip preview</h3>
              <button onClick={() => setShowReferralSlip(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Document body */}
            <div className="flex-1 p-5 overflow-y-auto text-[10px] space-y-4 font-sans leading-normal">
              
              {/* Slip header */}
              <div className="text-center border-b border-gray-200 pb-3 flex flex-col items-center">
                <span className="text-[12px] font-black text-navy-dark tracking-wide">SHASTHOBONDHU AI (আমার স্বাস্থ্য বন্ধু)</span>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">Community-Led NCD Referral System</span>
	                <span className="text-[8px] font-bold text-[#0D7A62] border border-[#0D7A62] px-2 py-0.5 rounded-full mt-1.5 uppercase bg-teal-50">Synthetic showcase data</span>
              </div>

              {/* Unique case code / barcode */}
              <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block font-bold text-[8px] uppercase">Registry Code</span>
                  <span className="text-xs font-bold text-navy-dark font-mono">{currentDraft.id}</span>
                </div>
                {/* Simulated Barcode */}
                <div className="flex flex-col items-end">
                  <div className="h-6 w-24 bg-gradient-to-r from-black via-gray-800 to-black rounded-sm opacity-90 flex items-center justify-around px-1">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="bg-white h-full" style={{width: `${i % 3 === 0 ? 1 : i % 4 === 0 ? 3 : 2}px`}}></div>
                    ))}
                  </div>
                  <span className="text-[6px] text-gray-400 mt-0.5 font-mono">CODE-29A8D</span>
                </div>
              </div>

              {/* Patient Profile */}
              <div>
                <span className="text-gray-400 block font-extrabold uppercase tracking-wide mb-1.5">1. Patient Profile</span>
                <table className="w-full text-left border-collapse border border-gray-100">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="bg-gray-50 p-1.5 font-bold text-gray-500">Name</td>
                      <td className="p-1.5 font-black text-navy-dark">{currentDraft.name}</td>
                      <td className="bg-gray-50 p-1.5 font-bold text-gray-500">Age / Sex</td>
                      <td className="p-1.5 font-bold">{currentDraft.age}y / {currentDraft.sex}</td>
                    </tr>
                    <tr>
                      <td className="bg-gray-50 p-1.5 font-bold text-gray-500">Jurisdiction</td>
                      <td className="p-1.5 font-bold">{currentDraft.upazila}</td>
                      <td className="bg-gray-50 p-1.5 font-bold text-gray-500">National NID</td>
                      <td className="p-1.5 font-mono font-bold">{currentDraft.nid || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Clinical Metrics */}
              <div>
                <span className="text-gray-400 block font-extrabold uppercase tracking-wide mb-1.5">2. Diagnostic Vitals</span>
                <table className="w-full text-left border-collapse border border-gray-100">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 text-[8px] uppercase">
                      <th className="p-1.5">Vital Variable</th>
                      <th className="p-1.5 text-center">Value</th>
                      <th className="p-1.5 text-right">Attribution Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-1.5 font-bold">Blood Pressure (Systolic/Diastolic)</td>
                      <td className="p-1.5 text-center font-bold">{currentDraft.vitals.systolic}/{currentDraft.vitals.diastolic} mmHg</td>
                      <td className="p-1.5 text-right font-semibold text-[#C84B2F]">H Factor: {currentDraft.factors.H.toFixed(0)}%</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-1.5 font-bold">Fasting Blood Glucose</td>
                      <td className="p-1.5 text-center font-bold">{currentDraft.vitals.glucose} mmol/L</td>
                      <td className="p-1.5 text-right font-semibold text-[#0D7A62]">D Factor: {currentDraft.factors.D.toFixed(0)}%</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-1.5 font-bold">Oxygen Saturation (SpO₂)</td>
                      <td className="p-1.5 text-center font-bold">{currentDraft.vitals.spo2}%</td>
                      <td className="p-1.5 text-right font-semibold text-teal-600">S Factor: {currentDraft.factors.S.toFixed(0)}%</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 font-bold">Computed BMI Index</td>
                      <td className="p-1.5 text-center font-bold">
                        {currentDraft.vitals.weight && currentDraft.vitals.height ? 
                          (currentDraft.vitals.weight / ((currentDraft.vitals.height/100) * (currentDraft.vitals.height/100))).toFixed(1) : 
                          "27.1"
                        }
                      </td>
                      <td className="p-1.5 text-right font-semibold text-amber-600">A Factor: {currentDraft.factors.A.toFixed(0)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Diagnostic Recommendation */}
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
	                <span className="text-gray-400 block font-bold text-[8px] uppercase mb-1">3. Demonstration Risk Heuristic</span>
                <div className="flex justify-between items-center mt-1">
                  <div>
                    <span className="text-[12px] font-black text-navy-dark">Score: {currentDraft.riskScore.toFixed(1)} / 100</span>
	                    <span className="text-[8px] text-gray-500 block uppercase font-mono mt-0.5">Method: hand-authored weighted demo formula</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-xl ${
                    currentDraft.riskTier === 'CRITICAL' ? 'bg-red-950 text-red-200' :
                    currentDraft.riskTier === 'RED' ? 'bg-[#faeee9] text-[#7e2a18]' : 'bg-[#fdf3dd] text-[#7a4e00]'
                  }`}>
                    {currentDraft.riskTier} TIER
                  </span>
                </div>
              </div>

              {/* QR and Stamp footer */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                {/* Dynamically simulated QR code */}
                <div className="w-14 h-14 bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0">
                  <div className="w-11 h-11 bg-slate-900 flex flex-col justify-between p-1">
                    <div className="flex justify-between">
                      <div className="w-2.5 h-2.5 bg-white"></div>
                      <div className="w-2.5 h-2.5 bg-white"></div>
                    </div>
                    <div className="h-1 bg-white w-full opacity-60"></div>
                    <div className="flex justify-between">
                      <div className="w-2.5 h-2.5 bg-white"></div>
                      <div className="w-1.5 h-1.5 bg-white"></div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block border border-dashed border-red-400 text-red-500 font-extrabold text-[7px] px-2 py-0.5 rounded tracking-widest uppercase transform rotate-[-2deg] mb-1">
	                    NOT CLINICALLY APPROVED
                  </div>
                  <p className="text-[7px] text-gray-400">Printed: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

            </div>

            {/* Modal Action footer */}
            <div className="bg-slate-50 p-4 border-t border-gray-100 flex justify-between space-x-2">
              <button 
	                onClick={() => setShowReferralSlip(false)} 
                className="flex-1 bg-primary-teal text-white font-bold text-xs py-2.5 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center"
              >
	                <Printer size={12} className="mr-1.5" /> Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function ScreenSuccess({ navigate, currentDraft, setCurrentDraft }) {
  // Determine follow-up reminder cycle based on Triage Tier
  const getFollowUpInterval = (tier) => {
    if (tier === 'CRITICAL' || tier === 'RED') return "Urgent follow-up shown in demo";
    if (tier === 'AMBER') return "Priority follow-up shown in demo";
    return "Routine follow-up shown in demo";
  };
  const isReferral = currentDraft.riskTier === "CRITICAL" || currentDraft.riskTier === "RED";
  const startNewScreen = () => {
    setCurrentDraft(createInitialDraft());
    navigate('home');
  };

  return (
    <div className="flex flex-col h-full bg-white fade-in relative justify-center items-center px-6">
       
       <div className="w-20 h-20 bg-mint-bright rounded-full flex items-center justify-center scale-in shadow-lg shadow-green-100 mb-6">
          <Check size={36} color="white" strokeWidth={3} />
       </div>

	       <h1 className="text-xl font-bold text-navy-dark text-center leading-snug">{isReferral ? "Demo Referral Logged" : "Demo Record Saved"}</h1>
       
       <div className="bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl mt-3">
	         <span className="text-[9px] font-black text-primary-teal uppercase tracking-wider">Stored in browser memory for this session</span>
       </div>

       {/* Success Check List */}
       <div className="w-full space-y-2.5 my-8">
          <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex items-center text-navy-dark shadow-sm scale-in" style={{animationDelay: '0.2s'}}>
            <Activity className="text-mint-bright mr-3 shrink-0" size={16} />
	            <span className="font-bold text-xs">Synthetic profile added to the demo registry</span>
          </div>
          <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex items-center text-navy-dark shadow-sm scale-in" style={{animationDelay: '0.4s'}}>
            <Phone className="text-mint-bright mr-3 shrink-0" size={16} />
	            <span className="font-bold text-xs">{currentDraft.notificationRequested ? "Family alert simulated; no SMS was sent" : "Family alert was not requested"}</span>
          </div>
          <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex items-center text-navy-dark shadow-sm scale-in" style={{animationDelay: '0.6s'}}>
            <Clock className="text-mint-bright mr-3 shrink-0" size={16} />
            <span className="font-bold text-xs">{getFollowUpInterval(currentDraft.riskTier)}</span>
          </div>
       </div>

       <div className="w-full space-y-2.5 z-10">
          <button 
	            onClick={startNewScreen}
            className="w-full bg-primary-teal text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center shadow-md hover:bg-teal-700 transition-colors"
          >
            Create New Screen +
          </button>
       </div>

    </div>
  );
}

// ==========================================
// DISTRICT DASHBOARD WEB INTERFACE
// ==========================================

function DashboardApp({ patients }) {
  const [activeTab, setActiveTab] = useState(() => readPreference("demo_dashboard_tab", ["overview", "heatmap", "chw"], "overview"));

  useEffect(() => {
    writePreference("demo_dashboard_tab", activeTab);
  }, [activeTab]);

  return (
    <div className="flex w-full min-w-[960px] max-w-[1280px] mx-auto min-h-[780px] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 fade-in">
      
      {/* Sidebar Panel */}
      <div className="w-60 bg-navy-dark text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="p-5 border-b border-gray-800 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-teal-500/10 border border-teal-500 flex items-center justify-center text-teal-400 font-black">
              SB
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide">SHASTHOBONDHU</h2>
              <p className="text-[9px] text-[#00C97A] font-bold">আমার স্বাস্থ্য বন্ধু</p>
            </div>
          </div>
          
          <div className="py-5 px-3 space-y-1">
             <SidebarItem 
               icon={<BarChart2 size={18} />} 
               label="District Overview" 
               active={activeTab === 'overview'} 
               onClick={() => setActiveTab('overview')} 
             />
             <SidebarItem 
               icon={<MapPin size={18} />} 
               label="NCD Heatmap Map" 
               active={activeTab === 'heatmap'} 
               onClick={() => setActiveTab('heatmap')} 
             />
             <SidebarItem 
               icon={<Users size={18} />} 
               label="CHW Field Personnel" 
               active={activeTab === 'chw'} 
               onClick={() => setActiveTab('chw')} 
             />
          </div>
        </div>

        <div className="p-4 bg-[#0a1523] border-t border-gray-800 text-center flex flex-col items-center">
           <span className="bg-[#00C97A]/10 text-[#00C97A] font-bold text-[8px] px-2 py-0.5 rounded border border-[#00C97A]/20 tracking-wider">TEAM DIUxDIU</span>
           <p className="text-[9px] text-gray-500 mt-1.5 font-medium leading-normal">IEEE ICADHI Telemedicine Track</p>
        </div>
      </div>

      {/* Center workspace */}
      <div className="flex-1 bg-slate-50 overflow-y-auto no-scrollbar">
        {activeTab === 'overview' && <DashboardOverview patients={patients} />}
        {activeTab === 'heatmap' && <DashboardHeatmap />}
        {activeTab === 'chw' && <DashboardCHW patients={patients} />}
      </div>

    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold text-xs ${
        active ? 'bg-primary-teal text-white shadow-md shadow-teal-900/20' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
      }`}
    >
      <span className="mr-3 shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function DashboardOverview({ patients }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const activeSubmissionCount = Math.max(0, patients.length - INITIAL_PATIENTS.length);

  const totalPatients = 844 + patients.length;
  const highRisk = 123 + patients.filter(p => p.risk === 'RED' || p.risk === 'CRITICAL').length;
  const referralsToday = 16 + patients.filter(p => p.risk === 'RED' || p.risk === 'CRITICAL' || p.risk === 'AMBER').length;

  const kpiValues = {
    "Total Patients": totalPatients.toString(),
    "High Risk": highRisk.toString(),
    "Referrals Today": referralsToday.toString(),
    "Active CHWs": "23/31",
  };

  const KPIs = DASHBOARD_KPIS.map((kpi) => ({
    ...kpi,
    value: kpiValues[kpi.label] || kpi.value,
    change: kpi.label === "Total Patients"
      ? `+${activeSubmissionCount} this demo session`
      : kpi.change,
  }));

  const tierAdditions = {
    Green: patients.filter(p => p.risk === 'GREEN').length,
    Amber: patients.filter(p => p.risk === 'AMBER').length,
    Red: patients.filter(p => p.risk === 'RED' || p.risk === 'CRITICAL').length,
  };
  const derivedTierData = TIER_DATA.map((tier) => ({
    ...tier,
    count: tier.count + (tierAdditions[tier.tier] || 0),
  }));

  // Filtering patients registry
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === "ALL" || p.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-7 fade-in h-full flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-navy-dark">District Overview — Faridpur Division</h1>
          <p className="text-xs text-gray-500 mt-1">Synthetic dashboard snapshot with in-memory demo submissions</p>
        </div>
        <div className="bg-white px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 shadow-sm flex items-center">
          <Clock size={14} className="mr-2 text-primary-teal" /> Simulation Mode
        </div>
      </div>

      {/* Cards Panel */}
      <div className="grid grid-cols-4 gap-4">
        {KPIs.map((kpi, i) => {
          const borderColors = {
            teal: 'border-t-primary-teal',
            red: 'border-t-risk-red',
            amber: 'border-t-risk-amber',
            blue: 'border-t-blue-500'
          };
          
          return (
            <div key={i} className={`bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 border-t-4 ${borderColors[kpi.color]}`}>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{kpi.label}</span>
              <h3 className="text-2xl font-black text-navy-dark mt-1.5">{kpi.value}</h3>
              <p className="text-[10px] font-bold text-primary-teal mt-2">{kpi.change}</p>
            </div>
          );
        })}
      </div>

      <Suspense fallback={<div className="h-72 rounded-2xl border border-gray-200/50 bg-white flex items-center justify-center text-xs font-bold text-gray-400">Loading dashboard charts...</div>}>
        <DashboardCharts trendData={TREND_DATA} tierData={derivedTierData} />
      </Suspense>

      {/* Interactive Registry Directory */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
        
        {/* Registry Headers with Search */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h3 className="text-xs font-bold text-navy-dark uppercase tracking-wider">Live Patients Registry Database</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Filter synthetic case profiles held in this browser session</p>
          </div>
          
          <div className="flex space-x-2 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search Name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-teal focus:bg-white w-full md:w-44 transition-colors"
            />
            
            <select 
              value={riskFilter} 
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-primary-teal font-bold text-navy-dark"
            >
              <option value="ALL">ALL TIERS</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="RED">RED</option>
              <option value="AMBER">AMBER</option>
              <option value="GREEN">GREEN</option>
            </select>
          </div>
        </div>

        {/* Registry Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Case Registry ID</th>
                <th className="px-6 py-3">Patient Name</th>
                <th className="px-6 py-3">Sex / Age</th>
                <th className="px-6 py-3">Vitals Profile (BP / Glu)</th>
                <th className="px-6 py-3">Composite Risk</th>
                <th className="px-6 py-3">CHW Location</th>
                <th className="px-6 py-3 text-right">Referral SLA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-medium">
               {filteredPatients.map((row, i) => (
                 <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-gray-400">{row.id}</td>
                    <td className="px-6 py-3.5 font-bold text-navy-dark">{row.name}</td>
                    <td className="px-6 py-3.5 text-gray-600">{row.sex} / {row.age}y</td>
                    <td className="px-6 py-3.5 text-gray-600 font-mono text-[11px]">
                      {row.vitals ? `${row.vitals.systolic}/${row.vitals.diastolic} mmHg | ${row.vitals.glucose} mmol/L` : "--"}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`font-black ${row.risk === 'RED' || row.risk === 'CRITICAL' ? 'text-risk-red' : row.risk === 'AMBER' ? 'text-risk-amber' : 'text-primary-teal'}`}>
                        {row.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">{row.loc}</td>
                    <td className="px-6 py-3.5 text-right">
                       <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full border ${
                         row.status === 'Referred' ? 'bg-red-50 text-red-800 border-red-100' : 
                         row.status === 'Resolved' ? 'bg-teal-50 text-teal-800 border-teal-100' :
                         'bg-amber-50 text-amber-800 border-amber-100'
                       }`}>
                         {row.status}
                       </span>
                    </td>
                 </tr>
               ))}
               {filteredPatients.length === 0 && (
                 <tr>
                   <td colSpan="7" className="px-6 py-8 text-center text-gray-400 font-bold">No corresponding case registries matches the filter criteria.</td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

function DashboardHeatmap() {
  const [hoveredDivision, setHoveredDivision] = useState(null);

  const getRiskColor = (risk) => {
    if (risk >= 80) return '#7e2a18';
    if (risk >= 70) return '#C84B2F';
    if (risk >= 60) return '#C47D0C';
    return '#0D7A62';
  };

  const getRiskLabel = (risk) => {
    if (risk >= 80) return "Very high";
    if (risk >= 70) return "High";
    if (risk >= 60) return "Moderate";
    return "Low";
  };

  const topDivisions = [...DIVISIONS].sort((a, b) => b.risk - a.risk).slice(0, 3);
  const activeDivision = hoveredDivision || topDivisions[0];

  return (
    <div className="p-7 fade-in h-full flex flex-col space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-navy-dark">NCD Risk Density — Bangladesh Divisions</h1>
        <p className="text-xs text-gray-500 mt-1">Static synthetic values for layout demonstration, not epidemiological data</p>
      </div>

      <div className="grid grid-cols-[1fr_18rem] gap-6 flex-1 items-start">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="grid grid-cols-4 gap-3">
            {DIVISIONS.map((division) => (
              <button
                key={division.name}
                type="button"
                title={`${division.name}: risk ${division.risk}, ${division.patients} patients`}
                onMouseEnter={() => setHoveredDivision(division)}
                onFocus={() => setHoveredDivision(division)}
                className="min-h-32 rounded-2xl p-4 text-left text-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-teal"
                style={{ backgroundColor: getRiskColor(division.risk) }}
              >
                <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{getRiskLabel(division.risk)} risk</span>
                <h3 className="text-lg font-black mt-2 leading-tight">{division.name}</h3>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold opacity-80">Risk score</p>
                    <p className="text-3xl font-black leading-none">{division.risk}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold opacity-80">Patients</p>
                    <p className="text-sm font-black">{division.patients}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="w-full flex items-center justify-between mt-5 bg-gray-50 p-3 rounded-xl border border-gray-100 text-[10px] font-bold text-gray-500">
            <span>Low Risk</span>
            <div className="flex-1 h-2.5 mx-4 rounded-full bg-gradient-to-r from-[#0D7A62] via-[#C47D0C] to-[#7e2a18]"></div>
            <span>High Risk</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/50 p-5 shadow-sm space-y-4">
          <div className="flex items-center text-navy-dark space-x-2">
            <MapPin size={16} className="text-primary-teal shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Top 3 Highest-Risk Divisions</h3>
          </div>

          <div className="space-y-2">
            {topDivisions.map((division, index) => (
              <button
                key={division.name}
                type="button"
                onMouseEnter={() => setHoveredDivision(division)}
                onFocus={() => setHoveredDivision(division)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-gray-100 text-left hover:bg-white hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-navy-dark text-white text-[10px] font-black flex items-center justify-center">{index + 1}</span>
                  <div>
                    <p className="text-xs font-black text-navy-dark">{division.name}</p>
                    <p className="text-[10px] text-gray-400">{division.patients} screened</p>
                  </div>
                </div>
                <span className="text-lg font-black" style={{ color: getRiskColor(division.risk) }}>{division.risk}</span>
              </button>
            ))}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 scale-in">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Hover detail</span>
            <h4 className="text-xl font-black text-navy-dark mt-1">{activeDivision.name}</h4>
            <div className="mt-3 space-y-2 text-[11px] font-semibold text-gray-600">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>Average risk score</span>
                <span className="font-black" style={{ color: getRiskColor(activeDivision.risk) }}>{activeDivision.risk}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>Patient count</span>
                <span className="font-black text-navy-dark">{activeDivision.patients}</span>
              </div>
              <div className="flex justify-between">
                <span>Risk band</span>
                <span className="font-black text-navy-dark">{getRiskLabel(activeDivision.risk)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCHW({ patients }) {
  const activeSubmissionCount = Math.max(0, patients.length - INITIAL_PATIENTS.length);
  const addedPatients = patients.slice(0, activeSubmissionCount);

  return (
    <div className="p-7 fade-in h-full flex flex-col space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-navy-dark">CHW Field Personnel Activity Registry</h1>
        <p className="text-xs text-gray-500 mt-1">Static synthetic staff metrics plus submissions created in this demo session</p>
      </div>

      {/* CHW Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-dark text-white text-[10px] font-bold uppercase tracking-wide">
              <th className="px-6 py-4">Field Officer Name</th>
              <th className="px-6 py-4">Upazila Division</th>
              <th className="px-6 py-4 text-center">Total Screened</th>
              <th className="px-6 py-4 text-center">High-Risk Cases Found</th>
              <th className="px-6 py-4 text-center">Dispatched Referrals</th>
              <th className="px-6 py-4 text-right">Synchronization Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
             {CHW_DATA.map((chw, i) => {
               // Dynamic addition for Fatema Akter (simulated local operator)
               const screened = chw.top ? chw.screened + activeSubmissionCount : chw.screened;
	               const redCount = chw.top ? chw.highRisk + addedPatients.filter(p=>p.risk==='RED'||p.risk==='CRITICAL').length : chw.highRisk;
	               const referralCount = chw.top ? chw.referrals + addedPatients.filter(p=>p.risk==='RED'||p.risk==='CRITICAL').length : chw.referrals;

               return (
                 <tr key={i} className={`transition-colors hover:bg-slate-50 ${chw.top ? 'bg-yellow-50/20' : ''}`}>
                    <td className="px-6 py-4 font-bold text-navy-dark flex items-center">
                      <div className="w-7 h-7 rounded-full bg-primary-teal text-white flex items-center justify-center font-bold text-[10px] mr-2.5 shadow-sm">
                        {chw.name.charAt(0)}
                      </div>
                      <span>{chw.name}</span>
                      {chw.top && <span className="ml-2 bg-yellow-100 text-yellow-800 border border-yellow-200 text-[8px] px-1 rounded-full uppercase font-black tracking-wide">Simulator Operator</span>}
                    </td>
                    <td className="px-6 py-4">{chw.upazila}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-navy-dark">{screened}</td>
                    <td className="px-6 py-4 text-center font-mono text-risk-red font-bold">{redCount}</td>
                    <td className="px-6 py-4 text-center font-mono text-primary-teal font-bold">{referralCount}</td>
                    <td className="px-6 py-4 text-right text-gray-400 font-semibold">{chw.last}</td>
                 </tr>
               );
             })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
