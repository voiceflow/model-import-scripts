import { BaseModels } from '@voiceflow/base-types';
import { VoiceflowConstants } from '@voiceflow/voiceflow-types';

export type SlotsByKey = Record<string, BaseModels.Slot>;
export type IntentsByName = Record<string, BaseModels.Intent>;
export type IntentsByKey = Record<string, BaseModels.Intent>;

export enum RASA_SLOT_TYPES {
  TEXT = 'text',
  BOOL = 'bool',
  CATEGORICAL = 'categorical',
  FLOAT = 'float',
  LIST = 'list',
  ANY = 'any',
}

export const GENERAL_TO_RASA_SLOT_TYPE_MAP: Readonly<Record<VoiceflowConstants.SlotType, RASA_SLOT_TYPES>> = {
  [VoiceflowConstants.SlotType.CUSTOM]: RASA_SLOT_TYPES.TEXT,

  [VoiceflowConstants.SlotType.AGE]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.CURRENCY]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.DATETIME]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.DIMENSION]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.EMAIL]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.GEOGRAPHY]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.KEY_PHRASE]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.NAME]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.NATOAPCO]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.NUMBER]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.ORDINAL]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.PERCENTAGE]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.PHONENUMBER]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.TEMPERATURE]: RASA_SLOT_TYPES.TEXT,
  [VoiceflowConstants.SlotType.URL]: RASA_SLOT_TYPES.TEXT,
};

export const BUILTIN_SLOT_TYPE_VALUES: Readonly<Record<VoiceflowConstants.SlotType, string[]>> = {
  [VoiceflowConstants.SlotType.CUSTOM]: [],

  [VoiceflowConstants.SlotType.AGE]: ['34 years old'],
  [VoiceflowConstants.SlotType.CURRENCY]: ['5 dollars'],
  [VoiceflowConstants.SlotType.DATETIME]: ['May 25th, 2025'],
  [VoiceflowConstants.SlotType.DIMENSION]: ['10 1/2 miles'],
  [VoiceflowConstants.SlotType.EMAIL]: ['test@test.com'],
  [VoiceflowConstants.SlotType.GEOGRAPHY]: ['texas'],
  [VoiceflowConstants.SlotType.KEY_PHRASE]: ['educational requirements'],
  [VoiceflowConstants.SlotType.NAME]: ['John'],
  [VoiceflowConstants.SlotType.NATOAPCO]: [],
  [VoiceflowConstants.SlotType.NUMBER]: ['1'],
  [VoiceflowConstants.SlotType.ORDINAL]: ['first'],
  [VoiceflowConstants.SlotType.PERCENTAGE]: ['23%'],
  [VoiceflowConstants.SlotType.PHONENUMBER]: ['(123) 456-7890'],
  [VoiceflowConstants.SlotType.TEMPERATURE]: ['100 degrees'],
  [VoiceflowConstants.SlotType.URL]: ['https://voiceflow.com'],
};

export const yamlConfig = {
  lineWidth: -1,
};

export const vfCustomAction = (versionID: string) => `
# This file contains the Voiceflow custom action
# which is used to connect a rasa project to the VF Dialog Manager
# using VF's stateless API (https://www.voiceflow.com/api/dialog-manager#tag/Stateless-API)
#
# Docs on Rasa's custom actions:
# https://rasa.com/docs/rasa/custom-actions
#
# Steps to test:
# 1. Generate a VF API Key and assign it to the "token" variable in this file
# 2. Start the custom actions server: "rasa run actions"
# 3. Remove the comment on the "action_endpoint" field in "endpoints.yml". The url must match with where the rasa custom actions server is running
# 4. Train the rasa project: "rasa train"
# 5. Open the rasa shell: "rasa shell"
# 6. Interact with the rasa project. The returned responses will correspond with speak steps in the Voiceflow project

import json
import requests

from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher


endpoint = "https://general-runtime.voiceflow.com/interact/${versionID}"

# https://www.voiceflow.com/api/dialog-manager#section/Authentication
token = "your-vf-api-key-here"

class StateManager:
    state = None

    def get(self):
        if (self.state == None):
            r = requests.get(endpoint + "/state", headers = {"authorization": token})
            self.state = r.json()

        return self.state

    def set(self, s):
        self.state = s

state_manager = StateManager()

def generate_entities(slots):
    entities = []

    for key, value in slots.items():
        if (value is None):
            continue
        slot = {"name": key, "value": value}
        entities.append(slot)

    return entities

def build_request(intent_name, entities):
    return {
            "type": "intent",
            "payload": {
                "query": "",
                "intent": {
                    "name": intent_name
                },
                "entities": entities
            }
        }

def parse_slate_content(slate_content):
  ret = ""
  for index, slate_content_item in enumerate(slate_content):
    if "children" in slate_content_item:
      cur_str = ""
      for child in slate_content_item["children"]:
        if "text" in child:
          cur_str += child["text"]
        elif "url" in child:
          cur_str += child["url"]

      # if empty string, it represents a new line
      if cur_str == "":
        ret += "\\n"
      else:
        ret += cur_str

      # Add new line for all lines except for last message
      if index != len(slate_content) - 1:
        ret += "\\n"

  return ret

class ActionVoiceflowDM(Action):

    def name(self) -> Text:
        return "action_voiceflow_dm"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        curr_state = tracker.current_state()

        intent_name = curr_state["latest_message"]["intent"]["name"]
        entities = generate_entities(curr_state["slots"])

        request = build_request(intent_name, entities)

        data = { "request": request, "state": state_manager.get() }

        r = requests.post(endpoint, json = data, headers = { "authorization": token })
        response = r.json()

        state_manager.set(response["state"])

        for trace in response["trace"]:
            if (trace["type"] == "speak"):
                dispatcher.utter_message(text=trace["payload"]["message"])
            elif (trace["type"] == "text"):
                dispatcher.utter_message(text=parse_slate_content(trace["payload"]["slate"]["content"]))
        return []
`;
