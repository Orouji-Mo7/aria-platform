import { apiFetch } from "./client";
import type { Observation, PatientList } from "./types";

export interface ListPatientsOptions {
  limit?: number;
  offset?: number;
}

/**
 * Fetch a paginated list of patients.
 *
 * @param opts.limit  Maximum number of items to return.
 * @param opts.offset Number of items to skip.
 */
export function listPatients(
  opts: ListPatientsOptions = {},
): Promise<PatientList> {
  const params = new URLSearchParams();
  if (typeof opts.limit === "number") params.set("limit", String(opts.limit));
  if (typeof opts.offset === "number") params.set("offset", String(opts.offset));

  const query = params.toString();
  const path = query
    ? `/api/v1/patients?${query}`
    : "/api/v1/patients";

  return apiFetch<PatientList>(path);
}

/**
 * Fetch the latest observation for each LOINC code recorded for a patient.
 *
 * @param patientId Patient UUID.
 */
export function getLatestVitalsForPatient(
  patientId: string,
): Promise<Observation[]> {
  return apiFetch<Observation[]>(
    `/api/v1/patients/${encodeURIComponent(patientId)}/observations/latest`,
  );
}
