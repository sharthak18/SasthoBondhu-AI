# ShasthoBondhu AI — Demo App Build Prompt

> **Team DIUxDIU** · Dhaka International University × Daffodil International University  
> IEEE ICADHI 2026 · Project Showcase

---

## How to Use

1. Copy everything below the horizontal rule
2. Open a **new Claude chat** (Sonnet 4 or above, Artifacts enabled)
3. Paste and send — you will get the full working React demo app

---

## THE PROMPT

Build a complete, visually stunning, production-quality React demo app called **"ShasthoBondhu AI — আমার স্বাস্থ্য বন্ধু"** for an IEEE healthcare AI competition (ICADHI 2026). This is a Project Showcase demo — everything is mocked (no real backend), but it must look and feel like a real, working product.

---

## TECH STACK

- React 18 with hooks (`useState`, `useEffect`, `useRef`)
- Tailwind CSS utility classes only (no custom CSS except keyframe animations via `<style>` tag)
- `import { useState, useEffect, useRef } from "react"`
- `import { Users, AlertTriangle, ArrowUpRight, UserCheck, Mic, MicOff, Activity, Heart, Droplets, Wind, Scale, ChevronRight, ChevronLeft, Check, Phone, MapPin, Clock, Star, Bell, Home, UserPlus, BarChart2, Menu, X } from "lucide-react"`
- `import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"`
- Default export a single React component

---

## STRUCTURE — TWO MODES IN ONE APP

The app has a **TOP-LEVEL MODE SWITCHER** — a pill toggle at the very top of the screen:

```
[📱 CHW App]   [🖥️ Dashboard]
```

Switching between modes renders completely different UI.

---

## MODE 1: CHW APP (Mobile Interface)

Render a **phone frame** (`max-w-sm mx-auto`, dark border, `rounded-3xl overflow-hidden`, `shadow-2xl`) containing the mobile app. The phone has a notch at the top. Inside: a single-screen navigation controlled by a `currentScreen` state.

**Screens:** `home | register | voice | vitals | result | guidance | referral | success`

---

### SCREEN 1 — HOME

- Header: teal bg `#0D7A62`, "Good afternoon, Fatema Akter 👋", subtitle "Community Health Worker • Faridpur Sadar"
- Stats row: 3 cards — "4 Patients Today" (teal), "1 High Risk" (red), "3 Referrals" (amber)
- "Today's Patients" section: list of 3 patients from `RECENT_PATIENTS`. Each row: name, age, risk badge (coloured), score, time
- Bottom nav: Home (active), New Patient (UserPlus icon), Alerts (Bell icon), Profile (Users icon)
- Big teal FAB button "+" at bottom-right → goes to register screen

---

### SCREEN 2 — REGISTER

- Back arrow header, title "New Patient"
- Form fields: Full Name (pre-filled "Rina Begum"), Age (52), Sex (toggle: Female selected), Village (Faridpur Sadar, Faridpur), Phone (optional)
- Show "Pre-filled from demo data" subtle gold badge
- "Continue to Voice Input →" teal button at bottom

---

### SCREEN 3 — VOICE INPUT

- Header: "Symptom Check" — patient name as subtitle
- Large centered mic button (80px circle, teal bg) with **pulsing ring animation** (keyframe: scale 1→1.4, opacity 1→0, repeat)
- States: `idle | recording | done`
  - **IDLE:** "Tap to record symptoms" below mic
  - **RECORDING** (auto-starts after 0.5s, lasts 2.5s): mic turns red (MicOff icon), **animated waveform** (8 bars, heights animate via keyframe)
  - **DONE:** transcript box fades in — `"বুক ধড়ফড় করছে, মাথা ঘোরাচ্ছে, তিন দিন ধরে।"` with English translation below in gray italic
- Extracted symptom chips: `"Chest palpitation 🫀"`, `"Dizziness 💫"`, `"Duration: 3 days ⏱️"`
- "Continue to Vitals →" button (appears after done)

---

### SCREEN 4 — VITALS

- Header: "Enter Vital Signs"
- 4 input cards with icon, label, input, unit:
  - ❤️ Blood Pressure — two inputs side by side (Systolic: **162**, Diastolic: **98**) — unit: mmHg — red left border
  - 💧 Blood Glucose — **9.4** — unit: mmol/L — amber left border
  - 💨 SpO₂ — **97** — unit: % — blue left border
  - ⚖️ Weight — **61** — unit: kg — gray left border
