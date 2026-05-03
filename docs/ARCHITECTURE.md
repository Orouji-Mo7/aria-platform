# ARIA — Technical Architecture & Product Specification

**Adaptive Risk Intelligence for Acute Care**
Version 1.0 · Stand April 2026

---

## 1. Projektname & Vision

**ARIA** ist eine produktionsreife klinische Entscheidungsunterstützungs-Plattform (CDSS), die Pflegekräfte in Akut- und Intensivversorgung in Echtzeit unterstützt. Das System verdichtet kontinuierlich erfasste Vitaldaten, Laborwerte und Pflegekontext zu erklärbaren Risikoscores und priorisierten Handlungsempfehlungen.

Vision: ARIA ist die erste Plattform, deren klinische Logik konsequent aus pflegerischer Perspektive entwickelt wurde – nicht ärztlich adaptiert. Damit adressiert sie eine strukturelle Lücke im Markt: bestehende CDSS-Lösungen (Epic Sepsis Watch, Bayesian Health, Sana AI) zielen auf ärztliche Workflows und erreichen unter Pflegenden Akzeptanzraten von unter 40%.

Das Produkt verfolgt drei klare Ziele:

1. **Frühwarnung** vor klinischen Verschlechterungen mit messbarem Vorlauf (Median 4 Stunden vor Standard-Score-Triggern)
2. **Reduktion** der dokumentationsbedingten Pflegezeitlast um nachweisbare 15–25%
3. **Erklärbarkeit** jeder Empfehlung auf Datenpunkt-Ebene – als Voraussetzung für klinische Akzeptanz und MDR-Zertifizierung

---

## 2. Problem & Relevanz

Drei strukturelle Probleme machen ARIA notwendig:

**Datenparadox in der Pflege.** Pflegekräfte erfassen den größten Teil aller patientennahen Vitaldaten, haben aber den schlechtesten Zugang zu integrierter Auswertung. Vitalwerte landen in PDMS oder Papierbögen, Verhaltensbeobachtungen in Freitextfeldern, Wearable-Daten gar nicht. Die Folge: klinische Verschlechterungen sind retrospektiv nachweisbar, prospektiv aber selten erkennbar.

**Sepsis als Indikatorproblem.** Sepsis verursacht in Deutschland jährlich rund 75.000 vermeidbare Todesfälle. Die zentrale Variable für Outcomes ist die Zeit bis zur Erst-Therapie ("Time to Antibiotics"). Studien (Seymour et al., NEJM 2017) zeigen einen Mortalitätsanstieg von 4–7% pro Stunde Verzögerung. qSOFA und SIRS sind als Frühwarnscores etabliert, aber spät – sie triggern, wenn klinische Auffälligkeiten bereits manifest sind.

**Strukturelle Überlastung.** Bis 2035 fehlen in Deutschland rund 500.000 Pflegefachkräfte (Bertelsmann, 2023). Gleichzeitig steigt die Patientenkomplexität durch demografischen Wandel und Multimorbidität. Eine Skalierung über zusätzliche Stellen ist nicht mehr realistisch – die einzige systemisch tragfähige Antwort ist die Augmentierung vorhandener Kompetenz durch Software.

ARIA adressiert alle drei Probleme gleichzeitig: Datenintegration → Frühwarnung → Workflow-Entlastung.

---

## 3. Lösung (Produktbeschreibung)

ARIA besteht aus drei integrierten Komponenten, die als ein Produkt erlebt werden:

**ARIA Watch — Datenebene.** Kontinuierliche Aggregation klinisch relevanter Datenströme: KIS/EHR via FHIR R4, Wearables via Hersteller-APIs (Apple HealthKit, Garmin Health, Withings), Bettkantensensoren via HL7 v2 oder MQTT, Laborsysteme via HL7 ORU-Messages. Die Datenpipeline normalisiert auf FHIR-Ressourcen und persistiert pseudonymisiert.

