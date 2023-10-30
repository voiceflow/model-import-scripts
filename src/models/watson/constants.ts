import { WatsonWorkspace } from './types';

export const getDefaultWatsonWorkspace = (data: Partial<WatsonWorkspace>): WatsonWorkspace => ({
  name: '',
  language: '',
  description: '',
  intents: [],
  entities: [],
  metadata: {
    api_version: {
      major_version: 'v2',
      minor_version: '2018-11-08',
    },
  },
  counterexamples: [],
  dialog_nodes: [],
  system_settings: {
    disambiguation: {
      prompt: 'Did you mean:',
      enabled: true,
      randomize: true,
      max_suggestions: 5,
      suggestion_text_policy: 'title',
      none_of_the_above_prompt: 'None of the above',
    },
    human_agent_assist: {
      prompt: 'Did you mean:',
    },
    intent_classification: {
      training_backend_version: 'v2',
    },
    spelling_auto_correct: true,
  },
  learning_opt_out: false,
  ...data,
});
