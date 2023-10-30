import { BaseModels } from '@voiceflow/base-types';
import { Utils } from '@voiceflow/common/build/cjs';
import { VoiceflowConstants } from '@voiceflow/voiceflow-types';

import { buildIntentSlot } from '../../shared/utils';
import { isRasaEntity, isRasaIntent, isRasaLookup, isRasaSynonym } from './guards';
import { RasaDataFormat } from './types';

type Language = VoiceflowConstants.Language;

// https://rasa.com/docs/rasa/training-data-format#entities
const RASA_ENTITY_ANNOTATION_REGEX = /\[([^.[\]{}]*?)]\(([^.[\]{}]*?)\)/g;
const RASA_ENTITY_ANNOTATION_JSON_REGEX = /\[([^.[\]{}]*?)]({.+?})/g;

export default class RasaImportBuilder {
  private readonly intentNameToKeyMap: Map<string, string> = new Map();

  private readonly intentNameToInputsMap: Map<string, Set<string>> = new Map();

  private readonly intentNameToSlotKeysMap: Map<string, Set<string>> = new Map();

  private readonly slotNameToKeyMap: Map<string, string> = new Map();

  private readonly slotNameToInputsMap: Map<string, Set<string>> = new Map();

  private readonly slotInputToSynonymMap: Map<string, Set<string>> = new Map();

  public constructor(private cuid: () => string, private language: Language = VoiceflowConstants.Language.EN) {}

  public toJSON() {
    return {
      intents: this.buildIntents(),
      slots: this.buildSlots(),
      metadata: {},
    };
  }

  /**
   * Main entry point to extract data from a given rasa file.
   */
  public extract(data: RasaDataFormat) {
    this.extractIntents(data);
    this.extractSynonyms(data);
    this.extractSlotsFromLookup(data);
  }

  /**
   * Compile the maps into Voiceflow intents.
   */
  private buildIntents(): BaseModels.Intent[] {
    return Array.from(this.intentNameToKeyMap.entries()).map(([name, key]) => {
      return {
        key,
        name,
        inputs: Array.from(this.intentNameToInputsMap.get(name) ?? []).map((text) => ({ text })),
        slots: Array.from(this.intentNameToSlotKeysMap.get(name) ?? []).map((id) => buildIntentSlot(id)),
      };
    });
  }

  /**
   * Compile the maps into Voiceflow slots.
   */
  private buildSlots(): BaseModels.Slot[] {
    return Array.from(this.slotNameToKeyMap.entries()).map(([name, key]) => {
      return {
        name,
        key,
        inputs: Array.from(this.slotNameToInputsMap.get(name) ?? []).flatMap((input) => {
          return [input, ...(this.slotInputToSynonymMap.get(input) ?? [])];
        }),
        type: {
          value: 'Custom',
        },
      };
    });
  }

  /**
   * Rasa entity value can have synonyms associated to them. So for any given entity, a synonym can also be used.
   * We will use both of these values as inputs for a slot.
   */
  private extractSynonyms(data: RasaDataFormat) {
    data.nlu.filter(isRasaSynonym).forEach((value) => {
      value.examples.forEach((example) => {
        Utils.map.getOrDefault(this.slotInputToSynonymMap, value.synonym, new Set()).add(example);
      });
    });
  }

  /**
   * Rasa lookups are a list of values that can be used, these are mapped directly to a slot input.
   */
  private extractSlotsFromLookup(data: RasaDataFormat) {
    data.nlu.filter(isRasaLookup).forEach((value) => {
      value.examples.forEach((example) => {
        Utils.map.getOrDefault(this.slotNameToKeyMap, value.lookup, this.cuid);
        Utils.map.getOrDefault(this.slotNameToInputsMap, value.lookup, new Set()).add(example);
      });
    });
  }

  /**
   * Rasa intents have text annotated with entities. These entities can be in two formats, a simple and extended format.
   * We match both and built slot annotations.
   */
  private extractIntents(data: RasaDataFormat) {
    data.nlu.filter(isRasaIntent).forEach((value) => {
      Utils.map.getOrDefault(
        this.intentNameToKeyMap,
        value.intent,
        () =>
          VoiceflowConstants.DEFAULT_INTENTS_MAP?.[this.language]?.find((i) => i.name === value.intent)?.name ??
          this.cuid()
      );

      const inputs = this.extractIntentUtteranceTexts(value.intent, value.examples);

      inputs.forEach((input) => {
        Utils.map.getOrDefault(this.intentNameToInputsMap, value.intent, new Set()).add(input);
      });
    });
  }

  private extractIntentUtteranceTexts(intent: string, examples: string[]) {
    return Array.from(
      new Set(
        examples
          .map((example) => {
            return example.replaceAll(RASA_ENTITY_ANNOTATION_REGEX, (_, text, entity) => {
              const key = Utils.map.getOrDefault(this.slotNameToKeyMap, entity, this.cuid);
              Utils.map.getOrDefault(this.slotNameToInputsMap, entity, new Set()).add(text);
              Utils.map.getOrDefault(this.intentNameToSlotKeysMap, intent, new Set()).add(key);

              return `{{[${entity}].${key}}}`;
            });
          })
          .map((example) => {
            return example.replaceAll(RASA_ENTITY_ANNOTATION_JSON_REGEX, (matchedString, text, jsonString) => {
              const json = JSON.parse(jsonString);
              if (!isRasaEntity(json)) return matchedString;

              const { entity, value } = json;

              const key = Utils.map.getOrDefault(this.slotNameToKeyMap, entity, this.cuid);
              Utils.map.getOrDefault(this.slotNameToInputsMap, entity, new Set()).add(text);
              Utils.map.getOrDefault(this.intentNameToSlotKeysMap, intent, new Set()).add(key);
              if (value) {
                Utils.map.getOrDefault(this.slotInputToSynonymMap, text, new Set()).add(value);
              }

              return `{{[${entity}].${key}}}`;
            });
          })
      )
    );
  }
}
