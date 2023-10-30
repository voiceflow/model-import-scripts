import { parseArgs } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";
import JSZip from 'jszip';
import Papa from 'papaparse';

import {DialogflowCXImport} from './models/dialogflow-cx';
import {EinsteinImport} from './models/einstein';
import {LexImport} from './models/lex-v1';
import {NuanceMixImport} from './models/nuance-mix';
import {RasaImport} from './models/rasa2';
import {WatsonImport} from './models/watson';

const {
  values: { model, input, output },
} = parseArgs({
  options: {
    model: {
      type: "string",
      short: "m",
    },
    input: {
      type: "string",
      short: "i",
    },
    output: {
      type: "string",
      short: "o",
    },
  },
});

if (!model || !input) throw new Error('Missing required arguments');

const buffer = readFileSync(input);

(async () => {
  switch (model) {
    case 'dialogflow-cx': {
      const importer = new DialogflowCXImport();
      const zip = await JSZip.loadAsync(buffer);
      return importer.importZip(zip);
    }
    case 'einstein': {
      const importer = new EinsteinImport();
      return importer.importCSV(buffer.toString('utf-8'));
    }
    case 'lex':
    case 'lex-v1': {
      const importer = new LexImport();
      const zip = await JSZip.loadAsync(buffer);
      return importer.importZip(zip);
    }
    case 'nuance':
    case 'nuance-mix': {
      const importer = new NuanceMixImport();
      let xml = NuanceMixImport.xmlParse(buffer.toString('utf-8'));
      return importer.importTrsx(xml);
    }
    case 'rasa':
    case 'rasa2': {
      const importer = new RasaImport();
      const zip = await JSZip.loadAsync(buffer);
      return importer.importZip(zip);
    }
    case 'watson': {
      const importer = new WatsonImport();
      return importer.importJSON(JSON.parse(buffer.toString('utf-8')));
    }
    default: {
      throw new Error(`Unknown model: ${model}`);
    }
  }
})().then((result) => {
  const intents = result.intents.flatMap((intent) => intent.inputs.map((input) => [intent.name, input.text]));

  const csv = Papa.unparse(intents, {});

  if (output) {
    writeFileSync(output, csv, {encoding: 'utf-8'});
  } else {
    console.log(csv);
  }
});
