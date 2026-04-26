const BASE = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export function fetchPatient(patientId = 'default') {
  return fetch(`${BASE}/patient/${patientId}`).then(handleResponse);
}

export function fetchBrief(patientData = null) {
  return fetch(`${BASE}/brief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData ? { patientData } : {}),
  }).then(handleResponse);
}

export function fetchDrugInteractions(meds) {
  const query = Array.isArray(meds) ? meds.join(',') : meds;
  return fetch(`${BASE}/drugs/interactions?meds=${encodeURIComponent(query)}`).then(handleResponse);
}

export function fetchQR(patientId = 'default', url = null) {
  const params = url ? `?url=${encodeURIComponent(url)}` : '';
  return fetch(`${BASE}/qr/${patientId}${params}`).then(handleResponse);
}