**ARIA Think — Inferenzebene.** Mehrschichtige ML-Pipeline (Details in Abschnitt 5), die kontinuierlich Risikoscores berechnet. Output ist nicht "Diagnose" sondern "Pflege-Aktion mit Begründung". Beispiel: Statt "Sepsis-Verdacht" liefert ARIA "Erweiterte Vitalkontrolle alle 30 Minuten, Laborabnahme prüfen, ärztliche Visite priorisieren — Begründung: HF-Anstieg 18% bei SpO₂-Abfall 5% über 4h."

**ARIA Flow — Interaktionsebene.** Die Pflegeoberfläche selbst. Stationsdashboard mit risikopriorisierten Patientenkacheln, Patientendetail mit Vitaltrends und KI-Empfehlungen, automatische SBAR-Schichtübergabe (NLP-generiert, von Pflegekraft validiert), Sprachsteuerung für sterile Umgebungen.

Das Produkt ist als Web-Anwendung (Progressive Web App) gebaut und läuft auf jedem Tablet, Stations-PC oder Smartphone. Optional als Native-Wrapper für iOS/Android (geplant Q3 2027).

---

## 4. Kernfeatures

| Feature | Funktion | Technische Basis |
|---|---|---|
| **Risikopriorisiertes Stationsdashboard** | Alle Patienten der Schicht, sortiert nach klinischer Dringlichkeit | React + Tailwind, Server-side Risk-Scoring |
| **Live-Vitalmonitoring** | Trendkurven aus Wearables und EHR, 30s-Aktualisierung | WebSocket-Streaming, IndexedDB-Caching |
| **Erklärbare KI-Empfehlung** | Empfehlung + 3 Top-Faktoren mit Gewichtung | XGBoost + SHAP-Werte |
| **SBAR-Übergabeassistent** | Auto-generierte Schichtübergabe aus Verlaufsdaten | German Medical BERT + Template-Engine |
| **Anomalieerkennung** | Subtile Abweichungen vom Patienten-Baseline | Isolation Forest pro Patient |
| **Audit-Trail** | Vollständige Nachvollziehbarkeit aller Datenzugriffe | Append-Only Postgres mit Hash-Chain |
| **Offline-Modus** | Schichtübersicht funktioniert ohne Internetverbindung | Service Worker + IndexedDB |
| **DSGVO-Workflows** | Auskunft, Berichtigung, Löschung patientenseitig | RBAC + automatisierte Datenextraktion |

---

## 5. KI-Komponenten

Die KI in ARIA ist nicht ein einzelnes Modell, sondern eine orchestrierte Pipeline aus drei spezialisierten Komponenten. Jede ist gezielt für ihren Anwendungsfall gewählt – generische Large Language Models erfüllen weder die Erklärbarkeits- noch die Datenschutzanforderungen klinischer Software.

### 5.1 Risikoklassifikation (XGBoost-Ensemble)

**Aufgabe:** Berechnung von Risikoscores (0–1) für vier klinische Endpunkte: Sepsis, Sturz, Dekubitus, kardiale Dekompensation.

**Modell:** Gradient Boosted Trees (XGBoost 2.x), eines pro Endpunkt. XGBoost wurde gewählt, weil:
- Tabular Data (Vitals + Demografie + Labor) ist sein Stärkenbereich – State-of-the-Art in klinischen Prädiktionsstudien (siehe MIMIC-III Benchmarks)
- Inferenzzeit unter 50ms pro Patient möglich – kompatibel mit Echtzeitanforderung
- SHAP-kompatibel, was native Erklärbarkeit ermöglicht
- Robust gegen fehlende Werte – Realität in klinischen Daten

**Trainingsdaten:** Initial-Training auf MIMIC-IV (öffentlicher ICU-Datensatz, MIT, ~300.000 Patienten). Anschließend Fine-Tuning auf pseudonymisierte Daten der Pilotklinik. Modellversionierung über MLflow.

**Output:** Risikoscore + SHAP-Werte für die Top-5 einflussreichsten Features.

