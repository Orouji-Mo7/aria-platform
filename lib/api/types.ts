export type Gender = "male" | "female" | "other" | "unknown";

export type PatientStatus = "active" | "discharged";

export type ObservationStatus =
  | "final"
  | "preliminary"
  | "amended"
  | "entered_in_error";

export interface Patient {
  id: string;
  mrn: string;
  given_name: string;
  family_name: string;
  birth_date: string;
  gender: Gender;
  admission_date: string | null;
  room_number: string | null;
  station: string | null;
  status: PatientStatus;
  created_at: string;
  updated_at: string;
}

export interface PatientList {
  items: Patient[];
  total: number;
  limit: number;
  offset: number;
}

export interface Observation {
  id: string;
  patient_id: string;
  code_system: string;
  code: string;
  code_display: string;
  /** Backend serializes Decimal as string. Convert with Number(...) where numeric math is needed. */
  value_numeric: string;
  value_unit: string;
  effective_at: string;
  status: ObservationStatus;
  recorded_by: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}
