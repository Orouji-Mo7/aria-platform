# ARIA — Adaptive Risk Intelligence for Acute Care

> Klinische Entscheidungsunterstützung, entwickelt für Pflegekräfte.

![Status](https://img.shields.io/badge/status-MVP-F5A623)
![Next.js](https://img.shields.io/badge/Next.js-16-000000)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4)
![License](https://img.shields.io/badge/license-Proprietary-E8445A)

---

## Vision

ARIA is a clinical decision support system (CDSS) built from the ground up for the people who carry the load in acute and intensive care: nursing staff. The platform continuously consolidates vital signs, lab results, and nursing context into explainable risk scores and prioritized recommendations — surfacing clinical deterioration earlier, reducing documentation burden, and keeping clinical authority where it belongs: with the human at the bedside.

Existing CDSS tools (Epic Sepsis Watch, Bayesian Health, Sana AI) are designed around physician workflows and reach nursing acceptance rates below 40 %. ARIA closes that structural gap. Three explicit goals: **early warning** of clinical deterioration with a measurable lead time (median 4 hours ahead of standard scores), **15–25 % reduction** in documentation-driven nursing workload, and **per-datapoint explainability** — a precondition for both clinical adoption and MDR certification.

## Core Features

| Feature | What it does |
|---|---|
| Risk-prioritized ward dashboard | All patients of the shift, sorted by clinical urgency |
| Live vital monitoring | Trend curves from wearables and EHR, ~30 s refresh |
| Explainable AI recommendation | Recommendation plus top-3 weighted factors (SHAP) |
| SBAR handover assistant | Auto-generated shift handover from longitudinal data |
| Anomaly detection | Subtle deviations from a patient's personal baseline |
| Audit trail | Append-only log with hash-chain for full traceability |

## Tech Stack

| Layer | Stack | Status |
|---|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4 | **In MVP** |
| Backend (core) | Node.js + Fastify, OpenAPI-generated clients | Planned |
| Backend (ML) | Python + FastAPI, ONNX Runtime, MLflow | Planned |
| Database | PostgreSQL (Neon EU), Redis, Object Storage (Hetzner) | Planned |
| ML stack | XGBoost (risk), Temporal Fusion Transformer (forecast), German Medical BERT (NLP) | Planned |
| Interop | HAPI FHIR R4 gateway, HL7 v2.5, MQTT for bedside sensors | Planned |
| Hosting | Vercel (frontend, EU regions) + Hetzner Cloud Falkenstein (backend, GPU) | Planned |
| Auth | Auth.js + Microsoft Entra ID (clinic AD integration) | Planned |

Full rationale and architectural decisions: see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Quickstart

```bash
git clone https://github.com/Orouji-Mo7/aria-platform.git
cd aria-platform
npm install
npm run dev
```

The dev server starts on [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm run start
```

## ⚠ Status

> **MVP — frontend only.** This repository currently ships the dashboard shell with **synthetic data only**. There is no real patient context, no EHR integration, no live ML pipeline, and no certified medical-device functionality. ARIA is **not** approved as a medical product and must not be used for clinical decision-making.

Roadmap, certification path (CE Class IIa under MDR), data architecture, and security model are documented in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Documentation

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — full technical architecture, product specification, business model, and roadmap (German)

## Author

**Mohammad Orouji**
M.Sc. Digital Health Management — MSH Medical School Hamburg
Background: Pflegefachkraft (20+ years of clinical practice) · Fachinformatiker für Anwendungsentwicklung (IHK 2025)

ARIA is built on the conviction that clinical software for nurses should be designed by people who have stood at the bedside.

## License

**Proprietary — All Rights Reserved (subject to change).**
Copyright © 2026 Mohammad Orouji. See [LICENSE](./LICENSE) for details.
