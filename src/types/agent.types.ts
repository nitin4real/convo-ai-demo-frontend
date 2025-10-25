export interface StartAgentResponse {
  agent_id: string;
  create_ts: number;
  status: string;
  token: string;
  channelName: string;
  uid: number;
  appId: string;
}

export type AgentStatus = 'active' | 'inactive' | 'error';

export interface StartAgentRequest {
  channelName: string;
  languageCode: string;
}

export interface StopAgentRequest {}

export interface AgentType {
  id: string;
  title: string;
  description: string;
}

export interface AgentLanguage {
  name: string;
  isoCode: string;
}

export interface AgentTile {
  id: string;
  name: string;
  title: string;
  description: string;
  features: string[];
  languages: AgentLanguage[];
  layout: Layout;
}

export interface IMessage {
  speaker: string;
  transcription: string;
  turn_id: number;
}


export const enum Layout {
  DEFAULT = 'DEFAULT',
  METADATA_TRANSCRIPT = 'METADATA_TRANSCRIPT',
  AVATAR_TRANSCRIPT = 'AVATAR_TRANSCRIPT',
  AVATAR_LANDSCAPE_TRANSCRIPT = 'AVATAR_LANDSCAPE_TRANSCRIPT',
  SIP_CALL_INBOUND = 'SIP_CALL_INBOUND',
  SIP_CALL_OUTBOUND = 'SIP_CALL_OUTBOUND',
}