- Each card: white bg, 3px colored left border, `shadow-sm`, `rounded-xl`
- "Analyse Risk →" big teal button → 1 second loading spinner → goes to result screen

---

### SCREEN 5 — RISK RESULT

- Header: "Risk Analysis" with patient name
- **Animated score gauge:** SVG circle (r=54, cx=64, cy=64), `stroke-dasharray=339.3`, stroke animates from 0 to `(68.4/100)*339.3` over 1.5s, color red `#C84B2F`
- Score number animates from 0 → **68.4** over 1.5s (`useEffect` + `setInterval`)
- Below gauge: `"HIGH RISK"` badge (red bg, white text, `rounded-full`)
- **Factor bars** (5 horizontal bars):
  - D (Diabetes) 81% — red fill
  - H (Hypertension) 76% — red fill
  - A (Age/Demo) 62% — amber fill
  - S (Symptoms) 72% — orange fill
  - L (Lifestyle) 55% — amber fill
- Triage card: red bg `#faeee9`, `"🚨 RED TIER — Immediate Referral Required"`
- Two buttons: "View AI Guidance" (teal outline) and "Create Referral →" (teal filled)

---

### SCREEN 6 — AI GUIDANCE

- Header: "AI Health Guidance" — `"Powered by Gemini ✨"` purple badge top-right
- "Loading guidance..." spinner for 1.5s on mount → content fades in
- Three coloured sections:
  - ⚠️ WARNING SIGNS (red card)
  - 🥗 DIET ADVICE (green card)
  - 💊 MEDICATION NOTE (amber card)
- Full `GUIDANCE_TEXT_BN` displayed (Bangla)
- **Play button** (▶️, purple bg): simulates TTS — each line highlights yellow with 1.5s delay cycling
- "Proceed to Referral →" button at bottom

---

### SCREEN 7 — REFERRAL

- Header: "Auto-Generated Referral"
- Patient summary card: name, age, sex, risk score, key vitals
- Referral details card (teal left border):
  - 👨‍⚕️ Dr. Md. Abdul Karim
  - 🏥 Faridpur Upazila Health Complex
  - 🚨 Priority: URGENT (red badge)
  - 🕐 Today, within 2 hours
- "Notify Family Member" toggle (default ON)
- Pre-filled summary text: *"Patient presents with chest palpitation and dizziness. Risk score 68.4. Hypertension (162/98) and elevated glucose (9.4). Immediate cardiac evaluation recommended."*
- "Confirm & Send Referral" big red button → 1s loading → success screen

---

### SCREEN 8 — SUCCESS

- Center-aligned, large top padding
- **Animated green circle with checkmark** (scale-in animation, 0.6s)
- "Referral Created Successfully!" heading
- Case ID: `BD-FAR-00847` in mono font, teal colour
- Two info pills: "Patient Added to Monitoring ✓" and "Family Notified ✓"
- Compact patient summary card
- "View Patient Record" outline button + "New Patient +" teal filled button → home

---

## MODE 2: DASHBOARD (Web Interface)

Full-width layout. **Left sidebar** (240px) + **main content area**.

### SIDEBAR

- Top: "ShasthoBondhu AI" title (teal), "আমার স্বাস্থ্য বন্ধু" subtitle (mint, small)
- Nav items: Overview (BarChart2), NCD Heatmap (MapPin), CHW Performance (Users)
- Bottom: "Team DIUxDIU" badge, "Dhaka International × Daffodil IU" tiny text
- Active: teal bg, white text. Inactive: gray-400

---

### DASHBOARD VIEW 1 — OVERVIEW

- Page title: "District Overview — Faridpur Division"
- 4 KPI cards: Total Patients **847** (+23 today) · High Risk **124** (+5) · Referrals Today **18** · Active CHWs **23/31**
  - Each: colored top border (3px), icon in colored circle, big number, change subtext
- Two charts side by side:
  - **Left** — Line chart "30-Day Patient Trend": two lines — total patients (teal) + high risk (red) using `TREND_DATA`
  - **Right** — Bar chart "Risk Tier Distribution": 3 bars Green/Amber/Red using `TIER_DATA` with matching colours
