import { VoiceflowConstants } from '@voiceflow/voiceflow-types';
import _invert from 'lodash/invert';

import { ConceptName } from './types/trsx';

type MaybeSlotType = VoiceflowConstants.SlotType | undefined;
type Locale = VoiceflowConstants.Locale;

/**
 * @see https://docs.mix.nuance.com/mix-datapack/v9_x/#predefined-entities
 */
export enum NuanceMixPredefinedEntities {
  AMOUNT = 'nuance_AMOUNT',
  BOOLEAN = 'nuance_BOOLEAN',
  CALENDARX = 'nuance_CALENDARX',
  // eslint-disable-next-line no-secrets/no-secrets
  CARDINAL_NUMBER = 'nuance_CARDINAL_NUMBER',
  DISTANCE = 'nuance_DISTANCE',
  DOUBLE = 'nuance_DOUBLE',
  DURATION = 'nuance_DURATION',
  DURATION_RANGE = 'nuance_DURATION_RANGE',
  CREDIT_CARD_EXPIRY_DATE = 'nuance_EXPIRY_DATE',
  GENERIC_ORDER = 'nuance_GENERIC_ORDER',
  GLOBAL = 'nuance_GLOBAL',
  NUMBER = 'nuance_NUMBER',
  // eslint-disable-next-line no-secrets/no-secrets
  ORDINAL_NUMBER = 'nuance_ORDINAL_NUMBER',
  QUANTITY = 'nuance_QUANTITY',
  TEMPERATURE = 'nuance_TEMPERATURE',
}

const allNuanceMixPredefinedEntities = new Set(Object.values(NuanceMixPredefinedEntities));
export const isPredefinedNuanceEntity = (entity: ConceptName): entity is NuanceMixPredefinedEntities => {
  return allNuanceMixPredefinedEntities.has(entity as any);
};

export const VF_SLOT_TO_NUANCE_MIX = {
  [VoiceflowConstants.SlotType.CURRENCY]: NuanceMixPredefinedEntities.AMOUNT,
  // This is kinda a hack
  [VoiceflowConstants.SlotType.AGE]: NuanceMixPredefinedEntities.DURATION,
  [VoiceflowConstants.SlotType.DATETIME]: NuanceMixPredefinedEntities.CALENDARX,
  [VoiceflowConstants.SlotType.NUMBER]: NuanceMixPredefinedEntities.NUMBER,
  [VoiceflowConstants.SlotType.ORDINAL]: NuanceMixPredefinedEntities.ORDINAL_NUMBER,
  [VoiceflowConstants.SlotType.TEMPERATURE]: NuanceMixPredefinedEntities.TEMPERATURE,
};

export const NUANCE_MIX_TO_VF_SLOT = {
  [NuanceMixPredefinedEntities.AMOUNT]: VoiceflowConstants.SlotType.CURRENCY,
  [NuanceMixPredefinedEntities.CALENDARX]: VoiceflowConstants.SlotType.DATETIME,
  [NuanceMixPredefinedEntities.CARDINAL_NUMBER]: VoiceflowConstants.SlotType.NUMBER,
  [NuanceMixPredefinedEntities.DOUBLE]: VoiceflowConstants.SlotType.NUMBER,
  [NuanceMixPredefinedEntities.DURATION]: VoiceflowConstants.SlotType.AGE,
  [NuanceMixPredefinedEntities.GENERIC_ORDER]: VoiceflowConstants.SlotType.ORDINAL,
  [NuanceMixPredefinedEntities.NUMBER]: VoiceflowConstants.SlotType.NUMBER,
  [NuanceMixPredefinedEntities.ORDINAL_NUMBER]: VoiceflowConstants.SlotType.ORDINAL,
  [NuanceMixPredefinedEntities.TEMPERATURE]: VoiceflowConstants.SlotType.TEMPERATURE,
};

const isNuanceEntityMappableToVfSlotType = (
  conceptName: ConceptName
): conceptName is keyof typeof NUANCE_MIX_TO_VF_SLOT => {
  return isPredefinedNuanceEntity(conceptName) && conceptName in NUANCE_MIX_TO_VF_SLOT;
};

export const nuancePrebuiltEntityToVfSlotType = (conceptName: ConceptName): MaybeSlotType => {
  if (isNuanceEntityMappableToVfSlotType(conceptName)) {
    return NUANCE_MIX_TO_VF_SLOT[conceptName];
  }

  return undefined;
};

