import { BaseModels } from '@voiceflow/base-types';
import { SLOT_ANNOTATION_SIMPLE_REGEX, SLOT_REGEXP } from '@voiceflow/common/build/cjs';

export const extractSlotNamesFromUtterance = (utterance: string) =>
  Array.from(new Set(Array.from(utterance.matchAll(SLOT_ANNOTATION_SIMPLE_REGEX)).map((value) => value[1])));

export const formatUtteranceSlotAnnotations = (slots: Map<string, BaseModels.Slot>, utterance: string) =>
  utterance.replaceAll(SLOT_ANNOTATION_SIMPLE_REGEX, (_, slotName) => `{{[${slotName}].${slots.get(slotName)?.key}}}`);

export const simplifyUtteranceSlotAnnotations = (text: string) =>
  text.replaceAll(SLOT_REGEXP, (_, name) => `{${name}}`).trim();