### 5.2 Zeitreihenprognose (Temporal Fusion Transformer)

**Aufgabe:** Prognose der nächsten 6 Stunden für kontinuierliche Vitalwerte (HR, SpO₂, BP, Temp, RR).

**Modell:** Temporal Fusion Transformer (TFT) — kombiniert LSTM-Kodierung mit Self-Attention. Vorteil gegenüber reinem LSTM: TFT modelliert sowohl statische Features (Alter, Diagnosen) als auch dynamische (Vitalverlauf) und ist robust bei unregelmäßigen Messintervallen — typisch für Stationsdaten.

**Training:** PyTorch Lightning, Cloud-Training auf Hetzner GPU-Instanzen (RTX 4090). Training-Pipeline ist reproduzierbar via DVC (Data Version Control).

**Inferenz:** ONNX Runtime auf Backend-Servern, ~80ms pro Patient.

### 5.3 NLP für Pflegedokumentation (German Medical BERT)

**Aufgabe:** Zwei Use Cases — strukturierte Datenextraktion aus Pflegefreitext, automatische SBAR-Übergabengenerierung.

**Modell:** Geistware/medbert-512 (German Medical BERT, fine-tuned auf medizinischer Fachsprache). Kein US-Cloud-LLM, kein OpenAI — aus DSGVO- und Souveränitätsgründen zwingend.

**Hosting:** Self-hosted via Hugging Face Text Generation Inference (TGI) auf Hetzner GPU-Instanz (Falkenstein, DE). Patientendaten verlassen niemals deutsche Server.

**Erklärbarkeit:** Attention-Visualisierung zeigt der Pflegekraft, welche Textpassagen das Modell als entscheidend wertet.

### 5.4 Erklärbarkeit als Architekturprinzip

Jede ARIA-Empfehlung wird mit drei Erklärungsebenen ausgeliefert:

1. **Faktorebene:** Welche Datenpunkte haben den Score am stärksten beeinflusst (SHAP/Attention)
2. **Trendebene:** Wie hat sich der Score über die letzten Stunden entwickelt
3. **Kontextebene:** Welche vergleichbaren Patienten lagen historisch ähnlich und wie war deren Verlauf

Damit ist die Voraussetzung für die spätere CE-Zertifizierung als Medizinprodukt Klasse IIa nach MDR Annex VIII Rule 11 erfüllt.

---

## 6. Systemarchitektur

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                             │
│  Progressive Web App (Next.js 16, App Router, TypeScript)        │
│  ├─ Tailwind CSS + Custom Design Tokens                          │
│  ├─ TanStack Query (Server State, Caching)                       │
│  ├─ Service Worker (Offline-Support)                             │
│  └─ IndexedDB (Patient-Cache, max. Schichtdauer)                 │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTPS / WebSocket (TLS 1.3)
┌────────────────────────▼─────────────────────────────────────────┐
│                        API GATEWAY                                │
│  Vercel Edge (Frontend) ──┬── Hetzner Cloud (Backend, EU)        │
│                           │                                       │
│  Auth: Auth.js + Microsoft Entra ID (Klinik-AD-Integration)      │
│  Rate Limiting: Cloudflare                                        │
└────────────────────────┬─────────────────────────────────────────┘
                         │
        ┌────────────────┼─────────────────────┐
        │                │                     │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────────▼──────────┐
│  CORE API    │  │  ML API     │  │  FHIR GATEWAY       │
│  Node.js +   │  │  Python +   │  │  HAPI FHIR R4       │
│  Fastify     │  │  FastAPI    │  │  (Java, Open Source)│
│              │  │             │  │                     │
│  ▸ Auth      │  │  ▸ XGBoost  │  │  ▸ EHR-Sync (HL7)   │
│  ▸ CRUD      │  │  ▸ TFT      │  │  ▸ Lab-Sync         │
│  ▸ Audit     │  │  ▸ med-BERT │  │  ▸ Wearable-Bridge  │
└───────┬──────┘  └──────┬──────┘  └──────────┬──────────┘
        │                │                     │
        └────────────────┼─────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                      DATA LAYER                                   │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │  PostgreSQL  │  │  Redis       │  │  Object Storage  │       │
