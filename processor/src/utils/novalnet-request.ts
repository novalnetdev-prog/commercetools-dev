import { networkInterfaces } from "node:os";
import { SupportedLocale, t } from "../i18n";

export function getNovalnetSystemInfo(storefrontUrl: string, version: string) {
  let addresses: ReturnType<typeof networkInterfaces>[string][] = [];
  try {
    addresses = Object.values(networkInterfaces());
  } catch {
    // Some restricted runtimes do not expose network interfaces.
  }
  const interfaces = addresses.flat();
  const address = interfaces.find((entry) => entry?.family === "IPv4" && !entry.internal);
  let origin = "";
  try {
    origin = new URL(storefrontUrl).origin;
  } catch {
    // An absent storefront URL should not break an otherwise valid payment.
  }
  return {
    system_name: "commercetools",
    system_version: version,
    system_ip: address?.address ?? "127.0.0.1",
    ...(origin && { system_url: origin }),
  };
}

export function formatNovalnetAmount(amount: unknown, currency: string, locale: SupportedLocale): string {
  const cents = Number(amount);
  if (!Number.isFinite(cents)) return String(amount ?? "");
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB", {
    style: "currency", currency,
  }).format(cents / 100);
}

export function bankTransferReference(transaction: Record<string, any>, locale: SupportedLocale): string {
  const currency = String(transaction.currency ?? "EUR");
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(String(transaction.due_date ?? ""))
    ? new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", {
        year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
      }).format(new Date(`${transaction.due_date}T00:00:00Z`))
    : "";
  return t(locale, "payment.referenceText", {
    amount: formatNovalnetAmount(transaction.amount, currency, locale),
    dueDateText: dueDate ? t(locale, "payment.dueDateText", { date: dueDate }) : "",
  });
}

export function bankTransferDetails(transaction: Record<string, any>, locale: SupportedLocale): string {
  const details = transaction.bank_details;
  if (!details) return "";
  const lines = [
    bankTransferReference(transaction, locale),
    details.account_holder && t(locale, "payment.accountHolder", { accountHolder: String(details.account_holder) }),
    details.iban && t(locale, "payment.iban", { iban: String(details.iban) }),
    details.bic && t(locale, "payment.bic", { bic: String(details.bic) }),
    details.bank_name && t(locale, "payment.bankName", { bankName: String(details.bank_name) }),
    details.bank_place && t(locale, "payment.bankPlace", { bankPlace: String(details.bank_place) }),
  ].filter(Boolean) as string[];
  const tid = transaction.tid;
  if (tid || transaction.invoice_ref) {
    lines.push(t(locale, "payment.paymentReferences"));
    if (tid) lines.push(t(locale, "payment.paymentReferenceTid", { tid: String(tid) }));
    if (transaction.invoice_ref) lines.push(t(locale, "payment.paymentReferenceInvoice", {
      reference: String(transaction.invoice_ref),
    }));
  }
  return lines.join("\n");
}

export function updateBankTransferReference(comments: string, transaction: Record<string, any>, locale: SupportedLocale): string {
  if (!transaction.due_date) return comments;
  const referenceMarkers = ["Please transfer the amount of", "Bitte überweisen Sie den Betrag"];
  const lines = comments.split("\n");
  const index = lines.findIndex((line) => referenceMarkers.some((marker) => line.startsWith(marker)));
  if (index < 0) return comments;
  lines[index] = bankTransferReference(transaction, locale);
  return lines.join("\n");
}

export function buildPayPalCartInfo(cart: any, locale: SupportedLocale) {
  let discount = 0;
  const lineItems = (cart.lineItems ?? []).map((item: any) => ({
    category: "physical",
    description: "",
    name: item.name?.[locale] ?? item.name?.en ?? Object.values(item.name ?? {})[0] ?? "",
    price: Number(item.price?.value?.centAmount ?? 0),
    quantity: item.quantity,
  }));
  for (const item of cart.lineItems ?? []) {
    discount += Math.max(0,
      Number(item.price?.value?.centAmount ?? 0) * Number(item.quantity ?? 0) -
      Number(item.totalPrice?.centAmount ?? 0));
  }
  for (const item of cart.customLineItems ?? []) {
    discount += Math.max(0,
      Number(item.money?.centAmount ?? 0) * Number(item.quantity ?? 0) -
      Number(item.totalPrice?.centAmount ?? 0));
    lineItems.push({
      category: "", description: "",
      name: item.name?.[locale] ?? item.name?.en ?? Object.values(item.name ?? {})[0] ?? "",
      price: Number(item.money?.centAmount ?? 0), quantity: item.quantity,
    });
  }
  discount += Number(cart.discountOnTotalPrice?.discountedAmount?.centAmount ?? 0);
  const shipping = Number(cart.shippingInfo?.discountedPrice?.value?.centAmount ??
    cart.shippingInfo?.price?.centAmount ?? 0);
  const tax = cart.taxedPrice
    ? Number(cart.taxedPrice.totalGross?.centAmount ?? 0) - Number(cart.taxedPrice.totalNet?.centAmount ?? 0)
    : 0;
  if (discount) lineItems.push({ category: "", description: "", name: "Discount", price: -discount, quantity: 1 });
  return {
    items_shipping_price: shipping,
    items_tax_price: Math.max(0, tax),
    line_items: lineItems,
  };
}
