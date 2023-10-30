import { Project } from './project';

export type IntentName = string;
export type ConceptName = string;

export interface TRSX {
  // TODO: Once ESLint is upgraded this should be changed from T[] to [T]
  project: Project[];
}
