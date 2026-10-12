/**
 * Parse a payment-server response. On a non-OK HTTP status, surface the
 * server's own error message (e.g. "Invalid access for IP ..." / INVALID_IP)
 * so the failed screen can show the real reason instead of a generic one.
 */
export async function parsePaymentResponse(res: Response) {
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
