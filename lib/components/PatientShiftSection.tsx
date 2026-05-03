"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { ApiError } from "@/lib/api/client";
import {
  getLatestVitalsForPatient,
  listPatients,
} from "@/lib/api/patients";
import type { Observation, Patient } from "@/lib/api/types";

type Severity = "critical" | "warning" | "stable";

type SeverityStyle = {
  label: string;
  badge: string;
  glow: string;
  accent: string;
  dot: string;
  via: string;
};

const SEVERITY_STYLES: Record<Severity, SeverityStyle> = {
  critical: {
    label: "Kritisch",
    badge: "bg-critical/15 text-critical border-critical/30",
    glow: "shadow-[0_0_60px_-20px_rgba(232,68,90,0.55)]",
    accent: "text-critical",
    dot: "bg-critical",
    via: "via-critical/60",
  },
  warning: {
    label: "Beobachtung",
    badge: "bg-warning/15 text-warning border-warning/30",
    glow: "shadow-[0_0_50px_-25px_rgba(245,166,35,0.45)]",
    accent: "text-warning",
    dot: "bg-warning",
    via: "via-warning/60",
  },
  stable: {
    label: "Stabil",
    badge: "bg-vital/15 text-vital border-vital/30",
    glow: "shadow-[0_0_50px_-25px_rgba(0,200,150,0.45)]",
    accent: "text-vital",
    dot: "bg-vital",
    via: "via-vital/60",
  },
};

const LOINC = {
  HR: "8867-4",
  SPO2: "2708-6",
  TEMP: "8310-5",
  RR: "9279-1",
  BP_SYS: "8480-6",
  BP_DIA: "8462-4",
} as const;

const PATIENT_LIST_LIMIT = 12;

export function PatientShiftSection() {
  const patientsQuery = useQuery({
    queryKey: ["patients", { limit: PATIENT_LIST_LIMIT }],
    queryFn: () => listPatients({ limit: PATIENT_LIST_LIMIT }),
  });

  if (patientsQuery.isLoading) {
    return <SkeletonGrid />;
  }

  if (patientsQuery.isError) {
    return (
      <ErrorCard
        message={errorMessage(patientsQuery.error)}
        onRetry={() => patientsQuery.refetch()}
      />
    );
  }

  const patients = patientsQuery.data?.items ?? [];
  if (patients.length === 0) {
    return <EmptyState />;
  }

  return <PatientGrid patients={patients} />;
}

function PatientGrid({ patients }: { patients: Patient[] }) {
  const vitalQueries = useQueries({
    queries: patients.map((p) => ({
      queryKey: ["patients", p.id, "observations", "latest"],
      queryFn: () => getLatestVitalsForPatient(p.id),
    })),
  });

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {patients.map((patient, idx) => {
        const q = vitalQueries[idx];
        return (
          <PatientLiveCard
            key={patient.id}
            patient={patient}
            observations={q?.data ?? []}
            isLoadingVitals={q?.isLoading ?? false}
            hasVitalsError={q?.isError ?? false}
          />
        );
      })}
    </div>
  );
}

