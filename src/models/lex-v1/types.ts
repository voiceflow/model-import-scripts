export interface LexMetaData {
  schemaVersion: string;
}

export interface LexStructure<T> {
  metadata: LexMetaData;
  resource: T;
}

export interface LexSlotResource {
  name: string;
  version: string;
  enumerationValues: {
    value: string;
    synonyms: string[];
  }[];
}

export interface LexIntentResource {
  name: string;
  sampleUtterances: string[];
  slots: LexIntentSlotResource[];
  slotTypes: LexSlotResource[];
}

export interface LexIntentSlotResource {
  name: string;
  slotType: string;
  sampleUtterances?: string[];
  valueElicitationPrompt: {
    messages: {
      contentType: string;
      content: string;
    }[];
    maxAttempts: number;
  };
  slotConstraint: string;
}

export interface LexBotResource {
  intents: LexIntentResource[];
  slotTypes?: LexSlotResource[];
  locale: string;
}

const isLexFile = (val: unknown): val is LexStructure<unknown> =>
  val != null &&
  typeof val === 'object' &&
  Object.prototype.hasOwnProperty.call(val, 'metadata') &&
  Object.prototype.hasOwnProperty.call(val, 'resource');

export const isLexIntentFile = (val: unknown): val is LexStructure<LexIntentResource> =>
  isLexFile(val) && Object.prototype.hasOwnProperty.call(val.resource, 'sampleUtterances');

export const isLexBotFile = (val: unknown): val is LexStructure<LexBotResource> =>
  isLexFile(val) && Object.prototype.hasOwnProperty.call(val.resource, 'intents');
