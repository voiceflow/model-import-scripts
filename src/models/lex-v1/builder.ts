import { AlexaConstants } from '@voiceflow/alexa-types';
import { BaseModels } from '@voiceflow/base-types';
import { SLOT_ANNOTATION_SIMPLE_REGEX, Utils } from '@voiceflow/common/build/cjs';
import { VoiceflowConstants } from '@voiceflow/voiceflow-types';

import { ImportResult } from '../../shared/types';

import {
  isLexBotFile,
  isLexIntentFile,
  LexBotResource,
  LexIntentResource,
  LexSlotResource,
  LexStructure,
} from './types';

export default class LexImportBuilder {
  private slotIDBuilder = new Map<string, string>();

  private slotTypeBuilder = new Map<string, string>();

  private slotUtteranceBuilder = new Map<string, string[]>();

  private intentsMap = new Map<string, BaseModels.Intent>();

  private detectedLanguage: VoiceflowConstants.Language | undefined;

  public constructor(private cuid: () => string) {}

  public addLexFile(lexFile: LexStructure<unknown>): void {
    if (isLexBotFile(lexFile)) {
      this.formatMetadata(lexFile.resource);

      lexFile.resource.slotTypes?.forEach(this.formatLexSlotUtterances.bind(this));

      lexFile.resource.intents.forEach(this.formatLexIntentToIntent.bind(this));
    } else if (isLexIntentFile(lexFile)) {
      lexFile.resource.slotTypes.forEach(this.formatLexSlotUtterances.bind(this));

      this.formatLexIntentToIntent(lexFile.resource);
    }
  }

  public toJSON(): ImportResult<BaseModels.Intent, BaseModels.Slot> {
    return {
      intents: this.buildIntents(),
      slots: this.buildSlots(),
      metadata: {
        language: this.detectedLanguage,
      },
    };
  }

  private formatMetadata(resource: LexBotResource) {
    const language = resource.locale?.slice(0, 2).toLocaleLowerCase();
    if (VoiceflowConstants.isVoiceflowLanguage(language)) {
      this.detectedLanguage = language;
    }
  }

  private formatLexIntentToIntent(resource: LexIntentResource): void {
    const slots: BaseModels.Intent['slots'] = resource.slots.map((slot) => {
      Utils.map.getOrDefault(this.slotTypeBuilder, slot.name, slot.slotType);

      return {
        id: Utils.map.getOrDefault(this.slotIDBuilder, slot.name, this.cuid),
        dialog: {
          prompt: slot.valueElicitationPrompt.messages.map((message) => ({ text: message.content, slots: [] })),
          confirm: [],
          utterances: slot.sampleUtterances?.map((utterance) => ({ text: utterance, slots: [] })) ?? [],
          confirmEnabled: false,
        },
        required: slot.slotConstraint === 'Required',
      };
    });

    const inputs: BaseModels.Intent['inputs'] = resource.sampleUtterances.map((utterance) => ({
      text: utterance,
      slots: [],
    }));

    this.intentsMap.set(resource.name, {
      key: this.cuid(),
      name: resource.name,
      inputs,
      slots,
    });
  }

  private formatLexSlotUtterances(resource: LexSlotResource): void {
    Utils.map.getOrDefault(this.slotUtteranceBuilder, resource.name, () =>
      resource.enumerationValues.map(({ value, synonyms }) => [value, ...(synonyms ?? [])].join(','))
    );
  }

  private buildIntents(): BaseModels.Intent[] {
    return Array.from(this.intentsMap.values()).map((intent) => {
      // eslint-disable-next-line no-param-reassign
      intent.inputs = intent.inputs.map(({ text }) => this.formatInputSlots(text));
      // eslint-disable-next-line no-param-reassign
      intent.slots = intent.slots?.map((slot) => {
        // eslint-disable-next-line no-param-reassign
        slot.dialog.prompt = slot.dialog.prompt.map((prompt) => this.formatInputSlots(prompt as any));
        // eslint-disable-next-line no-param-reassign
        slot.dialog.utterances = slot.dialog.utterances.map((utterance) => this.formatInputSlots(utterance.text));
        return slot;
      });
      return intent;
    });
  }

  private buildSlots(): BaseModels.Slot[] {
    return Array.from(this.slotIDBuilder.entries()).map(([slotName, slotID]) => {
      const slotType = this.slotTypeBuilder.get(slotName)!;
      const inputs = this.slotUtteranceBuilder.get(slotType) ?? [];

      const builtInSlotType = AlexaConstants.AmazonToVoiceflowSlotMap[slotType as AlexaConstants.SlotType];

      return {
        name: slotName,
        key: slotID,
        inputs,
        type: {
          value: builtInSlotType ?? 'Custom',
        },
      };
    });
  }

  // Inputs are not annotated with slots until we gather all slot information.
  // Here we annotate the utterances and slots correctly using all slot info gathered throughout parsing the lex files.
  private formatInputSlots(input: string) {
    const slots = Array.from(
      new Set(Array.from(input.matchAll(SLOT_ANNOTATION_SIMPLE_REGEX)).map((value) => value[1]))
    ).map((slotName) => this.slotIDBuilder.get(slotName)!);

    const text = input.replaceAll(
      SLOT_ANNOTATION_SIMPLE_REGEX,
      (_, slotName) => `{{[${slotName}].${this.slotIDBuilder.get(slotName)!}}}`
    );

    return {
      text,
      slots,
    };
  }
}
