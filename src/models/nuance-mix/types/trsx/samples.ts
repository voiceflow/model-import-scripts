export interface SampleAnnotation {
  '@conceptref': string;
  '#': string;
}

export interface ComplexSample {
  '@': {
    intentref: string;
    count?: string;
  };
  '#': Array<
    // Plaintext
    | {
        '#': string;
      }
    // Annotation
    | {
        // TODO: Once ESLint is upgraded this should be changed from T[] to [T]
        annotation: SampleAnnotation[];
      }
  >;
}

interface SimpleSampleBase {
  '@intentref': string;
  '@count'?: string;
}

interface SimpleSampleWithoutAnnotations extends SimpleSampleBase {
  '#': string;
}

interface SimpleSampleOnlyAnnotation extends SimpleSampleBase {
  // TODO: Once ESLint is upgraded this should be changed from T[] to [T]
  annotation: SampleAnnotation[];
}

interface SimpleSamplePlaintextThenAnnotation extends SimpleSampleBase {
  // Plaintext followed by an annotation
  // The order of keys matters here!!!
  '#': string;
  // TODO: Once ESLint is upgraded this should be changed from T[] to [T]
  annotation: SampleAnnotation[];
}

interface SimpleSampleAnnotationThenPlaintext extends SimpleSampleBase {
  // An annotation followed by plaintext
  // The order of keys matters here!!!
  // TODO: Once ESLint is upgraded this should be changed from T[] to [T]
  annotation: SampleAnnotation[];
  '#': string;
}

export type SimpleSample =
  | SimpleSampleWithoutAnnotations
  | SimpleSampleOnlyAnnotation
  | SimpleSamplePlaintextThenAnnotation
  | SimpleSampleAnnotationThenPlaintext;

export type Sample = SimpleSample | ComplexSample;

export interface Samples {
  sample?: Sample[];
}
