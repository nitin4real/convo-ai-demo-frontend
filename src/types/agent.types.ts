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
}

export interface StopAgentRequest {}

export interface AgentType {
  id: string;
  title: string;
  description: string;
}

export interface AgentTile {
  id: string;
  name: string;
  title: string;
  description: string;
  features: string[];
}
