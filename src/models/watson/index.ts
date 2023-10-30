import { BaseModels } from '@voiceflow/base-types';
import { VoiceflowConstants } from '@voiceflow/voiceflow-types';
// eslint-disable-next-line you-dont-need-lodash-underscore/uniq
import { uniq, uniqBy } from 'lodash';

import { ImportResult } from '../../shared/types';
import { buildIntentSlot } from '../../shared/utils';
import { isWatsonWorkspace } from './guards';
import { WatsonIntentExample } from './types';
import { slug } from 'cuid';

type IntentSlot = BaseModels.IntentSlot;

export class WatsonImport {
  public importJSON(workspace: unknown): ImportResult<BaseModels.Intent, BaseModels.Slot> {
    if (!isWatsonWorkspace(workspace)) {
      throw new Error('Expected Watson Workspace JSON');
    }

    // Create slots from Watson Entities
    const slots = workspace.entities.map<BaseModels.Slot>((entity) => {
      return {
        key: slug(),
        name: entity.entity,
        inputs: entity.values.flatMap((value) => [value.value, ...(value.synonyms ?? [])].join(',')),
        type: {
          value: 'Custom',
        },
      };
    });

    // Create intents from Watson Intents
    const intents = workspace.intents.map<BaseModels.Intent>((intent) => {
      // Get all unique inputs based on the input text
      const inputs = uniqBy(
        intent.examples.map((example) => this.buildIntentInput(example, slots)),
        'text'
      );

      // Get all unique slot IDs and build intent slots from them
      const inputSlots = uniq(inputs.flatMap((input) => input.slots ?? [])).map<IntentSlot>((slotKey) =>
        buildIntentSlot(slotKey)
      );

      return {
        key:
          VoiceflowConstants.DEFAULT_INTENTS_MAP[VoiceflowConstants.Language.EN].find((i) => i.name === intent.intent)
            ?.name ?? slug(),
        name: intent.intent,
        inputs,
        slots: inputSlots,
      };
    });

    return {
      intents,
      slots,
      metadata: {},
    };
  }

  /**
   * Find and replace all slot mentions with a slot annotation
   */
  private buildIntentInput(example: WatsonIntentExample, slots: BaseModels.Slot[]): BaseModels.IntentInput {
    const textParts: string[] = [];
    const intentSlotKeys: string[] = [];

    let index = 0;
    example.mentions?.forEach((mention) => {
      const [startIndex, endIndex] = mention.location;

      const slot = slots.find(({ name }) => name === mention.entity);
      if (!slot) return;

      intentSlotKeys.push(slot.key);

      textParts.push(example.text.substring(index, startIndex));
      textParts.push(`{{[${slot.name}].${slot.key}}}`);

      index = endIndex;
    });

    textParts.push(example.text.substring(index));

    return {
      text: textParts.join(''),
      slots: intentSlotKeys,
    };
  }
}
