import { BaseModels } from '@voiceflow/base-types';
import { Utils } from '@voiceflow/common/build/cjs';
import { VoiceflowConstants } from '@voiceflow/voiceflow-types';
import Papa from 'papaparse';

import { ImportResult } from '../../shared/types';

import { buildIntent, buildIntentSlot, buildSlot } from '../../shared/utils';
import { extractSlotNamesFromUtterance, formatUtteranceSlotAnnotations } from './utils';
import { slug } from 'cuid';

export default class VoiceflowImport {
  public importCSV(csv: string): ImportResult<BaseModels.Intent, BaseModels.Slot> {
    // Map intents and lots using the name to avoid creating duplicates,
    // since each line in the csv is an intent + utterance
    const intentsMap = new Map<string, BaseModels.Intent>();
    const slotsMap = new Map<string, BaseModels.Slot>();

    /**
     * Given an intent name and utterance, create a Voiceflow Intent and Slots (if any)
     */
    const parseIntentNameAndUtterances = (intentName: string, utterance: string) => {
      // Find or create intent
      const intent = Utils.map.getOrDefault(intentsMap, intentName, () =>
        buildIntent(
          intentName,
          VoiceflowConstants.DEFAULT_INTENTS_MAP[VoiceflowConstants.Language.EN].find((i) => i.name === intentName)
            ?.name ?? slug()
        )
      );

      // Find or create slots
      const slotNames = extractSlotNamesFromUtterance(utterance);
      const slots = slotNames.map((slotName) =>
        Utils.map.getOrDefault(slotsMap, slotName, () => buildSlot(slotName, slug()))
      );

      // Convert slot annotations to VF format
      const text = formatUtteranceSlotAnnotations(slotsMap, utterance);

      // Add utterance text and slots to intent
      intent.inputs.push({
        text,
        slots: slots.map((slot) => slot.key),
      });

      // Add slots to intent
      intent.slots!.push(
        ...slots
          .filter((slot) => !intent.slots!.find(({ id }) => id === slot.key))
          .map((slot) => buildIntentSlot(slot.key))
      );

      intentsMap.set(intentName, intent);
    };

    const result = Papa.parse(csv, {
      header: false,
      transform: (value) => value.trim(),
    });

    const rows = result.data as [string, string][];

    rows
      .filter(([intentName, utterance]) => !!intentName && !!utterance)
      .forEach(([intentName, utterance]) => parseIntentNameAndUtterances(intentName, utterance));

    return {
      intents: Array.from(intentsMap.values()),
      slots: Array.from(slotsMap.values()),
      metadata: {},
    };
  }
}
