import { BaseModels } from '@voiceflow/base-types';
import { create } from 'xmlbuilder2';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

import { ImportResult } from '../../shared/types';

import NuanceImportState from './state';
import { TRSX } from './types/trsx';
import cuid from 'cuid';

export class NuanceMixImport {
  public static xmlParse(xmlString: string): XMLBuilder {
    return create(xmlString);
  }

  public importTrsx(xml: XMLBuilder): ImportResult<BaseModels.Intent, BaseModels.Slot> {
    const trsx = JSON.parse(xml.end({ format: 'json', verbose: true, group: false })) as TRSX;

    const state = new NuanceImportState(trsx, cuid);

    return state.toJson();
  }
}
