const QUERY_PARAMETER = 'novalnetPaymentError';
const ALERT_ID = 'novalnet-payment-error';
let paymentContainer: Element | null = null;

export function setPaymentErrorContainer(selector: string): void {
  paymentContainer = document.querySelector(selector);
  const alert = document.getElementById(ALERT_ID);
  if (alert && paymentContainer) paymentContainer.prepend(alert);
}

export function clearPaymentError(): void {
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

  const container = paymentContainer?.isConnected ? paymentContainer : document.body;
  let alert = document.getElementById(ALERT_ID);
  if (!alert) {
    alert = document.createElement('div');
    alert.id = ALERT_ID;
    alert.setAttribute('role', 'alert');
    alert.style.cssText =
      'padding:12px 16px;margin:12px 0;border:1px solid #c62828;border-radius:4px;color:#8e1616;background:#fff4f4;';
  }

  container.prepend(alert);

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