│  │  (Neon EU)   │  │  (Cache,     │  │  (Hetzner SX)    │       │
│  │              │  │  Pub/Sub)    │  │  Modell-Artefakte│       │
│  │  ▸ Users     │  │              │  │  Audit-Logs      │       │
│  │  ▸ Tenants   │  │  ▸ Sessions  │  │                  │       │
│  │  ▸ Audit     │  │  ▸ Rate Lim. │  │                  │       │
│  └──────────────┘  └──────────────┘  └──────────────────┘       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  HAPI FHIR Database (PostgreSQL Schema)              │       │
│  │  Patient · Observation · Encounter · Condition       │       │
│  └──────────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                  INTEGRATION LAYER (External)                     │
│                                                                   │
│  KIS/EHR       ─ FHIR R4 (Orbis, ish.med, Nexus)                │
│  Laborsystem   ─ HL7 v2.5 ORU                                    │
│  Wearables     ─ Apple HealthKit, Garmin Health, Withings        │
│  Bettsensoren  ─ MQTT v5 (z.B. Biobeat, Drägerwerk)             │
└──────────────────────────────────────────────────────────────────┘
```

### 6.1 Technologie-Entscheidungen mit Begründung

| Layer | Technologie | Warum |
|---|---|---|
| Frontend Framework | Next.js 16 (App Router) | Server Components reduzieren Client-Bundle, native PWA-Support, Vercel-Deployment-Pipeline |
| Sprache | TypeScript strict mode | Typsicherheit ist im klinischen Kontext nicht optional |
| Styling | Tailwind CSS + Design Tokens | Konsistentes Design-System, kein CSS-Sprawl, schnelle Iterationen |
| Backend Core | Node.js + Fastify | Höchste Throughput-Werte unter Node-Frameworks, TypeScript-nativ, OpenAPI-Generation |
| ML-Backend | Python + FastAPI | Python ist die Lingua franca des ML-Ökosystems – Trennung von Core und ML reduziert Komplexität |
| Datenbank | PostgreSQL (Neon EU) | Bewährt, JSONB-Support für FHIR-Ressourcen, EU-Region zwingend |
| FHIR-Server | HAPI FHIR | Open Source, gewartet von Smile CDR, vollständige R4-Unterstützung |
| Cache | Redis | Sub-ms Pub/Sub für WebSocket-Updates, Session-Storage |
| Auth | Auth.js + Microsoft Entra ID | Standard im deutschen Klinik-Umfeld, OIDC-konform |
| Hosting Frontend | Vercel | CI/CD aus Git, Edge Functions, EU-Regionen verfügbar |
| Hosting Backend | Hetzner Cloud (Falkenstein, DE) | EU-Datenresidenz Pflicht, Preisleistung exzellent, GPU-Instanzen verfügbar |
| Monitoring | Grafana + Prometheus + Loki | Open Source, self-hosted, keine US-Cloud-Telemetrie |

### 6.2 Sicherheits- und DSGVO-Architektur

ARIA folgt dem Privacy-by-Design-Prinzip nach DSGVO Art. 25:

- **Verschlüsselung in transit:** TLS 1.3 zwingend, HSTS, Certificate Pinning für native Apps
- **Verschlüsselung at rest:** AES-256 auf Datenbank- und Object-Storage-Ebene
- **Pseudonymisierung:** Patientendaten werden vor Eintritt in die ML-Pipeline pseudonymisiert. Re-Identifikation nur über separaten Schlüsselservice (4-Augen-Prinzip)
- **Datenresidenz:** 100% EU. Kein Datenfluss in Drittländer. Vertragspartner (Vercel, Neon) konfiguriert auf EU-Regionen
- **Audit-Trail:** Jeder Datenzugriff (Lesen, Schreiben, Löschen) wird in eine Append-Only-Logtabelle mit Hash-Chain geschrieben (BSI-Grundschutz APP.4.4)
- **Zero Trust:** Jeder API-Call erfordert JWT mit Rolle, kein impliziter Vertrauen zwischen Services
- **Datenminimierung:** Pflegekräfte sehen nur Patienten ihrer Station und Schicht, Ärzte nur ihre Patienten
- **Recht auf Vergessen:** Automatisierter Workflow für DSGVO Art. 17 Anfragen mit kaskadierender Löschung
- **AVV-Verträge:** Für Pilotpartner standardisierter AVV nach DSGVO Art. 28

### 6.3 Mandantenfähigkeit (Multi-Tenancy)

Die Datenbankarchitektur ist von Beginn an mandantenfähig ausgelegt:

- **Tenant-Isolation:** Logische Trennung über `tenant_id` in jeder Tabelle, mit Row-Level-Security (Postgres RLS)
- **Custom Subdomains:** Jede Klinik bekommt eine dedizierte Subdomain (`klinik-x.aria-platform.de`)
- **Datenresidenz pro Mandant:** Auf Wunsch dedizierte Datenbankinstanz (Enterprise-Tier)

---

## 7. UX/UI Beschreibung

ARIA folgt drei UX-Prinzipien:

**Glanceability vor Vollständigkeit.** Eine Pflegekraft hat in einer kritischen Situation keine 30 Sekunden. Das Stationsdashboard kommuniziert klinische Dringlichkeit in unter zwei Sekunden, durch Farbcodierung, Größenhierarchie und räumliche Anordnung.

**Erklärung statt Befehl.** Jede KI-Ausgabe wird als Empfehlung formuliert, nie als Anweisung. Pflegerische Hoheit bleibt erhalten — die Software unterstützt, entscheidet aber nicht.

**Ein-Hand-Bedienung.** Stations-Tablets werden meist einhändig genutzt. Alle kritischen Aktionen sind im unteren Drittel des Screens platziert (Daumenbereich), Hauptaktionen niemals durch Modaldialoge unterbrochen.

### 7.1 Designsprache

```
Farbsystem
─────────────────────────────────────────────
Background       #0A0E1A   Deep Navy
Surface          #11172A
Surface Elevated #1A2238
Border subtle    #1F2940
Foreground       #F1F4FA