/** @see https://docs.mix.nuance.com/languages/#languages */
const NUANCE_MIX_LANGUAGE_CODE_TO_LANGUAGE_CODE = {
  'ara-XWW': 'ar-WW',
  'cat-ESP': 'ca-ES',
  'hrv-HRV': 'hr-HR',
  'ces-CZE': 'cs-CZ',
  'dan-DNK': 'da-DK',
  'nld-NLD': 'nl-NL',
  'eng-AUS': 'en-AU',
  'eng-USA': 'en-US',
  'eng-IND': 'en-IN',
  'eng-GBR': 'en-GB',
  'fin-FIN': 'fi-FI',
  'fra-CAN': 'fr-CA',
  'fra-FRA': 'fr-FR',
  'deu-DEU': 'de-DE',
  'ell-GRC': 'el-GR',
  'heb-ISR': 'he-IL',
  'hin-IND': 'hi-IN',
  'hun-HUN': 'hu-HU',
  'ind-IDN': 'id-ID',
  'ita-ITA': 'it-IT',
  'jpn-JPN': 'ja-JP',
  'kor-KOR': 'ko-KR',
  'zlm-MYS': 'ms-MY',
  'nor-NOR': 'no-NO',
  'pol-POL': 'pl-PL',
  'por-BRA': 'pt-BR',
  'por-PRT': 'pt-PT',
  'ron-ROU': 'ro-RO',
  'rus-RUS': 'ru-RU',
  'wuu-CHN': 'zh-WU',
  'cmn-CHN': 'zh-CN',
  'slk-SVK': 'sk-SK',
  'spa-ESP': 'es-ES',
  'spa-XLA': 'es-US',
  'swe-SWE': 'sv-SE',
  'tha-THA': 'th-TH',
  'yue-CHS': 'cn-HK',
  'cmn-TWN': 'zh-TW',
  'tur-TUR': 'tr-TR',
  'ukr-UKR': 'uk-UA',
  'vie-VNM': 'vi-VN',
} as const;

// TODO(trs): move to common
type InvertDictionary<T extends Record<PropertyKey, PropertyKey>> = {
  [P in keyof T as T[P]]: P;
};

const LANGUAGE_CODE_TO_NUANCE_MIX_LANGUAGE_CODE = _invert(
  NUANCE_MIX_LANGUAGE_CODE_TO_LANGUAGE_CODE
) as InvertDictionary<typeof NUANCE_MIX_LANGUAGE_CODE_TO_LANGUAGE_CODE>;

export type NuanceMixLanguageCode = keyof typeof NUANCE_MIX_LANGUAGE_CODE_TO_LANGUAGE_CODE;

type LanguageCode =
  typeof NUANCE_MIX_LANGUAGE_CODE_TO_LANGUAGE_CODE[keyof typeof NUANCE_MIX_LANGUAGE_CODE_TO_LANGUAGE_CODE];

const LANGUAGE_CODE_TO_VOICEFLOW_LOCALE: Record<LanguageCode, VoiceflowConstants.Locale> = {
  // Supported
  'en-US': VoiceflowConstants.Locale.EN_US,
  'zh-CN': VoiceflowConstants.Locale.ZH_CN,
  'nl-NL': VoiceflowConstants.Locale.NL_NL,
  'fr-CA': VoiceflowConstants.Locale.FR_CA,
  'fr-FR': VoiceflowConstants.Locale.FR_FR,
  'de-DE': VoiceflowConstants.Locale.DE_DE,
  'hi-IN': VoiceflowConstants.Locale.HI_IN,
  'it-IT': VoiceflowConstants.Locale.IT_IT,
  'ja-JP': VoiceflowConstants.Locale.JA_JP,
  'ko-KR': VoiceflowConstants.Locale.KO_KR,
  'pt-BR': VoiceflowConstants.Locale.PT_BR,
  'es-ES': VoiceflowConstants.Locale.ES_ES,

  // Sorta supported
  'ar-WW': VoiceflowConstants.Locale.AR_AR,
  'pt-PT': VoiceflowConstants.Locale.PT_BR,
  'es-US': VoiceflowConstants.Locale.ES_MX,
  'cn-HK': VoiceflowConstants.Locale.ZH_CN,
  'zh-TW': VoiceflowConstants.Locale.ZH_CN,

  // Not supported
  'ca-ES': VoiceflowConstants.Locale.EN_US,
  'hr-HR': VoiceflowConstants.Locale.EN_US,
  'cs-CZ': VoiceflowConstants.Locale.EN_US,
  'da-DK': VoiceflowConstants.Locale.EN_US,
  'en-AU': VoiceflowConstants.Locale.EN_US,
  'en-IN': VoiceflowConstants.Locale.EN_US,
  'en-GB': VoiceflowConstants.Locale.EN_US,
  'fi-FI': VoiceflowConstants.Locale.EN_US,
  'el-GR': VoiceflowConstants.Locale.EN_US,
  'he-IL': VoiceflowConstants.Locale.EN_US,
  'hu-HU': VoiceflowConstants.Locale.EN_US,
  'id-ID': VoiceflowConstants.Locale.EN_US,
  'ms-MY': VoiceflowConstants.Locale.EN_US,
  'no-NO': VoiceflowConstants.Locale.EN_US,
  'pl-PL': VoiceflowConstants.Locale.EN_US,
  'ro-RO': VoiceflowConstants.Locale.EN_US,
  'ru-RU': VoiceflowConstants.Locale.EN_US,
  'zh-WU': VoiceflowConstants.Locale.EN_US,
  'sk-SK': VoiceflowConstants.Locale.EN_US,
  'sv-SE': VoiceflowConstants.Locale.EN_US,
  'th-TH': VoiceflowConstants.Locale.EN_US,
  'tr-TR': VoiceflowConstants.Locale.EN_US,
  'uk-UA': VoiceflowConstants.Locale.EN_US,
  'vi-VN': VoiceflowConstants.Locale.EN_US,
} as const;

