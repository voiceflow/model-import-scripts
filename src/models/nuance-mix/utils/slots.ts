import { Utils } from '@voiceflow/common/build/cjs';
import { VoiceflowConstants } from '@voiceflow/voiceflow-types';

import { isPredefinedNuanceEntity, NUANCE_MIX_TO_VF_SLOT } from '../utils';
import { ConceptName, TRSX } from '../types/trsx';
import { Sample, SampleAnnotation } from '../types/trsx/samples';

type Inputs = ReadonlyMap<ConceptName, string[]>;

export const extractAnnotationsFromSample = (sample: Sample): SampleAnnotation[] => {
  if ('@' in sample) {
    return sample['#']
      .map((sampleChild) => ('annotation' in sampleChild ? sampleChild.annotation[0] : undefined))
      .filter(Utils.array.isNotNullish);
  }

  if ('annotation' in sample) {
    return sample.annotation;
  }

  return [];
};

export const extractInputsForSlots = (
  trsx: TRSX,
  allConceptNames: readonly ConceptName[],
  language: VoiceflowConstants.Language
): Map<ConceptName, string[]> => {
  const dictionaries = trsx.project[0].dictionaries?.[0].dictionary ?? [];

  // Start off the slot inputs Map with the inputs explicitly defined in <dictionaries>
  const allSlotInputs = new Map(
    dictionaries.map((dictionary) => {
      const dictionaryEntries = dictionary.entry?.filter(Utils.array.isNotNullish) ?? [];
      const aliasesByCanonical: Map<string, Set<string>> = new Map(
        dictionaryEntries.map((entry) => [entry['@value'], new Set()])
      );

      dictionaryEntries.forEach((dictionaryEntry) => {
        const canonical = dictionaryEntry['@value'];
        const alias = dictionaryEntry['@literal'];

        const aliases = aliasesByCanonical.get(canonical)!;

        aliases.add(alias);
      });

      return [dictionary['@conceptref'], aliasesByCanonical];
    })
  );

  const slotTypeValuesBySlotType = new Map(
    VoiceflowConstants.SlotTypes[language].map((slotTypeValue) => [slotTypeValue.name, slotTypeValue])
  );

  // Add additional inputs from builtin slots
  allConceptNames.filter(isPredefinedNuanceEntity).forEach((conceptName) => {
    if (conceptName in NUANCE_MIX_TO_VF_SLOT) {
      const voiceflowSlotEquivalent = NUANCE_MIX_TO_VF_SLOT[conceptName as keyof typeof NUANCE_MIX_TO_VF_SLOT];

      const slotTypeValue = slotTypeValuesBySlotType.get(voiceflowSlotEquivalent);

      if (slotTypeValue) {
        const aliasesByCanonical = Utils.map.getOrDefault(
          allSlotInputs,
          conceptName,
          (): Map<string, Set<string>> => new Map()
        );
        slotTypeValue.values.forEach((value) =>
          aliasesByCanonical.set(value, aliasesByCanonical.get(value) ?? new Set())
        );
      }
    }
  });

  // Use <samples> for actual human-approved values
  trsx.project[0].samples?.[0].sample?.forEach((sample) =>
    extractAnnotationsFromSample(sample).forEach((annotation) => {
      const aliasesByCanonical = Utils.map.getOrDefault(
        allSlotInputs,
        annotation['@conceptref'],
        (): Map<string, Set<string>> => new Map()
      );
      const canonical = annotation['#'];
      aliasesByCanonical.set(canonical, aliasesByCanonical.get(canonical) ?? new Set());
    })
  );

  // Deduplicate
  return new Map(
    Array.from(allSlotInputs.entries()).map(([conceptName, aliasesByCanonical]) => [
      conceptName,
      Array.from(aliasesByCanonical).map(([canonical, aliases]) => {
        aliases.delete(canonical);

        return [canonical, ...aliases].join(',');
      }),
    ])
  );
};

export const getInputsForSlot = (conceptName: ConceptName, inputs: Inputs): string[] => inputs.get(conceptName) ?? [];

/** Extracts all the concept names referenced in an entire TRSX file. */
export const extractAllConceptNames = (trsx: TRSX): ConceptName[] => {
  /** Explicitly defined concepts */
  const explicitConcepts = (trsx.project[0].ontology?.[0].concepts?.[0].concept ?? []).map(
    (concept) => concept['@name']
  );

  /** Concepts referenced in intents. */
  const linkedConcepts =
    trsx.project[0].ontology?.[0].intents?.[0].intent
      .flatMap((intent) => intent.links?.link?.map((link) => link['@conceptref']))
      .filter(Utils.array.isNotNullish) ?? [];

  // Here is where I would extract the concepts from the <dictionaries>
  // section but that should be totally unnecessary since those will all be
  // referencing <concepts> anyway

  /** Concepts referenced in intent samples (utterances). */
  const sampleConcepts =
    trsx.project[0].samples?.[0].sample
      ?.flatMap((sample) => {
        const annotations = extractAnnotationsFromSample(sample);

        return annotations.map((annotation) => annotation['@conceptref']);
      })
      .filter(Utils.array.isNotNullish) ?? [];

  const allConcepts = [...explicitConcepts, ...linkedConcepts, ...sampleConcepts];

  return Array.from(new Set(allConcepts));
};
