import { BaseModels } from '@voiceflow/base-types';
import { VoiceflowConstants, VoiceflowVersion } from '@voiceflow/voiceflow-types';

export type Version = Pick<VoiceflowVersion.Version, 'prototype' | 'projectID' | '_id'>;

export type Prototype = NonNullable<Version['prototype']>;

export interface ExportOptions {
  intents?: string[];
}

export interface ImportResult<I extends BaseModels.Intent, S extends BaseModels.Slot> {
  intents: I[];
  slots: S[];
  metadata: {
    language?: VoiceflowConstants.Language;
  };
}
