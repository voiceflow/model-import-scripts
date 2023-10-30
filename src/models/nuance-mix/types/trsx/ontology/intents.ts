interface IntentLink {
  '@conceptref': string;
}

interface Intent {
  '@name': string;
  links?: {
    link?: IntentLink[];
  };
}

export interface Intents {
  intent: Intent[];
}
