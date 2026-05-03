"use client";

import { useEffect, useState } from "react";

import { PatientShiftSection } from "@/lib/components/PatientShiftSection";

export default function Home() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clock = time
    ? time.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  const dateLabel = time
    ? time.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Stats />
        <ShiftOverview clock={clock} dateLabel={dateLabel} />
        <ExplainableAI />
        <Impact />
      </main>
      <Footer />
    </div>
  );
}

/* ---------- Navigation ---------- */

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#" className="flex items-center gap-2.5">
          <Logo />
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold tracking-tight text-foreground">
              ARIA
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-muted sm:inline">
              Acute Care Intelligence
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a
            href="#schicht"
            className="transition-colors hover:text-foreground"
          >
            Schichtübersicht
          </a>
          <a
            href="#empfehlung"
            className="transition-colors hover:text-foreground"
          >
            Empfehlungen
          </a>
          <a
            href="#impact"
            className="transition-colors hover:text-foreground"
          >
            Impact
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:inline"
          >
            Anmelden
          </a>
          <a
            href="#empfehlung"
            className="inline-flex items-center gap-1.5 rounded-full bg-vital px-4 py-2 text-sm font-semibold text-background transition-all hover:bg-vital/90 hover:shadow-[0_0_30px_-5px_rgba(0,200,150,0.6)]"
          >
            Demo anfordern
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-vital/30 to-vital/5 ring-1 ring-vital/40">
      <span className="absolute inset-1 rounded-lg bg-background/80" />
      <span className="relative h-2 w-2 rounded-full bg-vital">
        <span className="absolute inset-0 rounded-full bg-vital aria-pulse" />
      </span>
    </span>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 aria-grid-bg opacity-90" />
      <div className="absolute inset-x-0 top-0 -z-0 h-px bg-gradient-to-r from-transparent via-vital/30 to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:pt-36">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/60 px-3 py-1 text-xs font-medium tracking-wide text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-vital opacity-75 aria-pulse" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-vital" />
            </span>
            Live · klinische KI im Einsatz
          </span>

          <h1 className="mt-7 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Klinische Intelligenz,
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-vital to-foreground bg-clip-text text-transparent">
              {" "}
              entwickelt für Pflegekräfte.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            ARIA verdichtet Vitaldaten, Verlauf und Pflegekontext zu einer
            erklärbaren Empfehlung — damit Sie früher erkennen, klarer
            entscheiden und den Patient*innen wieder näher sein können.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <a
              href="#schicht"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-vital px-7 text-sm font-semibold text-background transition-all hover:bg-vital/90 hover:shadow-[0_0_40px_-5px_rgba(0,200,150,0.55)] sm:w-auto"
            >
              Live-Schicht ansehen
              <span aria-hidden>→</span>
            </a>
            <a
              href="#empfehlung"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-border-strong bg-surface/40 px-7 text-sm font-medium text-foreground transition-colors hover:bg-surface sm:w-auto"
            >
              So funktioniert die KI
            </a>
          </div>

          <p className="mt-6 text-xs text-muted">
            Pilotiert mit Universitätskliniken · CE-Konformität in Vorbereitung
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Stats Bar ---------- */

const STATS: { value: string; label: string; sublabel: string }[] = [
  {
    value: "−30 %",
    label: "Sepsis-Mortalität",
    sublabel: "im Pilotprogramm verglichen mit Standard-Versorgung",
  },
  {
    value: "1,5 h",
    label: "zurückgewonnene Pflegezeit",
    sublabel: "pro Schicht und Pflegekraft",
  },
  {
    value: "FHIR R4",
    label: "interoperabel",
    sublabel: "nahtlos in bestehende KIS-Landschaften integrierbar",
  },
  {
    value: "DSGVO",
    label: "konform & auditierbar",
    sublabel: "Datenhaltung in der EU, vollständige Nachvollziehbarkeit",
  },
];