function PatientLiveCard({
  patient,
  observations,
  isLoadingVitals,
  hasVitalsError,
}: {
  patient: Patient;
  observations: Observation[];
  isLoadingVitals: boolean;
  hasVitalsError: boolean;
}) {
  const vitals = useMemo(() => mapVitals(observations), [observations]);
  const severity = computeSeverity(vitals);
  const s = SEVERITY_STYLES[severity];
  const age = ageFromBirthDate(patient.birth_date);

  return (
    <article
      className={`group relative flex flex-col rounded-3xl border border-border-subtle bg-surface/70 p-6 backdrop-blur-sm transition-all hover:border-border-strong hover:bg-surface ${s.glow}`}
    >
      <div
        className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent ${s.via} to-transparent`}
      />

      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>
              {patient.room_number
                ? `Zimmer ${patient.room_number}`
                : "Zimmer —"}
            </span>
            <span className="h-1 w-1 rounded-full bg-border-strong" />
            <span>{age != null ? `${age} J.` : "Alter —"}</span>
          </div>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            {patientDisplayName(patient)}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${s.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </header>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <VitalCell
          label="HF"
          value={vitals.hr?.value ?? null}
          unit="bpm"
          tone={hrTone(vitals.hr?.value)}
          loading={isLoadingVitals}
        />
        <VitalCell
          label="SpO₂"
          value={vitals.spo2?.value ?? null}
          unit="%"
          tone={spo2Tone(vitals.spo2?.value)}
          loading={isLoadingVitals}
        />
        <VitalCell
          label="Temp"
          value={vitals.temp?.value ?? null}
          unit="°C"
          tone={tempTone(vitals.temp?.value)}
          loading={isLoadingVitals}
          fractionDigits={1}
        />
      </div>

      <SecondaryVitals vitals={vitals} />

      <div className="mt-6 rounded-2xl border border-border-subtle/80 bg-background/40 p-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          Vitalstatus
        </div>
        <div className={`mt-2 text-sm font-semibold ${s.accent}`}>
          {statusHeadline(severity, observations.length, hasVitalsError)}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {statusDetail(patient, observations, hasVitalsError)}
        </p>
      </div>

      <footer className="mt-5 flex items-center justify-between text-xs text-muted">
        <span>{footerLine(patient)}</span>
        <span className="inline-flex items-center gap-1 text-foreground/80 transition-colors group-hover:text-vital">
          Verlauf öffnen <span aria-hidden>→</span>
        </span>
      </footer>
    </article>
  );
}

function VitalCell({
  label,
  value,
  unit,
  tone,
  loading,
  fractionDigits = 0,
}: {
  label: string;
  value: number | null;
  unit: string;
  tone: string;
  loading: boolean;
  fractionDigits?: number;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle/70 bg-background/30 px-3 py-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        {loading ? (
          <span className="block h-5 w-10 animate-pulse rounded bg-border-subtle/60" />
        ) : value == null ? (
          <span className="text-xl font-semibold tabular-nums text-muted/70">
            —
          </span>
        ) : (
          <>
            <span className={`text-xl font-semibold tabular-nums ${tone}`}>
              {fractionDigits > 0 ? value.toFixed(fractionDigits) : Math.round(value)}
            </span>
            <span className="text-[10px] text-muted">{unit}</span>
          </>
        )}
      </div>
    </div>
  );
}

function SecondaryVitals({ vitals }: { vitals: ReturnType<typeof mapVitals> }) {
  const parts: string[] = [];
  if (vitals.bpSys?.value != null && vitals.bpDia?.value != null) {
    parts.push(
      `RR ${Math.round(vitals.bpSys.value)}/${Math.round(vitals.bpDia.value)} mmHg`,
    );
  }
  if (vitals.rr?.value != null) {
    parts.push(`AF ${Math.round(vitals.rr.value)} /min`);
  }

  if (parts.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] tabular-nums text-muted">
      {parts.map((p) => (
        <span key={p}>{p}</span>
      ))}
    </div>
  );
}

/* ---------- States ---------- */

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="relative flex flex-col rounded-3xl border border-border-subtle bg-surface/70 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-border-subtle/60" />
              <div className="h-5 w-40 animate-pulse rounded bg-border-subtle/60" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-border-subtle/60" />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="h-[68px] animate-pulse rounded-2xl border border-border-subtle/70 bg-background/30"
              />
            ))}
          </div>
          <div className="mt-6 h-[88px] animate-pulse rounded-2xl border border-border-subtle/80 bg-background/40" />
          <div className="mt-5 flex items-center justify-between">
            <div className="h-3 w-32 animate-pulse rounded bg-border-subtle/60" />
            <div className="h-3 w-24 animate-pulse rounded bg-border-subtle/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-3xl border border-critical/30 bg-critical/5 p-6">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-critical">
        <span className="h-1.5 w-1.5 rounded-full bg-critical" />
        Verbindung
      </div>
      <p className="mt-2 text-base font-semibold text-foreground">
        Backend nicht erreichbar — startest du es lokal?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface"
      >
        Erneut versuchen
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-border-subtle bg-surface/60 p-8 text-center">
      <p className="text-base font-semibold text-foreground">
        Noch keine Patienten erfasst.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Erfasse den ersten Fall über{" "}
        <code className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground">
          POST /api/v1/patients
        </code>
        , danach erscheint er automatisch in dieser Übersicht.
      </p>
    </div>
  );
}

/* ---------- Helpers ---------- */

type VitalReading = { value: number; unit: string; effectiveAt: string };

function mapVitals(observations: Observation[]) {
  const pick = (code: string): VitalReading | null => {
    const obs = observations.find(
      (o) => o.code === code && o.status !== "entered_in_error",
    );
    if (!obs) return null;
    const value = Number(obs.value_numeric);
    if (!Number.isFinite(value)) return null;
    return { value, unit: obs.value_unit, effectiveAt: obs.effective_at };
  };

  return {
    hr: pick(LOINC.HR),
    spo2: pick(LOINC.SPO2),
    temp: pick(LOINC.TEMP),
    rr: pick(LOINC.RR),
    bpSys: pick(LOINC.BP_SYS),
    bpDia: pick(LOINC.BP_DIA),
  };
}

function computeSeverity(vitals: ReturnType<typeof mapVitals>): Severity {
  const hr = vitals.hr?.value;
  const spo2 = vitals.spo2?.value;
  const temp = vitals.temp?.value;

  if (
    (hr != null && hr >= 110) ||
    (spo2 != null && spo2 < 92) ||
    (temp != null && temp >= 38)
  ) {
    return "critical";
  }
  if (
    (hr != null && hr >= 85) ||
    (spo2 != null && spo2 < 96) ||
    (temp != null && temp >= 37.5)
  ) {
    return "warning";
  }
  return "stable";
}

function hrTone(value: number | undefined): string {
  if (value == null) return "text-foreground";
  if (value >= 110) return "text-critical";
  if (value >= 85) return "text-warning";
  return "text-foreground";
}

function spo2Tone(value: number | undefined): string {
  if (value == null) return "text-foreground";
  if (value < 92) return "text-critical";
  if (value < 96) return "text-warning";
  return "text-foreground";
}

function tempTone(value: number | undefined): string {
  if (value == null) return "text-foreground";
  if (value >= 38) return "text-critical";
  if (value >= 37.5) return "text-warning";
  return "text-foreground";
}

function ageFromBirthDate(birthDate: string): number | null {
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 && age < 130 ? age : null;
}

function patientDisplayName(patient: Patient): string {
  const family = patient.family_name?.trim();
  const given = patient.given_name?.trim();
  if (family) {
    const initial = given ? `${given.charAt(0).toUpperCase()}. ` : "";
    return `${initial}${family}`;
  }
  return `Patient*in ${patient.mrn}`;
}

function statusHeadline(
  severity: Severity,
  observationCount: number,
  hasVitalsError: boolean,
): string {
  if (hasVitalsError) return "Vitalwerte aktuell nicht abrufbar";
  if (observationCount === 0) return "Noch keine Vitalwerte erfasst";
  if (severity === "critical") return "Vitalwerte im kritischen Bereich";
  if (severity === "warning") return "Beobachtung empfohlen";
  return "Vitalwerte im stabilen Bereich";
}

function statusDetail(
  patient: Patient,
  observations: Observation[],
  hasVitalsError: boolean,
): string {
  if (hasVitalsError) {
    return "Beobachtungs-Endpoint hat nicht geantwortet — bitte Verbindung prüfen.";
  }
  if (observations.length === 0) {
    return `MRN ${patient.mrn} · Erfassung über POST /api/v1/patients/${patient.id}/observations.`;
  }
  const latest = mostRecent(observations);
  if (!latest) return `MRN ${patient.mrn}`;
  return `Letzte Messung ${formatRelativeTime(latest.effective_at)} · ${observations.length} Parameter aktiv`;
}

function footerLine(patient: Patient): string {
  const station = patient.station ? `Station ${patient.station}` : "Station —";
  if (patient.admission_date) {
    return `${station} · seit ${formatDate(patient.admission_date)}`;
  }
  return station;
}

function mostRecent(observations: Observation[]): Observation | null {
  if (observations.length === 0) return null;
  return observations.reduce((acc, o) =>
    new Date(o.effective_at).getTime() > new Date(acc.effective_at).getTime()
      ? o
      : acc,
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `vor ${hours} h`;
  const days = Math.round(hours / 24);
  return `vor ${days} d`;
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.status > 0 ? `HTTP ${err.status} — ${err.message}` : err.message;
  }
  if (err instanceof Error) return err.message;
  return "Unbekannter Fehler.";
}
