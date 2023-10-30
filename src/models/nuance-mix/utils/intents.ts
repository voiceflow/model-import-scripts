import { BaseModels } from '@voiceflow/base-types';
import { Utils } from '@voiceflow/common/build/cjs';
import assert from 'assert/strict';

import { ConceptName, TRSX } from '../types/trsx';
import { ComplexSample, Sample, SampleAnnotation, SimpleSample } from '../types/trsx/samples';

type Slots = ReadonlyMap<ConceptName, BaseModels.Slot>;

export const extractSamplesForIntents = (trsx: TRSX): Map<string, Sample[]> => {
  const samples: Sample[] = trsx.project[0].samples?.[0].sample ?? [];

  const result: Map<string, Sample[]> = new Map();

  samples.forEach((sample) => {
    const intentName = '@intentref' in sample ? sample['@intentref'] : sample['@'].intentref;

    const samplesForIntent = Utils.map.getOrDefault(result, intentName, () => []);

    samplesForIntent.push(sample);
  });

  return result;
};

export const annotationToVoiceflowSlotString = (annotation: SampleAnnotation, slots: Slots): string => {
  const conceptName = annotation['@conceptref'];

  const slot = slots.get(conceptName);
  assert(slot, new TypeError(`Slot for ${conceptName} not found in the provided slot map`));

  return `{{[${slot.name}].${slot.key}}}`;
};

const simpleSampleToIntentInput = (slots: ReadonlyMap<string, BaseModels.Slot>, sample: SimpleSample): string[] => {
  return Object.keys(sample)
    .filter((key): key is '#' | 'annotation' => key === '#' || key === 'annotation')
    .map((key) => {
      if (key === '#') {
        assert('#' in sample);
        return sample['#'].trim();
      }

      assert('annotation' in sample);
      return annotationToVoiceflowSlotString(sample.annotation[0], slots);
    });
};

const complexSampleToIntentInput = (slots: ReadonlyMap<string, BaseModels.Slot>, sample: ComplexSample): string[] => {
  return sample['#'].map((child) => {
    if ('#' in child) {
      return child['#'].trim();
    }

    return annotationToVoiceflowSlotString(child.annotation[0], slots);
  });
};

const sampleToIntentInput = (slots: ReadonlyMap<string, BaseModels.Slot>, sample: Sample): string => {
  const textComponents: string[] =
    '@' in sample ? complexSampleToIntentInput(slots, sample) : simpleSampleToIntentInput(slots, sample);

  return textComponents.join(' ');
};

export const nuanceIntentSamplesToIntentInputs = (
  samples: readonly Sample[],
  slots: ReadonlyMap<ConceptName, BaseModels.Slot>
): BaseModels.IntentInput[] => {
  const allIntentInputsText: string[] = samples.map((sample) => sampleToIntentInput(slots, sample));

  const uniqueIntentInputsText = Array.from(new Set(allIntentInputsText));

  return uniqueIntentInputsText.map((text): BaseModels.IntentInput => ({ text }));
};

export const nuanceIntentSamplesToIntentSlots = (
  samples: readonly Sample[],
  slots: ReadonlyMap<ConceptName, BaseModels.Slot>
): BaseModels.IntentSlot[] => {
  const annotations: SampleAnnotation[] = [];
  samples.forEach((sample) => {
    if ('@' in sample) {
      sample['#'].forEach((child) => {
        if ('annotation' in child) {
          annotations.push(child.annotation[0]);
        }
      });
    } else if ('annotation' in sample) {
      annotations.push(...sample.annotation);
    }
  });
  const allUsedConcepts = annotations.map((annotation) => annotation['@conceptref']);
  const uniqueUsedConcepts = Array.from(new Set(allUsedConcepts));

  return uniqueUsedConcepts.map((conceptName) => ({
    id: slots.get(conceptName)!.key,
    dialog: {
      confirm: [],
      confirmEnabled: false,
      prompt: [],
      utterances: [],
    },
    required: false,
  }));
};