Vital (Aktion)   #00C896   Vital Green
Warning          #F5A623   Amber
Critical         #E8445A   Alert Red
Muted            #8A93A8

Typography
─────────────────────────────────────────────
Sans (UI)        Geist Sans / Inter
Mono (Vitals)    Geist Mono / JetBrains Mono
```

Die Farbwahl ist klinisch durchdacht: Rot signalisiert Aktion, nicht Gefahr. Amber bedeutet Beobachtung, nicht Ablenkung. Grün ist Vertrauen, nicht "alles ok". Pflegekräfte mit Rot-Grün-Schwäche werden über zusätzliche Iconographie und Statusdots adressiert (WCAG 2.2 AA-Konformität ist Mindestanspruch).

### 7.2 Kerninterfaces

**Pflegeansicht — Stationsdashboard.** Risikopriorisiertes Kachelraster aller Patienten der Schicht. Jede Kachel: Name, Zimmer, Status-Dot, Top-3-Risiken, nächste fällige Maßnahme. Tap-Geste öffnet Patientendetail.

**Pflegeansicht — Patientendetail.** Vitalkurven der letzten 24 Stunden, KI-Empfehlung mit Begründung, Maßnahmenliste mit One-Tap-Dokumentation, integrierte Sprachsteuerung für Eintragungen.

**Pflegeansicht — Schichtübergabe.** Auto-generierte SBAR-Strukturierung aus Verlaufsdaten und Pflegedokumentation. Pflegekraft validiert oder korrigiert. Export als PDF oder direkter Sync ins KIS.

**Arztansicht — Aggregierte Stationssicht.** Read-only Übersicht aller kritischen Patienten, Filterbar nach Risikodimension, Direktlink in das KIS für Vollkontext.

**Admin-Ansicht — Tenant-Management.** Stationskonfiguration, Personalverwaltung, Audit-Log-Zugriff, KI-Modellversion-Tracking.

### 7.3 Accessibility

- WCAG 2.2 Level AA als Mindestanforderung
- Keyboard-Navigation für alle Funktionen
- Screen-Reader-Support (ARIA-Live-Regions für Vitalwert-Updates)
- Schriftgrößenskalierung 100–200% ohne Layoutbruch
- Hochkontrastmodus für Lichtumgebungen mit niedrigem Lux-Wert (Nachtschicht)

---

## 8. Demo-Setup

Für Pitch-Situationen, Bewerbungsgespräche und akademische Präsentationen ist ARIA als reproduzierbare Demo-Umgebung konzipiert.

### 8.1 Demo-Komponenten

```
aria-platform/
├── app/                    Next.js Frontend (PWA)
├── services/
│   ├── core-api/           Node.js Fastify Backend
│   ├── ml-api/             Python FastAPI mit Mock-Modellen
│   └── fhir-gateway/       HAPI FHIR Server
├── infra/
│   ├── docker-compose.yml  Lokales Komplett-Setup
│   └── seed-data/          Synthetische Patienten (Synthea)
└── docs/
    ├── ARCHITECTURE.md     Dieses Dokument
    └── DEMO-GUIDE.md       Schritt-für-Schritt-Demo
