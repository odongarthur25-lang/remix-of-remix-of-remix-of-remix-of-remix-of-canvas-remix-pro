import { database } from "@/lib/firebase";
import { ref as dbRef, get, onValue, set } from "firebase/database";

/** Built-in backend used when no custom one has been saved in the admin panel. */
export const DEFAULT_API_BASE = "https://function-bun-production-f6bb.up.railway.app/api";

/** Realtime Database location of the admin-editable payment backend URL. */
export const PAYMENT_API_DB_PATH = "adminSettings/paymentApiBase";

let cachedBase: string | null = null;
let liveWatcher = false;

/** Trim trailing slashes so `${base}/deposit` never becomes a double slash. */
export function normalizeApiBase(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function startWatcher() {
  if (liveWatcher) return;
  liveWatcher = true;
  try {
    onValue(dbRef(database, PAYMENT_API_DB_PATH), (snap) => {
      const val = snap.val();
      cachedBase = typeof val === "string" && val.trim() ? normalizeApiBase(val) : null;
    });
  } catch {
    liveWatcher = false;
  }
}

/** Current payment backend base URL (admin value if set, otherwise the built-in one). */
export async function getApiBase(): Promise<string> {
  startWatcher();
  if (cachedBase) return cachedBase;
  try {
    const snap = await get(dbRef(database, PAYMENT_API_DB_PATH));
    const val = snap.val();
    if (typeof val === "string" && val.trim()) {
      cachedBase = normalizeApiBase(val);
      return cachedBase;
    }
  } catch {
    // Not signed in or offline — fall back to the built-in backend.
  }
  return DEFAULT_API_BASE;
}

/** Save a new payment backend URL (admin only, enforced by database rules). */
export async function savePaymentApiBase(value: string) {
  const clean = normalizeApiBase(value);
  await set(dbRef(database, PAYMENT_API_DB_PATH), clean);
  cachedBase = clean || null;
  return clean;
}

/** Reset back to the built-in backend. */
export async function resetPaymentApiBase() {
  await set(dbRef(database, PAYMENT_API_DB_PATH), DEFAULT_API_BASE);
  cachedBase = DEFAULT_API_BASE;
  return DEFAULT_API_BASE;
}

/**
 * Parse a payment-server response. On a non-OK HTTP status, surface the
 * server's own error message (e.g. "Invalid access for IP ..." / INVALID_IP)
 * so the failed screen can show the real reason instead of a generic one.
 */
async function parsePaymentResponse(res: Response) {
  const text = await res.text().catch(() => "");
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text.slice(0, 300) };
    }
  }
  if (!res.ok) {
    const serverMsg =
      data?.details?.message ||
      data?.message ||
      data?.relworx?.message ||
      data?.error ||
      data?.error_code ||
      (typeof data === "string" ? data : "");
    const statusTxt = `HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`;
    throw new Error(
      serverMsg ? `${serverMsg} (${statusTxt})` : `Payment server error (${statusTxt})`,
    );
  }
  return data ?? {};
}

export async function requestPayment(msisdn: string, amount: number, description: string) {
  const API_BASE = await getApiBase();
  const res = await fetch(`${API_BASE}/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msisdn, amount, description }),
  });
  return parsePaymentResponse(res);
}

export async function sendPayment(msisdn: string, amount: number, description: string) {
  const API_BASE = await getApiBase();
  const res = await fetch(`${API_BASE}/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msisdn, amount, description }),
  });
  return parsePaymentResponse(res);
}

export async function checkRequestStatus(internalReference: string) {
  const API_BASE = await getApiBase();
  const res = await fetch(
    `${API_BASE}/request-status?internal_reference=${encodeURIComponent(internalReference)}`,
  );
  return parsePaymentResponse(res);
}

export async function getWalletBalance() {
  const API_BASE = await getApiBase();
  const res = await fetch(`${API_BASE}/wallet/balance`);
  return parsePaymentResponse(res);
}

export async function getTransactions() {
  const API_BASE = await getApiBase();
  const res = await fetch(`${API_BASE}/transactions`);
  return parsePaymentResponse(res);
}

export async function validatePhone(msisdn: string) {
  const API_BASE = await getApiBase();
  const res = await fetch(`${API_BASE}/validate-phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msisdn }),
  });
  return parsePaymentResponse(res);
}
