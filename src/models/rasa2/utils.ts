import yaml from 'js-yaml';

import { isRasaDataFormat } from './guards';
import { RasaDataFormat } from './types';

export function formatRasaDataExample(examples: unknown) {
  // https://rasa.com/docs/rasa/training-data-format#training-examples
  if (typeof examples === 'string') {
    return examples
      .split('- ')
      .map((example: string) => example.trim())
      .filter(Boolean);
  }
  if (Array.isArray(examples)) {
    return examples.map((example: any) => {
      if (typeof example === 'object' && 'text' in example) return example.text.trim();
      return example.toString();
    });
  }
  return [];
}

export function parseRasaYaml(contents: string): RasaDataFormat {
  const data = yaml.load(contents, { json: true });

  if (!isRasaDataFormat(data)) throw new Error('Unrecognized yaml file');

  if (Array.isArray(data.nlu)) {
    data.nlu = data.nlu.map((nlu: any) => {
      // eslint-disable-next-line no-param-reassign
      nlu.examples = formatRasaDataExample(nlu.examples);
      return nlu;
    });
  }

  return data;
}
