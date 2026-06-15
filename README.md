# ShasthoBondhu AI Demo

A React/Vite showcase of a community health worker screening flow and a
synthetic district dashboard.

## Safety and scope

This repository is a user-interface prototype, not a medical product.

- All people, records, scores, facilities, and dashboard metrics are synthetic.
- The voice, parser, guidance, referral, sync, SMS, and PDF flows are simulations.
- The risk index is a hand-authored heuristic. It is not a trained or clinically
  validated AI model and must not be used for diagnosis, triage, or treatment.
- No backend, authentication, encryption, audit log, device integration, or
  durable patient database is implemented.
- Patient-like demo records remain in memory and are discarded on page refresh.
  Only non-sensitive UI preferences are stored in `localStorage`.

Before any field or clinical use, the intended workflow, thresholds, evidence,
human oversight, privacy controls, and regulatory status require review by
qualified clinicians, security/privacy specialists, and applicable authorities.

Useful governance references:

- [WHO: Ethics and governance of AI for health](https://www.who.int/publications/i/item/9789240029200)
- [WHO: Regulatory considerations on AI for health](https://www.who.int/publications/i/item/9789240078871)
- [FDA: Clinical Decision Support Software](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software)

## Run locally

Requires a Node.js version supported by Vite 8.

```bash
npm install
npm run dev
```

Open the URL printed by Vite.

## Verification

```bash
npm run lint
npm test
npm run build
```

Run all three with:

```bash
npm run check
```

## Current architecture

- `src/App.jsx`: showcase screens and in-memory UI state
- `src/clinicalRisk.js`: validated demonstration scoring logic
- `src/clinicalRisk.test.js`: scoring and input-validation tests
- `src/data.js`: synthetic presets and dashboard fixtures

## Production gaps

The next engineering phase should start with clinical protocol ownership and a
threat model, then add authentication/authorization, consent, encrypted storage,
an audited backend, offline conflict handling, observability, accessibility
testing, end-to-end tests, and independent clinical validation. The large
`App.jsx` should also be split by screen as the prototype grows.
