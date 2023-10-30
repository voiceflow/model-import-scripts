import * as Common from '@voiceflow/common/build/cjs';

import { RasaDataFormat, RasaEntity, RasaIntent, RasaLookup, RasaSynonym } from './types';

export const isRasaDataFormat = (value: unknown): value is RasaDataFormat =>
  value != null && typeof value === 'object' && Common.object.hasProperty(value, 'nlu') && Array.isArray(value.nlu);

export const isRasaSynonym = (nlu: unknown): nlu is RasaSynonym =>
  nlu != null && typeof nlu === 'object' && Common.object.hasProperty(nlu, 'synonym');

export const isRasaIntent = (nlu: unknown): nlu is RasaIntent =>
  nlu != null && typeof nlu === 'object' && Common.object.hasProperty(nlu, 'intent');

export const isRasaLookup = (nlu: unknown): nlu is RasaLookup =>
  nlu != null && typeof nlu === 'object' && Common.object.hasProperty(nlu, 'lookup');

export const isRasaEntity = (value: unknown): value is RasaEntity =>
  value != null && typeof value === 'object' && Common.object.hasProperty(value, 'entity');
