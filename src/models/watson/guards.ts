import { object } from '@voiceflow/common/build/cjs';

import { WatsonEntity, WatsonEntityValue, WatsonIntent, WatsonIntentExample, WatsonWorkspace } from './types';

export const isWatsonIntentExample = (value: unknown): value is WatsonIntentExample =>
  value != null && typeof value === 'object' && object.hasProperty(value, 'text') && typeof value.text === 'string';

export const isWatsonIntent = (value: unknown): value is WatsonIntent =>
  value != null &&
  typeof value === 'object' &&
  object.hasProperty(value, 'intent') &&
  typeof value.intent === 'string' &&
  object.hasProperty(value, 'examples') &&
  Array.isArray(value.examples) &&
  value.examples.every(isWatsonIntentExample);

export const isWatsonEntityValue = (value: unknown): value is WatsonEntityValue =>
  value != null &&
  typeof value === 'object' &&
  object.hasProperty(value, 'value') &&
  typeof value.value === 'string' &&
  object.hasProperty(value, 'type') &&
  (value.type === 'synonyms' || value.type === 'patterns');

export const isWatsonEntity = (value: unknown): value is WatsonEntity =>
  value != null &&
  typeof value === 'object' &&
  object.hasProperty(value, 'entity') &&
  typeof value.entity === 'string' &&
  object.hasProperty(value, 'values') &&
  Array.isArray(value.values) &&
  value.values.every(isWatsonEntityValue);

export const isWatsonWorkspace = (value: unknown): value is WatsonWorkspace =>
  value != null &&
  typeof value === 'object' &&
  object.hasProperty(value, 'intents') &&
  Array.isArray(value.intents) &&
  value.intents.every(isWatsonIntent) &&
  object.hasProperty(value, 'entities') &&
  Array.isArray(value.entities) &&
  value.entities.every(isWatsonEntity);
