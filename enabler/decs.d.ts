declare module '*.scss';

interface Window {
  NovalnetUtility?: {
    formatIban: (event: Event, bicId?: string) => boolean | void;
    checkIban: (event: Event, bicId?: string) => boolean;
    formatBic?: (event: Event) => boolean;
    setBirthDateFormat: (format: string) => void;
    isNumericBirthdate: (input: HTMLInputElement, event: KeyboardEvent) => boolean | void;
    validateDateFormat: (value: string) => boolean;
  };
}
