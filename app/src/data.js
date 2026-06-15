export const DEMO_PATIENT = {
  id: "BD-FAR-00847",
  name: "Rina Begum", nameBn: "রিনা বেগম",
  age: 52, sex: "Female",
  village: "Faridpur Sadar, Faridpur",
  phone: "01712-345678",
  voiceTranscript: "বুক ধড়ফড় করছে, মাথা ঘোরাচ্ছে, তিন দিন ধরে।",
  transcriptEn: "Heart is pounding, feeling dizzy, for three days.",
  symptoms: ["Chest palpitation 🫀", "Dizziness 💫", "Duration: 3 days ⏱️"],
  vitals: { systolic: 162, diastolic: 98, glucose: 9.4, spo2: 97, weight: 61, height: 150 },
  riskScore: 68.4, riskTier: "RED",
  factors: { D: 74, H: 76, A: 62, S: 72, L: 55 },
  referral: {
    doctor: "Duty clinician (demo placeholder)",
    facility: "Faridpur Upazila Health Complex",
    priority: "URGENT", time: "Today, within 2 hours"
  }
};

export const VOICE_PRESETS = [
  {
    id: "rina",
    name: "Rina Begum (Worked Example)",
    textBn: "বুক ধড়ফড় করছে, মাথা ঘোরাচ্ছে, তিন দিন ধরে।",
    textEn: "Heart is pounding, feeling dizzy, for three days.",
    symptoms: ["Chest palpitation 🫀", "Dizziness 💫", "Duration: 3 days ⏱️"],
    duration: 3,
    age: 52,
    sex: "Female",
    systolic: 162,
    diastolic: 98,
    glucose: 9.4,
    spo2: 97,
    weight: 61,
    height: 150,
    hasFamilyHistory: false,
    smoker: false,
    sedentary: true,
    poorDiet: true,
    cardiacFlag: true,
  },
  {
    id: "kashem",
    name: "Abul Kashem (Critical Emergency)",
    textBn: "বুকের বাম পাশে অনেক ব্যথা করছে এবং বাম হাত অবশ হয়ে আসছে।",
    textEn: "The left side of my chest hurts a lot and my left arm is going numb.",
    symptoms: ["Severe chest pain 🚨", "Left-arm radiation ⚡", "Numbness 🛑"],
    duration: 1,
    age: 60,
    sex: "Male",
    systolic: 175,
    diastolic: 105,
    glucose: 6.2,
    spo2: 92,
    weight: 78,
    height: 168,
    hasFamilyHistory: true,
    smoker: true,
    sedentary: true,
    poorDiet: true,
    cardiacFlag: true,
    criticalOverride: true, // Severe chest pain with left arm radiation + age + vitals
  },
  {
    id: "mariam",
    name: "Mariam Bibi (Moderate Risk)",
    textBn: "শরীর খুব ক্লান্ত লাগে, চোখের সামনে মাঝে মাঝে ঝাপসা দেখি।",
    textEn: "I feel very tired and sometimes see blurry in front of my eyes.",
    symptoms: ["Fatigue 💤", "Blurred vision 👁️", "Weakness 📉"],
    duration: 7,
    age: 41,
    sex: "Female",
    systolic: 132,
    diastolic: 84,
    glucose: 7.9,
    spo2: 98,
    weight: 56,
    height: 152,
    hasFamilyHistory: false,
    smoker: false,
    sedentary: false,
    poorDiet: true,
    cardiacFlag: false,
  }
];

export const FACILITY_MAPPING = {
  "Faridpur Sadar": {
    facility: "Faridpur Upazila Health Complex",
    doctor: "Duty clinician (demo placeholder)"
  },
  "Bhanga": {
    facility: "Bhanga Upazila Health Complex",
    doctor: "Duty clinician (demo placeholder)"
  },
  "Boalmari": {
    facility: "Boalmari Upazila Health Complex",
    doctor: "Duty clinician (demo placeholder)"
  },
  "Alfadanga": {
    facility: "Alfadanga Upazila Health Complex",
    doctor: "Duty clinician (demo placeholder)"
  },
  "Charbhadrasan": {
    facility: "Charbhadrasan Upazila Health Complex",
    doctor: "Duty clinician (demo placeholder)"
  }
};

export const RECENT_PATIENTS = [
  { id: "BD-FAR-00847", name: "Rina Begum", age: 52, risk: "RED", score: 68.4, time: "3:45 PM", loc: "Faridpur Sadar", status: "Referred" },
  { id: "BD-BHA-01024", name: "Salma Khatun", age: 45, risk: "AMBER", score: 47.8, time: "11:15 AM", loc: "Bhanga", status: "Pending" },
  { id: "BD-BOA-00561", name: "Karim Hossain", age: 58, risk: "GREEN", score: 24.1, time: "9:30 AM", loc: "Boalmari", status: "Resolved" },
];

export const DASHBOARD_KPIS = [
  { label: "Total Patients", value: "847", change: "+23 today", color: "teal" },
  { label: "High Risk", value: "124", change: "+5 today", color: "red" },
  { label: "Referrals Today", value: "18", change: "↑ from 14", color: "amber" },
  { label: "Active CHWs", value: "23/31", change: "of 31 total", color: "blue" },
];

export const TREND_DATA = [
  { day: "Day 1", patients: 18, highRisk: 3 },
  { day: "Day 5", patients: 24, highRisk: 4 },
  { day: "Day 10", patients: 31, highRisk: 6 },
  { day: "Day 15", patients: 28, highRisk: 5 },
  { day: "Day 20", patients: 36, highRisk: 8 },
  { day: "Day 25", patients: 41, highRisk: 9 },
  { day: "Day 30", patients: 38, highRisk: 7 },
];

export const TIER_DATA = [
  { tier: "Green", count: 521 },
  { tier: "Amber", count: 202 },
  { tier: "Red", count: 124 },
];

export const CHW_DATA = [
  { name: "Fatema Akter", upazila: "Faridpur Sadar", screened: 94, highRisk: 18, referrals: 16, last: "Today", top: true },
  { name: "Rahima Begum", upazila: "Bhanga", screened: 87, highRisk: 14, referrals: 12, last: "Today", top: false },
  { name: "Mina Khatun", upazila: "Boalmari", screened: 76, highRisk: 11, referrals: 9, last: "Yesterday", top: false },
  { name: "Nasima Islam", upazila: "Alfadanga", screened: 68, highRisk: 9, referrals: 8, last: "Today", top: false },
  { name: "Shirin Akter", upazila: "Charbhadrasan", screened: 61, highRisk: 8, referrals: 7, last: "2 days ago", top: false },
];

export const DIVISIONS = [
  { name: "Dhaka", risk: 82, patients: 214 },
  { name: "Chattogram", risk: 74, patients: 189 },
  { name: "Rajshahi", risk: 68, patients: 156 },
  { name: "Khulna", risk: 71, patients: 142 },
  { name: "Barishal", risk: 65, patients: 98 },
  { name: "Sylhet", risk: 59, patients: 84 },
  { name: "Rangpur", risk: 48, patients: 71 },
  { name: "Mymensingh", risk: 61, patients: 93 },
];