function Stats() {
  return (
    <section className="relative border-y border-border-subtle/60 bg-surface/30">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-px bg-border-subtle/60 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-background/40 px-6 py-8 sm:px-8 sm:py-10"
          >
            <div className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {s.value}
            </div>
            <div className="mt-1.5 text-sm font-medium text-foreground/90">
              {s.label}
            </div>
            <div className="mt-1 text-xs leading-relaxed text-muted">
              {s.sublabel}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Shift Overview ---------- */

function ShiftOverview({
  clock,
  dateLabel,
}: {
  clock: string;
  dateLabel: string;
}) {
  return (
    <section
      id="schicht"
      className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-vital">
            Schichtübersicht
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Ihre Patient*innen, priorisiert nach Risiko.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Drei aktuelle Fälle aus Station 4B — automatisch sortiert nach
            klinischer Dringlichkeit. Tippen Sie eine Karte für den vollen
            Verlauf.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface/60 px-4 py-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-vital opacity-60 aria-pulse" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-vital" />
          </span>
          <div>
            <div className="font-mono text-base tabular-nums tracking-tight text-foreground">
              {clock}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-muted">
              {dateLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <PatientShiftSection />
      </div>
    </section>
  );
}

/* ---------- Explainable AI ---------- */

const EXPLAIN_FACTORS = [
  {
    weight: 0.42,
    label: "Vitalparameter-Trend",
    detail:
      "Herzfrequenz seit 90 min steigend (78 → 112), gleichzeitig SpO₂-Abfall um 5 Prozentpunkte.",
  },
  {
    weight: 0.31,
    label: "Laborverlauf",
    detail:
      "Leukozyten 14,2 G/l · CRP 87 mg/l · Laktat 2,4 mmol/l — Muster passt zu beginnender Sepsis.",
  },
  {
    weight: 0.27,
    label: "Pflegekontext",
    detail:
      "Postoperativ Tag 2, Z. n. Hüft-TEP, Dauerkatheter — relevante Risikoquelle dokumentiert.",
  },
];

function ExplainableAI() {
  return (
    <section
      id="empfehlung"
      className="relative border-y border-border-subtle/60 bg-surface/30"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-vital">
              Erklärbare KI-Empfehlung
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Keine Blackbox.
              <br />
              Eine begründete Entscheidung.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Für jede Empfehlung zeigt ARIA die zugrundeliegenden Datenpunkte,
              ihre Gewichtung und die klinische Logik. Sie behalten die
              Hoheit — die KI liefert die Vorarbeit.
            </p>

            <div className="mt-8 rounded-2xl border border-vital/30 bg-vital/5 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-vital">
                <span className="h-1.5 w-1.5 rounded-full bg-vital aria-pulse" />
                Aktuelle Empfehlung · Patient*in A
              </div>
              <p className="mt-3 text-base font-semibold text-foreground">
                Sepsis-Bündel innerhalb der nächsten 30 min einleiten.
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                Konfidenz 87 % · Datenbasis: 14.300 vergleichbare Verläufe ·
                Modell-Version 4.2.1
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border-subtle bg-background/60 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Warum diese Empfehlung?
                </h3>
                <span className="text-[11px] uppercase tracking-wider text-muted">
                  3 Faktoren
                </span>
              </div>

              <ul className="mt-6 space-y-5">
                {EXPLAIN_FACTORS.map((f) => (
                  <li key={f.label}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm font-medium text-foreground">
                        {f.label}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted">
                        {(f.weight * 100).toFixed(0)} %
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-vital/70 to-vital"
                        style={{ width: `${f.weight * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      {f.detail}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-2 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted">
                  Pflegerische Entscheidung wird zusammen mit Begründung
                  dokumentiert.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
                  >
                    Ablehnen
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    Modifizieren
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full bg-vital px-3.5 py-1.5 text-xs font-semibold text-background transition-all hover:bg-vital/90 hover:shadow-[0_0_25px_-5px_rgba(0,200,150,0.6)]"
                  >
                    Annehmen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Impact ---------- */

const IMPACT = [
  {
    title: "Patientensicherheit",
    headline: "Frühe Erkennung statt später Reaktion.",
    body: "Klinisch relevante Verschlechterungen werden im Median 4 Stunden vor dem Standard-Score sichtbar — Zeit, die Leben rettet.",
    metric: "4 h",
    metricLabel: "Vorlauf bei Sepsis-Erkennung",
  },
  {
    title: "Pflegeentlastung",
    headline: "Mehr Kopf für den Menschen.",
    body: "Routinemonitoring, Dokumentation und Priorisierung werden automatisiert — Pflegekräfte gewinnen messbar Zeit am Bett zurück.",
    metric: "+27 %",
    metricLabel: "direkte Patient*innenzeit",
  },
  {
    title: "Systemeffizienz",
    headline: "Ressourcen, dort wo sie wirken.",
    body: "Aufwendige Verlegungen, Re-Admissions und unnötige Diagnostik sinken durch frühzeitige, evidenzbasierte Triage spürbar.",
    metric: "−18 %",
    metricLabel: "ungeplante Re-Admissions",
  },
];

function Impact() {
  return (
    <section id="impact" className="relative">
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-vital">
            Wirkung
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Spürbar in der Schicht.
            <br />
            Messbar im System.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            ARIA wirkt auf drei Ebenen — und macht jede davon transparent
            nachvollziehbar.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {IMPACT.map((i) => (
            <article
              key={i.title}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border-subtle bg-surface/60 p-7 transition-all hover:border-vital/40 hover:bg-surface"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-vital/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-60" />

              <div className="relative">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  {i.title}
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                  {i.headline}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {i.body}
                </p>
              </div>

              <div className="relative mt-8 flex items-end justify-between border-t border-border-subtle/70 pt-5">
                <div>
                  <div className="text-3xl font-semibold tracking-tight text-vital">
                    {i.metric}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-muted">
                    {i.metricLabel}
                  </div>
                </div>
                <span className="text-muted transition-colors group-hover:text-vital">
                  →
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="border-t border-border-subtle/60 bg-surface/30">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="text-base font-semibold tracking-tight">
                ARIA
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Adaptive Risk Intelligence for Acute Care. Entwickelt mit
              Pflegekräften, validiert in Universitätskliniken, gehostet in der
              EU.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Plattform"
              links={["Schichtübersicht", "Empfehlungen", "Verlauf", "API"]}
            />
            <FooterCol
              title="Klinik"
              links={["Pilotprogramm", "Sicherheit", "FHIR R4", "Roadmap"]}
            />
            <FooterCol
              title="Unternehmen"
              links={["Über ARIA", "Forschung", "Karriere", "Kontakt"]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border-subtle/70 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} ARIA Health Systems GmbH</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="#" className="hover:text-foreground">
              Datenschutz
            </a>
            <a href="#" className="hover:text-foreground">
              DSGVO
            </a>
            <a href="#" className="hover:text-foreground">
              Impressum
            </a>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-vital" />
              Alle Systeme operativ
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="transition-colors hover:text-foreground">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
