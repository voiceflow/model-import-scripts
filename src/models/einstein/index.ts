import { BaseModels } from '@voiceflow/base-types';
import { Utils } from '@voiceflow/common/build/cjs';
import { VoiceflowConstants } from '@voiceflow/voiceflow-types';
import Papa from 'papaparse';

import { ImportResult } from '../../shared/types';
import { buildIntent } from '../../shared/utils';
import { EINSTEIN_INTENT_DOMAIN_NAME } from './const';
import { slug } from 'cuid';

interface EinsteinParseResult {
  MlDomainName: string;
  MlIntentName: string;
  Utterance: string;
  Language: string;
}

interface EinsteinFormatResult {
  intentName: string;
  utterance: string;
  language: string;
}

const formatParseResult = (result: EinsteinParseResult): EinsteinFormatResult => ({
  intentName: result.MlIntentName,
  utterance: result.Utterance,
  language: result.Language.slice(0, 2).toLocaleLowerCase(),
});

export class EinsteinImport {
  public importCSV(csv: string): ImportResult<BaseModels.Intent, never> {
    const { data } = Papa.parse<EinsteinParseResult>(csv, { header: true });

    let detectedLanguage: VoiceflowConstants.Language | undefined;

    // Map intents using the name to avoid creating duplicates,
    // since each line in the csv is an intent + utterance
    const intentsMap = new Map<string, BaseModels.Intent>();

    const buildResult = ({ intentName, utterance, language }: EinsteinFormatResult) => {
      // Use first instance as the detected language
      if (!detectedLanguage && VoiceflowConstants.isVoiceflowLanguage(language)) {
        detectedLanguage = language;
      }

      const intent = Utils.map.getOrDefault(intentsMap, intentName, () =>
        buildIntent(
          intentName,
          VoiceflowConstants.DEFAULT_INTENTS_MAP[language].find((i) => i.name === intentName)?.name ??
            slug()
        )
      );

      // The CSV does not contain slot annotations, so we cannot extract any from the utterance
      intent.inputs.push({
        text: utterance,
        slots: [],
      });

      return intentsMap;
    };

    data
      .filter((result) => result.MlDomainName === EINSTEIN_INTENT_DOMAIN_NAME)
      .map(formatParseResult)
      .forEach(buildResult);

    return {
      intents: Array.from(intentsMap.values()),
      slots: [],
      metadata: {
        language: detectedLanguage,
      },
    };
  }
}
