import { BaseModels } from '@voiceflow/base-types';
import { VoiceflowConstants } from '@voiceflow/voiceflow-types';

import { ImportResult } from '../../shared/types';
import { nuanceMixLanguageCodeToVoiceflowLocale, nuancePrebuiltEntityToVfSlotType } from './utils';
import { ConceptName, TRSX } from './types/trsx';
import {
  extractSamplesForIntents,
  nuanceIntentSamplesToIntentInputs,
  nuanceIntentSamplesToIntentSlots,
} from './utils/intents';
import { extractAllConceptNames, extractInputsForSlots, getInputsForSlot } from './utils/slots';

export default class NuanceImportState {
  private readonly intents: ReadonlyMap<string, BaseModels.Intent> = new Map();

  private readonly slots: ReadonlyMap<ConceptName, BaseModels.Slot> = new Map();

  public constructor(trsx: TRSX, private readonly cuid: () => string) {
    this.slots = this.createSlots(trsx);
    this.intents = this.createIntents(trsx);
  }

  public toJson(): ImportResult<BaseModels.Intent, BaseModels.Slot> {
    return {
      intents: Array.from(this.intents.values()),
      slots: Array.from(this.slots.values()),
      metadata: {},
    };
  }

  private createIntents(trsx: TRSX): Map<string, BaseModels.Intent> {
    const intents = trsx.project[0].ontology?.[0].intents?.[0].intent ?? [];
    const allSamples = extractSamplesForIntents(trsx);

    return new Map(
      intents.map((nuanceIntent) => {
        const intentName: string = nuanceIntent['@name'];
        const samples = allSamples.get(intentName) ?? [];

        const intent: BaseModels.Intent = {
          key: this.cuid(),
          name: intentName,
          inputs: nuanceIntentSamplesToIntentInputs(samples, this.slots),
          slots: nuanceIntentSamplesToIntentSlots(samples, this.slots),
        };

        return [intentName, intent];
      })
    );
  }

  private createSlots(trsx: TRSX): Map<ConceptName, BaseModels.Slot> {
    const conceptNames = extractAllConceptNames(trsx);
    const locale = nuanceMixLanguageCodeToVoiceflowLocale(trsx.project[0]['@xml:lang']);
    const language = locale.slice(0, 2) as VoiceflowConstants.Language;
    const inputs = extractInputsForSlots(trsx, conceptNames, language);

    return new Map(
      conceptNames.map((conceptName) => {
        const voiceflowBuiltinSlotType = nuancePrebuiltEntityToVfSlotType(conceptName);

        const slot: BaseModels.Slot = voiceflowBuiltinSlotType
          ? {
              name: conceptName,
              key: this.cuid(),
              inputs: [],
              type: {
                value: voiceflowBuiltinSlotType,
              },
            }
          : {
              name: conceptName,
              key: this.cuid(),
              inputs: getInputsForSlot(conceptName, inputs),
              type: {
                value: 'Custom',
              },
            };

        return [conceptName, slot];
      })
    );
  }
}
