import { transliterate } from 'transliteration';

export const getArrayBy = <T>(arr: T[], prop: keyof T) => {
  return arr.reduce((acc, obj) => {
    const key = `${obj[prop]}`;
    acc[key] = obj;
    return acc;
  }, {} as Record<string, T>);
};

export const sanitizeResourceName = (name: string): string =>
  // Try our best to keep the sanitized name close to the original
  transliterate(name)
    .replaceAll(' ', '_')
    .replace(/[^_a-z]/gi, '')
    .trim();

export const buildIntent = (name: string, key: string) => ({
  key,
  name,
  inputs: [],
  slots: [],
});

export const buildSlot = (name: string, key: string) => ({
  name,
  key,
  inputs: [],
  type: {
    value: 'Custom',
  },
});

export const buildIntentSlot = (id: string) => ({
  id,
  dialog: {
    confirm: [],
    confirmEnabled: false,
    prompt: [],
    utterances: [],
  },
  required: false,
});