```

### 8.2 Lokaler Demo-Start (Docker Compose)

Voraussetzung: Docker Desktop, 8 GB RAM, freier Port 3000.

```bash
git clone https://github.com/Orouji-Mo7/aria-platform.git
cd aria-platform
docker compose up -d
docker compose exec core-api npm run seed:demo
```

Nach ca. 90 Sekunden ist die Demo-Umgebung verfügbar unter `http://localhost:3000` mit:

- 50 simulierten Patienten (generiert via Synthea, dem Open-Source-FHIR-Patient-Generator des MITRE-Korporation)
- 4 simulierte Stationen
- 3 vorbereitete klinische Szenarien (Sepsis-Frühwarnung, Dekubitus-Risiko, Sturz-Prävention)
- Realtime-Simulator: pumpt synthetische Vitalzeichen alle 30 Sekunden in die Datenbank

### 8.3 Demo-Szenarien

**Szenario A — Sepsis-Frühwarnung.** Patient*in 78 J., postoperativ Tag 2. ARIA erkennt steigende HF und fallende SpO₂ über 4 Stunden, generiert Empfehlung 6 Stunden vor qSOFA-Trigger.

**Szenario B — Dekubitus-Prävention.** Bettlägerige Patient*in, Lagerungswechsel überfällig. ARIA priorisiert die Aufgabe in der Schichtansicht und liefert Braden-Score-Trend.

**Szenario C — SBAR-Schichtübergabe.** ARIA generiert eine vollständige SBAR-Übergabe für eine 8-Stunden-Schicht aus Vitaldaten und Pflegedokumentation. Pflegekraft validiert und exportiert.

### 8.4 Online-Demo

Für Pitches ohne Setup-Möglichkeit ist eine gehostete Demo-Instanz unter `https://aria-platform.vercel.app` verfügbar (Frontend mit Mock-Backend, ohne reale Patientendaten).

### 8.5 Offline-Tauglichkeit

Service Worker und IndexedDB sorgen dafür, dass die Schichtübersicht auch bei Netzwerkausfall funktional bleibt. Letzte 8 Stunden Vitaldaten und alle aktiven Empfehlungen sind offline verfügbar. Schreibvorgänge werden gepuffert und bei Wiederherstellung der Verbindung synchronisiert.

---

## 9. Business Model

