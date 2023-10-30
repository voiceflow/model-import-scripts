import { Concepts } from './concepts';
import { Intents } from './intents';

export interface Ontology {
  // TODO: Once ESLint is upgraded these should all be changed from T[] to [T]
  intents?: Intents[];
  // TODO: Once ESLint is upgraded these should all be changed from T[] to [T]
  concepts?: Concepts[];
}