- Recent High-Risk Alerts table: 5 columns (Patient, Age, Score, Upazila, Status). Status badges: "Referred" (green), "Pending" (amber)

---

### DASHBOARD VIEW 2 — NCD HEATMAP

- Title: "NCD Risk Density — Bangladesh Divisions"
- Implement as a **grid of 8 coloured division cards** (4×2). Each card: division name, risk score, patient count. Colour by risk: 80+ = deep red, 70–80 = medium red, 60–70 = amber, below 60 = green
- Hover effect showing tooltip stats
- Legend bar: Green → Amber → Red gradient with "Low Risk" to "High Risk" labels
- Right sidebar: Top 3 highest-risk divisions ranked list

---

### DASHBOARD VIEW 3 — CHW PERFORMANCE

- Title: "Community Health Worker Performance"
- Table: CHW Name · Upazila · Screened · High Risk Found · Referrals · Last Active
- 5 rows from `CHW_DATA`
- Top CHW (Fatema Akter): subtle gold background row, 🏆 badge
- Table header: dark bg `#0F2744`, white text. Alternating row colours.

---

## ALL MOCK DATA — paste exactly as-is

```js
const DEMO_PATIENT = {
  id: "BD-FAR-00847",
  name: "Rina Begum", nameBn: "রিনা বেগম",
  age: 52, sex: "Female",
  village: "Faridpur Sadar, Faridpur",
  phone: "01712-345678",
  voiceTranscript: "বুক ধড়ফড় করছে, মাথা ঘোরাচ্ছে, তিন দিন ধরে।",
  transcriptEn: "Heart is pounding, feeling dizzy, for three days.",
  symptoms: ["Chest palpitation 🫀", "Dizziness 💫", "Duration: 3 days ⏱️"],
  vitals: { systolic: 162, diastolic: 98, glucose: 9.4, spo2: 97, weight: 61 },
  riskScore: 68.4, riskTier: "RED",
  factors: { D: 81, H: 76, A: 62, S: 72, L: 55 },
  referral: {
    doctor: "Dr. Md. Abdul Karim",
    facility: "Faridpur Upazila Health Complex",
    priority: "URGENT", time: "Today, within 2 hours"
  }
};

const GUIDANCE_TEXT_BN = `আপনার রক্তচাপ (১৬২/৯৮) এবং রক্তে শর্করার মাত্রা (৯.৪ mmol/L) উভয়ই বিপজ্জনক পর্যায়ে রয়েছে। আপনাকে আজই একজন ডাক্তারের সাথে দেখা করতে হবে।

⚠️ সতর্কতা: বুকে তীব্র ব্যথা, শ্বাসকষ্ট বা হঠাৎ মাথা ঘুরলে সঙ্গে সঙ্গে হাসপাতালে যান।

🥗 খাদ্য পরামর্শ: লবণ কম খান, মিষ্টি ও ভাজাপোড়া এড়িয়ে চলুন। প্রতিদিন শাকসবজি ও ফল খান।

