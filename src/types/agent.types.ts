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
