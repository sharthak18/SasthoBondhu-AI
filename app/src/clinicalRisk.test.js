import test from "node:test";
import assert from "node:assert/strict";
import { calcS, calculateRisk, validateVitals } from "./clinicalRisk.js";

const draft = {
  age: 52,
  sex: "Female",
  hasFamilyHistory: false,
  smoker: false,
  sedentary: true,
  poorDiet: true,
  symptomsList: ["Chest palpitation", "Dizziness"],
  durationDays: 3,
  criticalFlags: { chestPain: false, speechDiff: false, alteredCon: false },
  vitals: {
    systolic: 162,
    diastolic: 98,
    glucose: 9.4,
    spo2: 97,
    weight: 61,
    height: 150,
  },
};

test("validates and scores the worked demo without hidden defaults", () => {
  const validation = validateVitals(draft);
  assert.equal(validation.isValid, true);

  const result = calculateRisk(draft, validation.values);
  assert.equal(result.riskTier, "RED");
  assert.ok(result.riskScore >= 65);
});

test("rejects blank and implausible measurements", () => {
  const validation = validateVitals({
    ...draft,
    age: "",
    vitals: { ...draft.vitals, systolic: "", spo2: 140 },
  });

  assert.equal(validation.isValid, false);
  assert.match(validation.errors.age, /required/);
  assert.match(validation.errors.systolic, /required/);
  assert.match(validation.errors.spo2, /between/);
});

test("requires systolic pressure to exceed diastolic pressure", () => {
  const validation = validateVitals({
    ...draft,
    vitals: { ...draft.vitals, systolic: 80, diastolic: 100 },
  });

  assert.equal(validation.isValid, false);
  assert.match(validation.errors.systolic, /higher/);
});

test("critical flags override the demonstration score", () => {
  const criticalDraft = {
    ...draft,
    criticalFlags: { ...draft.criticalFlags, speechDiff: true },
  };
  const validation = validateVitals(criticalDraft);
  const result = calculateRisk(criticalDraft, validation.values);

  assert.equal(result.riskTier, "CRITICAL");
  assert.ok(result.riskScore >= 85);
});

test("acute chest symptoms are not discounted for short duration", () => {
  assert.equal(calcS(["Chest pain", "Dizziness"], 1), 72);
});
