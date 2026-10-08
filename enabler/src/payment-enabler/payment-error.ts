const QUERY_PARAMETER = 'novalnetPaymentError';
const ALERT_ID = 'novalnet-payment-error';

/** Checkout owns its generic error banner, so show the provider reason beside it. */
export function showPaymentError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (!message.trim()) return;

  let alert = document.getElementById(ALERT_ID);
  if (!alert) {
    alert = document.createElement('div');
    alert.id = ALERT_ID;
    alert.setAttribute('role', 'alert');
    alert.style.cssText =
      'position:sticky;top:0;z-index:1000;padding:12px 16px;margin:12px 0;border:1px solid #c62828;border-radius:4px;color:#8e1616;background:#fff4f4;';
    document.body.prepend(alert);
  }

  alert.textContent = message.slice(0, 500);
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
