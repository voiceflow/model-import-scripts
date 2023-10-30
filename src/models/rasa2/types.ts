export interface RasaDataFormat {
  nlu: Array<RasaSynonym | RasaIntent | RasaLookup>;
}

export interface RasaSynonym {
  synonym: string;
  examples: string[];
}

export interface RasaIntent {
  intent: string;
  examples: string[];
}

export interface RasaLookup {
  lookup: string;
  examples: string[];
}

export interface RasaEntity {
  entity: string;
  value?: string;
  role?: string;
  group?: string;
}
