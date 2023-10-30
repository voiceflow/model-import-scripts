import { VoiceflowConstants } from '@voiceflow/voiceflow-types';

export enum DIALOGFLOW_CX_SLOT_TYPES {
  ANY = '@sys.any',
  ADDRESS = '@sys.address',
  ZIP_CODE = '@sys.zip-code',
  GEO_CITY = '@sys.geo-city',
  DATE_TIME = '@sys.date-time',
  NUMBER_SEQUENCE = '@sys.number-sequence',
}

export const DIALOGFLOW_TO_VOICEFLOW_SLOT_TYPE_MAP: Readonly<
  Partial<Record<DIALOGFLOW_CX_SLOT_TYPES, VoiceflowConstants.SlotType>>
> = {
  [DIALOGFLOW_CX_SLOT_TYPES.GEO_CITY]: VoiceflowConstants.SlotType.GEOGRAPHY,
  [DIALOGFLOW_CX_SLOT_TYPES.DATE_TIME]: VoiceflowConstants.SlotType.DATETIME,
  [DIALOGFLOW_CX_SLOT_TYPES.NUMBER_SEQUENCE]: VoiceflowConstants.SlotType.KEY_PHRASE,
};