ARIA verfolgt ein B2B-SaaS-Modell mit dreistufiger Tier-Struktur.

### 9.1 Tier-Struktur

| Tier | Zielkunde | Pricing | Features |
|---|---|---|---|
| **Pilot** | Erste 5 Kliniken | 0€ für 6 Monate | Volle Funktionalität, Co-Development, Dateneignung für Modell-Refinement |
| **Standard** | Mittelgroße Kliniken (200–800 Betten) | 8–12€ pro Bett/Monat | Cloud-Hosting, Standard-SLA 99.5%, Standardintegrationen |
| **Enterprise** | Großkliniken, Universitätskliniken | 15€ pro Bett/Monat + 15.000–50.000€ Setup | On-Premise-Option, Custom-Integrationen, dediziertes Modell-Fine-Tuning, SLA 99.9% |

### 9.2 Marktpotenzial

Adressierbarer Markt Deutschland:

- ~1.900 Krankenhäuser mit Ø 200 Betten = 380.000 Pflegebetten
- Bei nur 10% Marktdurchdringung im Standard-Tier: 38.000 × 10€ × 12 = **45,6 Mio. € jährlich**
- Erweiterung auf Pflegeheime (~15.000 Einrichtungen) verdreifacht den TAM

### 9.3 Unit Economics

Konservativ kalkuliert:

- **CAC (Customer Acquisition Cost):** 8.000€ pro Klinik (Vertrieb, Pilot, Onboarding)
- **ARPU (Annual Revenue per User):** 28.800€ (300 Betten × 8€ × 12)
- **Gross Margin:** ~70% nach Hosting, Lizenzen, Support
- **Payback Period:** 4 Monate

### 9.4 Co-Finanzierung über Krankenkassen

Das Präventionsgesetz (§ 20 SGB V) und das Krankenhauspflegeentlastungsgesetz (PpUGV) eröffnen perspektivisch direkte Kofinanzierung durch Kostenträger. Für ARIA relevant:

- **InEK-Zusatzentgelt** für nachweislich risikoreduzierende Tools (Antrag ab 2027 realistisch)
- **DiGA-Zertifizierung** als Fernbehandlungs-Komponente (mittelfristig, nach CE-Zertifizierung)

### 9.5 Differenzierung im Wettbewerb

| Wettbewerber | Fokus | ARIA-Vorteil |
|---|---|---|
| Epic Sepsis Watch | Ärztlich, US-zentriert | Pflegefokus, EU-konform, modular |
| Bayesian Health | Generisch CDSS | Pflege-Workflow, deutsche Klinik-Integration |
| Sana AI | Generalist-Plattform | Klinische Tiefe, MDR-Pfad |
| Augnito | Sprachdokumentation | Predictive-Layer, Risikomanagement |

Das nachhaltige Differenzierungsmerkmal ist die Kombination aus **klinischer Domänenexpertise (20+ Jahre Pflegepraxis im Gründerteam)** und **technischer Umsetzungstiefe** — eine Kombination, die im aktuellen Markt nicht repliziert wird.

---

## 10. Implementierungs-Roadmap

Die Roadmap ist auf einen Solo-Founder mit zeitversetzter Skalierung ausgelegt — bewusst konservativ, da klinische Software keine Hacker-Ethik verträgt.

