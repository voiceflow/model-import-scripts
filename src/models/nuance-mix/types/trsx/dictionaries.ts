interface DictionaryEntry {
  '@literal': string;
  '@value': string;
}

interface Dictionary {
  '@conceptref': string;
  entry?: DictionaryEntry[];
}

export interface Dictionaries {
  dictionary?: Dictionary[];
}
