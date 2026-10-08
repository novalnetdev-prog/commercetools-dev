export function sepaMandateTemplate(locale: string): string {
  const isGerman = locale.toLowerCase().startsWith('de');

  const text = isGerman
    ? {
        grant: 'Hiermit erteile ich das SEPA-Lastschriftmandat (elektronische Übermittlung) und bestätige, dass die angegebenen Bankdaten korrekt sind!',
        authorization: 'Ich ermächtige (A) die Novalnet AG, meinem Kreditinstitut Anweisungen zur Belastung meines Kontos zu erteilen, und (B) mein Kreditinstitut, mein Konto entsprechend den Anweisungen der Novalnet AG zu belasten.',
        creditor: 'Gläubiger-Identifikationsnummer: DE53ZZZ00000004253',
        note: 'Hinweis:',
        refund: 'Sie haben das Recht, von Ihrem Kreditinstitut eine Erstattung des belasteten Betrags nach den mit Ihrem Kreditinstitut vereinbarten Bedingungen zu verlangen. Die Erstattung muss innerhalb von acht Wochen ab dem Tag der Belastung Ihres Kontos geltend gemacht werden.',
      }
    : {
        grant: 'I hereby grant the mandate for the SEPA direct debit (electronic transmission) and confirm that the given bank details are correct!',
        authorization: 'I authorise (A) Novalnet AG to send instructions to my bank to debit my account and (B) my bank to debit my account in accordance with the instructions from Novalnet AG.',
        creditor: 'Creditor identifier: DE53ZZZ00000004253',
        note: 'Note:',
        refund: 'You are entitled to a refund from your bank under the terms and conditions of your agreement with bank. A refund must be claimed within 8 weeks starting from the date on which your account was debited.',
      };

  return `
    <details style="font-size:14px;line-height:1.5;">
      <summary style="cursor:pointer;text-decoration:underline;">
        ${text.grant}
      </summary>
      <div style="margin-top:12px;padding:14px 18px;background:#f7f7f7;">
        <p>${text.authorization}</p>
        <p><strong>${text.creditor}</strong></p>
        <p><strong>${text.note}</strong> ${text.refund}</p>
      </div>
    </details>
  `;
}