```
2026
─────────────────────────────────────────────────────────────
Q1   ✓ MVP-Frontend (Next.js, Mock-Daten)        [erledigt]
Q1   ✓ Architecture Decision Document            [erledigt]
Q2   · Backend-Skeleton (Fastify + Postgres)
     · FHIR-Gateway (HAPI FHIR Local)
     · Erste ML-Pipeline (XGBoost auf MIMIC-IV)
     · DSGVO-Compliance-Audit (extern)
Q3   · Pilotvertrag mit 1 Hamburger Klinik
     · Datenakquise (synthetisch + pseudonymisiert)
     · Modell-Refinement auf Pilot-Daten
     · Pen-Test durch zertifizierten Anbieter
Q4   · Pilot-Go-Live (1 Station, beobachtende Phase)
     · NLP-Modul für SBAR-Übergaben
     · Evaluation: klinische Endpunkte (Sepsis-Detect-Time)
     · Wissenschaftliche Begleitung (Publikation in Vorbereitung)

2027
─────────────────────────────────────────────────────────────
Q1   · Mandantenfähigkeit (Multi-Tenant ausrollen)
     · Skalierung auf 3 Pilotkliniken
     · Seed-Finanzierungsrunde (Ziel: 800k–1.5M €)
     · Team-Aufbau: ML-Engineer, Klinik-Sales, QM-Beauftragte
Q2   · CE-Klasse-IIa-Zertifizierungspfad (MDR Annex IX)
     · Benannte Stelle ausgewählt (TÜV Süd / DEKRA)
     · QM-System nach ISO 13485 implementiert
Q3-4 · Erste zahlende Standard-Tier-Kunden
     · Wearable-Integrationen (Apple, Garmin, Withings)
     · Series-A-Vorbereitung

2028
─────────────────────────────────────────────────────────────
Q1   · CE-Zertifizierung erteilt
     · Markteintritt DACH (DE, AT, CH)
     · Native iOS/Android-Apps (Capacitor-Wrapper)
Q2-4 · Skalierung auf 50+ Kliniken
     · DiGA-Antrag vorbereitet
     · Series-A geschlossen (Ziel: 5–8M €)
```

### 10.1 Kritische Risiken und Mitigationsstrategien

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| MDR-Zertifizierung verzögert | Mittel | Hoch | Frühzeitige QM-Einbindung, modulares Klassifikationskonzept |
| Datenakquise scheitert | Mittel | Sehr hoch | Synthetische Daten + Pilotvertrag mit Datenklausel |
| KI-Modell unter klinischer Erwartung | Niedrig | Hoch | Transparente Confidence-Intervalle, kein Auto-Treat |
| Personalmangel | Hoch | Mittel | Remote-First, EU-weite Talentakquise |
| Hyperscaler-Lock-in | Niedrig | Mittel | Kubernetes-Portierbarkeit von Beginn an |

### 10.2 Förderlandschaft (Deutschland)

Realistische Förderquellen für die Frühphase:

- **EXIST-Gründerstipendium** (BMWK) – 12 Monate, ca. 30k€
- **Hamburg Invest InnoFounder** – bis 75k€ für innovative Hamburger Gründungen
- **Health-Hub.de** Acceleratorprogramm – Mentoring + 25k€ Pre-Seed
- **EIT Health** EU-Programme – bis 100k€ für klinisch-fundierte Startups
- **High-Tech Gründerfonds (HTGF)** – Seed-Tickets ab 600k€

---

## Anhang: Glossar

| Begriff | Bedeutung |
|---|---|
| CDSS | Clinical Decision Support System |
| FHIR R4 | Fast Healthcare Interoperability Resources, Release 4 |
| HL7 | Health Level Seven, klinischer Daten-Standard |
| qSOFA | Quick Sequential Organ Failure Assessment |
| SBAR | Situation – Background – Assessment – Recommendation |
| MDR | EU Medical Device Regulation 2017/745 |
| MIMIC-IV | Medical Information Mart for Intensive Care, Version 4 |
| SHAP | SHapley Additive exPlanations (Erklärbarkeit ML) |
| TFT | Temporal Fusion Transformer |
| RBAC | Role-Based Access Control |
| AVV | Auftragsverarbeitungsvertrag (DSGVO Art. 28) |

---

**Autor:** Mohammad Orouji
M.Sc. Digital Health Management, MSH Medical School Hamburg
Hintergrund: Pflegefachkraft (20+ Jahre Praxis), Fachinformatiker für Anwendungsentwicklung (IHK 2025)

**Status dieses Dokuments:** Living Document. Versionierung über Git, Änderungen via Pull Request.
