const QUERY_PARAMETER = 'novalnetPaymentError';
const ALERT_ID = 'novalnet-payment-error';
const ERROR_DISPLAY_MS = 12_000;
let dismissTimer: ReturnType<typeof setTimeout> | undefined;

export function clearPaymentError(): void {
  if (dismissTimer !== undefined) {
    clearTimeout(dismissTimer);
    dismissTimer = undefined;
  }
  document.getElementById(ALERT_ID)?.remove();
}

export async function readProcessorPaymentError(response: Response, fallback: string): Promise<string> {
  try {
    const payload = await response.json();
    const reason = payload?.transactionStatusText;
    return typeof reason === 'string' && reason.trim() ? reason : fallback;
  } catch {
    return fallback;
  }
}

export function showPaymentError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (!message.trim()) return;

  let alert = document.getElementById(ALERT_ID);
  if (!alert) {
    alert = document.createElement('div');
    alert.id = ALERT_ID;
    alert.setAttribute('role', 'alert');
    alert.style.cssText =
      'position:fixed;top:16px;right:16px;z-index:2147483647;box-sizing:border-box;' +
      'width:calc(100% - 32px);max-width:420px;padding:12px 16px;' +
      'border:1px solid #c62828;border-radius:4px;color:#8e1616;' +
      'background:#fff4f4;box-shadow:0 3px 12px rgba(0,0,0,.2);';
  }

  document.body.append(alert);

  alert.textContent = message.slice(0, 500);
  if (dismissTimer !== undefined) clearTimeout(dismissTimer);
  dismissTimer = setTimeout(clearPaymentError, ERROR_DISPLAY_MS);
}

export function showReturnedPaymentError(): void {
  const url = new URL(window.location.href);
  const message = url.searchParams.get(QUERY_PARAMETER);
  if (!message) return;

  url.searchParams.delete(QUERY_PARAMETER);
  showPaymentError(message);
  try {
    window.history.replaceState(window.history.state, '', url.toString());
  } catch {
    // The message is still visible if the host restricts history changes.
  }
}
