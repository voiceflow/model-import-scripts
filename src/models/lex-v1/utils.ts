import { AlexaConstants } from '@voiceflow/alexa-types';
import { VoiceflowConstants } from '@voiceflow/voiceflow-types';

export const getAmazonSlotType = (slotType: string): string =>
  AlexaConstants.VoiceflowToAmazonSlotMap[slotType as VoiceflowConstants.SlotType] || slotType;

export const getAmazonIntentName = (intentName: string): string | undefined =>
  AlexaConstants.VoiceflowToAmazonIntentMap[intentName as VoiceflowConstants.IntentName];

export const isCustomType = (slotType: string): boolean =>
  slotType.toUpperCase() === AlexaConstants.IntentPrefix.CUSTOM;
