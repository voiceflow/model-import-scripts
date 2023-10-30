export interface WatsonEntityValue {
  value: string;
  type: 'synonyms' | 'patterns';
  synonyms?: string[];
  patterns?: string[];
}

export interface WatsonEntity {
  entity: string;
  values: WatsonEntityValue[];
  fuzzy_match?: boolean;
}

export interface WatsonIntentExample {
  text: string;
  mentions?: { entity: string; location: number[] }[];
  description?: string;
}

export interface WatsonIntent {
  intent: string;
  examples: WatsonIntentExample[];
}

export interface WatsonWorkspace {
  name: string;
  language: string;
  description: string;
  intents: WatsonIntent[];
  entities: WatsonEntity[];
  counterexamples: any[];
  metadata: {
    api_version: {
      major_version: 'v2';
      minor_version: '2018-11-08';
    };
  };
  dialog_nodes: unknown[];
  system_settings: {
    disambiguation: {
      prompt: string;
      enabled: boolean;
      randomize: boolean;
      max_suggestions: 5;
      suggestion_text_policy: 'title';
      none_of_the_above_prompt: string;
    };
    human_agent_assist: {
      prompt: string;
    };
    intent_classification: {
      training_backend_version: 'v2';
    };
    spelling_auto_correct: boolean;
  };
  learning_opt_out: boolean;
}
