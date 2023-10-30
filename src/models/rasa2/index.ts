import { Common } from '@voiceflow/backend-utils';
import { BaseModels } from '@voiceflow/base-types';
import JSZip from 'jszip';
import { TextDecoder } from 'util';

import { ImportResult } from '../../shared/types';

import RasaImportBuilder from './builder';
import { parseRasaYaml } from './utils';
import { slug } from 'cuid';

export default class RasaImport {
  public async importZip(zip: JSZip): Promise<ImportResult<BaseModels.Intent, BaseModels.Slot>> {
    const state = new RasaImportBuilder(slug);
    const decoder = new TextDecoder();
    const reader = new Common.ZipReader(zip);

    // eslint-disable-next-line no-restricted-syntax
    for await (const file of reader.getFiles({ path: '**/*.y?(a)ml' })) {
      try {
        const data = parseRasaYaml(file.toString(decoder));
        if (!data) continue;

        state.extract(data);
      } catch {
        continue;
      }
    }

    return state.toJSON();
  }

  public async importYaml(contents: string): Promise<ImportResult<BaseModels.Intent, BaseModels.Slot>> {
    const state = new RasaImportBuilder(slug);

    const data = parseRasaYaml(contents);

    state.extract(data);

    return state.toJSON();
  }
}
