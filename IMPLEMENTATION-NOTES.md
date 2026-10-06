# Payment method update (2026-10-06)

This package starts from `commercetools-testing-main(6).zip`.

## Changes

| Area | Implementation |
| --- | --- |
| New methods | Individual components in `enabler/src/components/payment-methods/{pix,boleto,bizum,bancomatpay,kakaopay,naverpay}/`, following the existing redirect-component shape. Registered by the enabler and advertised by the processor. |
| Novalnet codes | `PIX`, `BOLETO`, `BIZUM`, `BANCOMATPAY`, `KAKAOPAY`, `NAVERPAY`; the display names are kept separate. |
| Test mode | New Connect settings for each method. BANCOMAT Pay intentionally keeps the `NOVALNET_BANCOMAT_TEST_MODE` setting while the API and config lookup use `BANCOMATPAY`, preserving the deployment setting name. |
| Backend names | Payment records receive localized English and German `paymentMethodInfo.name`; transaction comments display names instead of raw payment codes. The existing payment method identifier is not overwritten. |
| Input fields | SEPA, guaranteed SEPA, ACH, and guaranteed invoice use localized field labels, validation text, and placeholders. Credit-card iframe labels and placeholders use the Checkout locale. The NovalnetUtility declarations and calls are retained. |
| Checkout identity | Existing component identifiers, including `eps`, `wechatpay`, and `ideal | Wero`, stay as they were in the attachment. Changing an existing identifier requires a Checkout integration migration. |

No changes were made to the payment-intent service, webhook transaction processing, refund/capture/cancel state mapping, or the direct/redirect transaction state logic. Six new methods use the existing `/redirectPayment` processor endpoint.

## Checkout display settings

The Checkout integration display label, description, icon, and final pay-button text are separate from the commercetools Payment record. commercetools documents a set of built-in display keys such as `eps`, `ideal`, `twint`, `trustly`, `mbway`, `blik`, `przelewy24`, and `sepadirectdebit`. This connector advertises some of those methods with different identifiers (for example, `Direct Debit SEPA`, `TWINT`, and `Trustly`); the built-in display defaults therefore cannot be assumed to apply. Existing identifiers were retained to avoid invalidating configured Checkout integrations. For custom methods, enter localized Custom details in Merchant Center. The current documentation does not list WeChat Pay among its built-in default details, so its observed predefined UI must be checked in the specific Checkout application before relying on it.

Sources: https://docs.commercetools.com/checkout/custom-texts-labels and https://docs.commercetools.com/checkout/payment-integrations-customization

## Verification and limits

- Processor `npm run build`: passed. Targeted name test: 8 passed.
- Enabler TypeScript check and `npm run build`: passed; production bundles regenerated in `enabler/public`.
- The generated enabler bundle was exercised with a mocked processor response for all six new methods. The requested code, German locale, and redirect were checked. Existing `eps`, `wechatpay`, `ideal | Wero`, and SEPA builder resolution was checked.
- Enabler suite: 1 passed (an existing smoke test). Full processor suite: 36 passed, 6 failed; older payment-service tests make unmocked commercetools calls or assume an earlier service shape. Those failures need isolated API mocks and should not be interpreted as live Novalnet results.
- No live Novalnet merchant credentials or Checkout application settings were available. Test merchant enablement, country/currency, redirect, return, webhook, and Checkout Custom details for each method before production deployment.