const VOICEFLOW_LOCALE_TO_LANGUAGE_CODE: Readonly<Record<VoiceflowConstants.Locale, LanguageCode>> = {
  // Supported
  [VoiceflowConstants.Locale.EN_US]: 'en-US',
  [VoiceflowConstants.Locale.ZH_CN]: 'zh-CN',
  [VoiceflowConstants.Locale.NL_NL]: 'nl-NL',
  [VoiceflowConstants.Locale.FR_CA]: 'fr-CA',
  [VoiceflowConstants.Locale.FR_FR]: 'fr-FR',
  [VoiceflowConstants.Locale.DE_DE]: 'de-DE',
  [VoiceflowConstants.Locale.HI_IN]: 'hi-IN',
  [VoiceflowConstants.Locale.IT_IT]: 'it-IT',
  [VoiceflowConstants.Locale.JA_JP]: 'ja-JP',
  [VoiceflowConstants.Locale.KO_KR]: 'ko-KR',
  [VoiceflowConstants.Locale.PT_BR]: 'pt-BR',
  [VoiceflowConstants.Locale.ES_ES]: 'es-ES',

  // Sorta supported
  [VoiceflowConstants.Locale.AR_AR]: 'ar-WW',
  [VoiceflowConstants.Locale.ES_MX]: 'es-US',

  // Not supported
  [VoiceflowConstants.Locale.GU_IN]: 'en-US',
  [VoiceflowConstants.Locale.MR_IN]: 'en-US',
  [VoiceflowConstants.Locale.TA_IN]: 'en-US',
  [VoiceflowConstants.Locale.TE_IN]: 'en-US',
  [VoiceflowConstants.Locale.TR_TR]: 'en-US',
  [VoiceflowConstants.Locale.ZH_TW]: 'en-US',
  [VoiceflowConstants.Locale.BG_BG]: 'en-US',
  [VoiceflowConstants.Locale.CS_CZ]: 'en-US',
  [VoiceflowConstants.Locale.DA_DK]: 'en-US',
  [VoiceflowConstants.Locale.CA_ES]: 'en-US',
  [VoiceflowConstants.Locale.NL_BE]: 'en-US',
  [VoiceflowConstants.Locale.ET_EE]: 'en-US',
  [VoiceflowConstants.Locale.PL_PL]: 'en-US',
  [VoiceflowConstants.Locale.PT_PT]: 'en-US',
  [VoiceflowConstants.Locale.RU_RU]: 'en-US',
  [VoiceflowConstants.Locale.RO_RO]: 'en-US',
  [VoiceflowConstants.Locale.UK_UA]: 'en-US',
  [VoiceflowConstants.Locale.HE_IL]: 'en-US',
  [VoiceflowConstants.Locale.HU_HU]: 'en-US',
  [VoiceflowConstants.Locale.VI_VN]: 'en-US',
};

export const nuanceMixLanguageCodeToVoiceflowLocale = (nuanceMixLanguageCode: NuanceMixLanguageCode): Locale => {
  const languageCode = NUANCE_MIX_LANGUAGE_CODE_TO_LANGUAGE_CODE[nuanceMixLanguageCode];

  return LANGUAGE_CODE_TO_VOICEFLOW_LOCALE[languageCode];
};

export const voiceflowLocaleToNuanceMixLanguageCode = (voiceflowLocale: Locale): NuanceMixLanguageCode => {
  const languageCode = VOICEFLOW_LOCALE_TO_LANGUAGE_CODE[voiceflowLocale];

  return LANGUAGE_CODE_TO_NUANCE_MIX_LANGUAGE_CODE[languageCode];
};
