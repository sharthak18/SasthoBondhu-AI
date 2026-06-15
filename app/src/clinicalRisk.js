const LIMITS = {
  age: { label: "Age", min: 18, max: 120 },
  systolic: { label: "Systolic blood pressure", min: 60, max: 260 },
  diastolic: { label: "Diastolic blood pressure", min: 30, max: 160 },
  glucose: { label: "Blood glucose", min: 1, max: 40 },
  spo2: { label: "SpO2", min: 50, max: 100 },
  weight: { label: "Weight", min: 20, max: 300 },
  height: { label: "Height", min: 100, max: 250 },
};

const parseMeasurement = (value, key, errors) => {
  const rule = LIMITS[key];
  const number = typeof value === "string" && value.trim() === "" ? NaN : Number(value);

  if (!Number.isFinite(number)) {
    errors[key] = `${rule.label} is required.`;
    return null;
  }

  if (number < rule.min || number > rule.max) {
    errors[key] = `${rule.label} must be between ${rule.min} and ${rule.max}.`;
    return null;
  }

  return number;
};

export const validateVitals = (draft) => {
  const errors = {};
  const values = {
    age: parseMeasurement(draft.age, "age", errors),
    systolic: parseMeasurement(draft.vitals.systolic, "systolic", errors),
    diastolic: parseMeasurement(draft.vitals.diastolic, "diastolic", errors),
    glucose: parseMeasurement(draft.vitals.glucose, "glucose", errors),
    spo2: parseMeasurement(draft.vitals.spo2, "spo2", errors),
    weight: parseMeasurement(draft.vitals.weight, "weight", errors),
    height: parseMeasurement(draft.vitals.height, "height", errors),
  };

  if (
    values.systolic !== null &&
    values.diastolic !== null &&
    values.systolic <= values.diastolic
  ) {
    errors.systolic = "Systolic pressure must be higher than diastolic pressure.";
  }

  return {
    errors,
    values,
    isValid: Object.keys(errors).length === 0,
  };
};

export const calcD = (glucose) => {
  if (glucose < 5.6) {
    return Math.max(0, ((glucose - 3.0) / (5.6 - 3.0)) * 15);
  }
  if (glucose < 7.0) {
    return 16 + ((glucose - 5.6) / (7.0 - 5.6)) * (45 - 16);
  }
  if (glucose < 10.0) {
    if (glucose <= 9.4) {
      return 46 + ((glucose - 7.0) / (9.4 - 7.0)) * (74 - 46);
    }
    return 74 + ((glucose - 9.4) / (10.0 - 9.4)) * (75 - 74);
  }
  return 76 + Math.min(24, ((glucose - 10.0) / 10.0) * 24);
};

export const calcH = (systolic, diastolic) => {
  let sysScore;
  if (systolic < 120) {
    sysScore = Math.max(0, ((systolic - 90) / 30) * 10);
  } else if (systolic < 130) {
    sysScore = 11 + ((systolic - 120) / 10) * (25 - 11);
  } else if (systolic < 140) {
    sysScore = 26 + ((systolic - 130) / 10) * (50 - 26);
  } else if (systolic < 160) {
    sysScore = 51 + ((systolic - 140) / 20) * (75 - 51);
  } else if (systolic <= 162) {
    sysScore = 76;
  } else {
    sysScore = 76 + Math.min(24, ((systolic - 162) / 38) * 24);
  }

  let diaScore;
  if (diastolic < 80) diaScore = 10;
  else if (diastolic < 85) diaScore = 25;
  else if (diastolic < 90) diaScore = 50;
  else if (diastolic < 100) diaScore = 75;
  else diaScore = 100;

  return Math.max(sysScore, diaScore);
};

export const calcA = (age, sex, weight, height, hasFamilyHistory) => {
  const bmi = weight / ((height / 100) ** 2);
  let ageScore;

  if (age < 35) ageScore = 10;
  else if (age < 45) ageScore = 30;
  else if (age < 55) ageScore = 40 + ((age - 45) / 10) * 15;
  else if (age < 65) ageScore = 55 + ((age - 55) / 10) * 20;
  else ageScore = 85 + Math.min(15, ((age - 65) / 20) * 15);

  const sexModifier = sex === "Female" ? 5 : 0;
  let bmiModifier = 0;
  if (bmi > 30) bmiModifier = 25;
  else if (bmi > 25) bmiModifier = ((bmi - 25) / 5) * 15.5;
  else if (bmi < 18.5) bmiModifier = 5;

  return Math.min(
    100,
    Math.max(0, ageScore + sexModifier + bmiModifier + (hasFamilyHistory ? 10 : 0)),
  );
};

export const calcS = (symptoms, duration) => {
  const normalizedSymptoms = Array.isArray(symptoms) ? symptoms : [];
  const hasChestPain = normalizedSymptoms.some(
    (symptom) => symptom.toLowerCase().includes("chest") || symptom.includes("বুক"),
  );
  const hasDizziness = normalizedSymptoms.some(
    (symptom) => symptom.toLowerCase().includes("dizz") || symptom.includes("মাথা"),
  );
  const days = Math.max(1, Number(duration) || 1);

  if (hasChestPain && hasDizziness) {
    return 72 + Math.min(28, Math.max(0, days - 3) * 2);
  }
  if (hasChestPain) return 60 + Math.min(12, days);
  if (hasDizziness) return 40 + Math.min(10, days);
  if (normalizedSymptoms.length > 0) return 30 + Math.min(10, normalizedSymptoms.length * 2);
  return 10;
};

export const calcL = (smoker, sedentary, poorDiet) => {
  let score = 10;
  if (smoker) score += 30;
  if (sedentary) score += 25;
  if (poorDiet) score += 20;
  return Math.min(100, score);
};

export const calculateRisk = (draft, values) => {
  const factors = {
    D: calcD(values.glucose),
    H: calcH(values.systolic, values.diastolic),
    A: calcA(
      values.age,
      draft.sex,
      values.weight,
      values.height,
      draft.hasFamilyHistory,
    ),
    S: calcS(draft.symptomsList, draft.durationDays),
    L: calcL(draft.smoker, draft.sedentary, draft.poorDiet),
  };

  let riskScore =
    (0.30 * factors.D) +
    (0.25 * factors.H) +
    (0.20 * factors.A) +
    (0.15 * factors.S) +
    (0.10 * factors.L);

  let riskTier = "GREEN";
  if (riskScore >= 30) riskTier = "AMBER";
  if (riskScore >= 65) riskTier = "RED";

  const flags = draft.criticalFlags || {};
  const criticalOverride =
    values.spo2 < 90 ||
    values.systolic >= 180 ||
    values.systolic < 80 ||
    flags.chestPain ||
    flags.speechDiff ||
    flags.alteredCon;

  if (criticalOverride) {
    riskTier = "CRITICAL";
    riskScore = Math.max(riskScore, 85);
  }

  return {
    factors,
    riskScore: Math.min(100, Math.max(0, riskScore)),
    riskTier,
  };
};
