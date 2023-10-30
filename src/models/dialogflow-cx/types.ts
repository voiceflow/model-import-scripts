// https://cloud.google.com/dialogflow/cx/docs/reference/rest/v3/projects.locations.agents.entityTypes#EntityType
export interface EntityType {
  name: string;
  displayName: string;
  kind?: 'KIND_MAP' | 'KIND_UNSPECIFIED' | 'KIND_LIST' | 'KIND_REGEXP';
  autoExpansionMode?: 'AUTO_EXPANSION_MODE_UNSPECIFIED' | 'AUTO_EXPANSION_MODE_NON_DEFAULT';
  enableFuzzyExtraction?: boolean;
  redact?: boolean;
}

export interface Entity {
  value: string;
  synonyms: string[];
}

// https://cloud.google.com/dialogflow/cx/docs/reference/rest/v3/projects.locations.agents.intents#Intent
export interface Intent {
  name: string;
  displayName: string;
  parameters?: {
    id: string;
    entityType: string;
    isList?: boolean;
  }[];
  priority?: number;
  isFallback?: boolean;
  labels?: Record<string, string>;
  description?: string;
}

export interface TrainingPhrase {
  id: string;
  parts: { text: string; parameterId?: string }[];
  repeatCount?: number;
  languageCode?: string;
}
