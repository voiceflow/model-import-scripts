import { Common } from '@voiceflow/backend-utils';
import { BaseModels } from '@voiceflow/base-types';
import JSZip from 'jszip';
import { TextDecoder } from 'util';
import {slug} from 'cuid';

import { ImportResult } from '../../shared/types';

import LexImportBuilder from './builder';
import { LexStructure } from './types';

export default class LexImport {
  public async importZip(zip: JSZip): Promise<ImportResult<BaseModels.Intent, BaseModels.Slot>> {
    const builder = new LexImportBuilder(slug);

    const reader = new Common.ZipReader(zip);

    // eslint-disable-next-line no-restricted-syntax
    for await (const file of reader.getFiles()) {
      try {
        const lexFile = JSON.parse(new TextDecoder().decode(file.content)) as LexStructure<unknown>;
        builder.addLexFile(lexFile);
      } catch (err) {
        if (err instanceof SyntaxError) continue;
        throw err;
      }
    }

    return builder.toJSON();
  }
}
