/* eslint-disable no-restricted-syntax */
import { Common } from '@voiceflow/backend-utils';
import { BaseModels } from '@voiceflow/base-types';
import { Utils } from '@voiceflow/common/build/cjs';
import JSZip from 'jszip';
import _ from 'lodash';
import { TextDecoder } from 'node:util';

import { ImportResult } from '../../shared/types';

import { DIALOGFLOW_CX_SLOT_TYPES, DIALOGFLOW_TO_VOICEFLOW_SLOT_TYPE_MAP } from './constants';
import * as DialogflowCX from './types';

const getFilePath = (path: string) => path.split('/').slice(0, -1).join('/');

const sanitizeSlotName = (name: string) => name.replace(/\W/g, '');

export class DialogflowCXImport {
  private decoder = new TextDecoder();

  private async interateFiles<T>(
    reader: Common.ZipReader,
    path: string,
    handle: (data: T, fileName: string) => Promise<void> | void
  ) {
    for await (const file of reader.getFiles({ path })) {
      try {
        const data = JSON.parse(file.toString(this.decoder));
        if (!data) continue;

        await handle(data, file.name);
      } catch {
        continue;
      }
    }
  }

  public async importZip(zip: JSZip): Promise<ImportResult<BaseModels.Intent, BaseModels.Slot>> {
    const reader = new Common.ZipReader(zip);

    const VF_entity_map: Record<string, BaseModels.Slot> = {};
    const VF_intents: BaseModels.Intent[] = [];

    /** get entities */
    await this.interateFiles<DialogflowCX.EntityType>(reader, 'entityTypes/*/*.json', async (entityType, fileName) => {
      const VF_entity: BaseModels.Slot = {
        key: Utils.id.cuid.slug(),
        name: entityType.displayName,
        type: { value: 'Custom' },
        inputs: [],
      };

      await this.interateFiles<{ entities: DialogflowCX.Entity[] }>(
        reader,
        `${getFilePath(fileName)}/entities/*.json`,
        ({ entities }) =>
          entities.forEach((entity) =>
            VF_entity.inputs.push([entity.value, ...entity.synonyms].map((e) => e.trim()).join(','))
          )
      );

      VF_entity_map[VF_entity.name] = VF_entity;
    });

    await this.interateFiles<DialogflowCX.Intent>(reader, 'intents/*/*.json', async (intent, fileName) => {
      const VF_intent: BaseModels.Intent = {
        key: Utils.id.cuid.slug(),
        name: intent.displayName,
        inputs: [],
        slots: [],
      };

      const intentEntities = (intent.parameters ?? [])
        .map((parameter) => {
          // handle built-in entities
          if (parameter.entityType.startsWith('@sys.')) {
            VF_entity_map[parameter.entityType] ??= {
              key: Utils.id.cuid.slug(),
              name: parameter.entityType,
              type: {
                value:
                  DIALOGFLOW_TO_VOICEFLOW_SLOT_TYPE_MAP[parameter.entityType as DIALOGFLOW_CX_SLOT_TYPES] ?? 'Custom',
              },
              inputs: [],
            };
            return [parameter.id, parameter.entityType];
          }

          // handle custom entities
          const sanitizedEntityType = parameter.entityType.replace('@', '');
          if (!(sanitizedEntityType in VF_entity_map)) return null;

          return [parameter.id, sanitizedEntityType];
        })
        .filter(Utils.array.isNotNullish);

      const parameterEntityMap: Record<string, string> = Object.fromEntries(intentEntities);

      await this.interateFiles<{ trainingPhrases: DialogflowCX.TrainingPhrase[] }>(
        reader,
        `${getFilePath(fileName)}/trainingPhrases/*.json`,
        ({ trainingPhrases }) => {
          trainingPhrases.forEach((trainingPhrase) => {
            const slots: string[] = [];
            const parts = trainingPhrase.parts.map((part) => {
              const entityName = part.parameterId ? parameterEntityMap[part.parameterId] : '';

              if (entityName in VF_entity_map) {
                const entity = VF_entity_map[entityName];
                slots.push(entity.key);
                return `{{[${sanitizeSlotName(entity.name)}].${entity.key}}}`;
              }

              return part.text;
            });

            VF_intent.inputs.push({ text: parts.join(''), slots });
          });
        }
      );

      VF_intent.inputs = _.uniqBy(VF_intent.inputs, ({ text }) => text);
      VF_intents.push(VF_intent);
    });

    return {
      intents: VF_intents,
      slots: Object.values(VF_entity_map),
      metadata: {},
    };
  }
}