💊 ওষুধ: ডাক্তারের পরামর্শ ছাড়া কোনো ওষুধ খাবেন না। নিয়মিত রক্তচাপ পরিমাপ করুন।`;

const RECENT_PATIENTS = [
  { name: "Karim Hossain", age: 58, risk: "GREEN", score: 24.1, time: "9:30 AM" },
  { name: "Salma Khatun",  age: 45, risk: "AMBER", score: 47.8, time: "11:15 AM" },
  { name: "Rina Begum",    age: 52, risk: "RED",   score: 68.4, time: "3:45 PM" },
];

const DASHBOARD_KPIS = [
  { label: "Total Patients",   value: "847",   change: "+23 today",     color: "teal" },
  { label: "High Risk",        value: "124",   change: "+5 today",      color: "red" },
  { label: "Referrals Today",  value: "18",    change: "↑ from 14",     color: "amber" },
  { label: "Active CHWs",      value: "23/31", change: "of 31 total",   color: "blue" },
];

const TREND_DATA = [
  { day: "Day 1",  patients: 18, highRisk: 3 },
  { day: "Day 5",  patients: 24, highRisk: 4 },
  { day: "Day 10", patients: 31, highRisk: 6 },
  { day: "Day 15", patients: 28, highRisk: 5 },
  { day: "Day 20", patients: 36, highRisk: 8 },
  { day: "Day 25", patients: 41, highRisk: 9 },
  { day: "Day 30", patients: 38, highRisk: 7 },
];

const TIER_DATA = [
  { tier: "Green", count: 521 },
  { tier: "Amber", count: 202 },
  { tier: "Red",   count: 124 },
];

const CHW_DATA = [
  { name: "Fatema Akter",  upazila: "Faridpur Sadar",  screened: 94, highRisk: 18, referrals: 16, last: "Today",     top: true  },
  { name: "Rahima Begum",  upazila: "Bhanga",           screened: 87, highRisk: 14, referrals: 12, last: "Today",     top: false },
  { name: "Mina Khatun",   upazila: "Boalmari",         screened: 76, highRisk: 11, referrals: 9,  last: "Yesterday", top: false },
  { name: "Nasima Islam",  upazila: "Alfadanga",        screened: 68, highRisk: 9,  referrals: 8,  last: "Today",     top: false },
  { name: "Shirin Akter",  upazila: "Charbhadrasan",   screened: 61, highRisk: 8,  referrals: 7,  last: "2 days ago",top: false },
];

const DIVISIONS = [
  { name: "Dhaka",      risk: 82, patients: 214 },
  { name: "Chattogram", risk: 74, patients: 189 },
  { name: "Rajshahi",   risk: 68, patients: 156 },
  { name: "Khulna",     risk: 71, patients: 142 },
  { name: "Barishal",   risk: 65, patients: 98  },
  { name: "Sylhet",     risk: 59, patients: 84  },
  { name: "Rangpur",    risk: 48, patients: 71  },
  { name: "Mymensingh", risk: 61, patients: 93  },
];
```

---

## ANIMATIONS — add as `<style>` tag inside the component

```css
@keyframes pulse-ring {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0;   }
}
@keyframes wave {
  0%, 100% { height: 8px;  }
  50%       { height: 32px; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}
@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.pulse-ring  { animation: pulse-ring 1.2s ease-out infinite; }
.wave-bar    { animation: wave 0.8s ease-in-out infinite; }
.wave-bar:nth-child(2) { animation-delay: 0.10s; }
.wave-bar:nth-child(3) { animation-delay: 0.20s; }
.wave-bar:nth-child(4) { animation-delay: 0.30s; }
.wave-bar:nth-child(5) { animation-delay: 0.15s; }
.wave-bar:nth-child(6) { animation-delay: 0.25s; }
.wave-bar:nth-child(7) { animation-delay: 0.05s; }
.wave-bar:nth-child(8) { animation-delay: 0.35s; }
.fade-in  { animation: fadeIn  0.4s ease both; }
.scale-in { animation: scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
```

---

## DESIGN TOKENS

| Token | Value |
|---|---|
| Primary Teal | `#0D7A62` |
| Navy Dark | `#0F2744` |
| Mint Bright | `#00C97A` |
| Risk Red | `#C84B2F` |
| Risk Amber | `#C47D0C` |
| Risk Green | `#0D7A62` |
| Off White | `#F8FAFC` |
| Ink Dark | `#111827` |

**Risk tier colours:**
- 🟢 Green (R < 30): bg `#d1f5ea`, text `#0a5e42`
- 🟡 Amber (30–65): bg `#fdf3dd`, text `#7a4e00`
- 🔴 Red (> 65): bg `#faeee9`, text `#7e2a18`

---

## BRANDING FOOTER

Every screen (CHW app, below phone frame):
> `Team DIUxDIU · Dhaka International University × Daffodil International University · IEEE ICADHI 2026`

Dashboard sidebar bottom: same text, smaller.

---

## QUALITY REQUIREMENTS

- Every screen must look polished and competition-ready
- Bangla text must render correctly — use the exact strings given
- Mode switcher must be prominent and work perfectly
- Score animation **must** use `useEffect` with `setInterval`, not CSS
- SVG gauge **must** animate `stroke-dashoffset` with CSS transition
- Do **not** skip any screen — all 8 CHW screens + 3 dashboard views required
- Transitions, hover effects, and shadows throughout — make it feel alive
- Font: system-ui / Tailwind default sans-serif

**Build the complete, working React component now. All 8 CHW screens, all 3 dashboard views, all animations, all mock data embedded. Make it look like a real AI healthcare product — not a student prototype.**
