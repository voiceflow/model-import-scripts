import { NuanceMixLanguageCode } from '../../utils';
import { Dictionaries } from './dictionaries';
import { Metadata } from './metadata';
import { Ontology } from './ontology';
import { Samples } from './samples';

export interface Project {
  '@xmlns:nuance'?: string;
  '@xml:lang': NuanceMixLanguageCode;
  '@nuance:version': string;
  // TODO: Once ESLint is upgraded these should all be changed from T[] to [T]
  metadata?: Metadata[];
  ontology?: Ontology[];
  dictionaries?: Dictionaries[];
  samples?: Samples[];

  sources?: unknown;
}
