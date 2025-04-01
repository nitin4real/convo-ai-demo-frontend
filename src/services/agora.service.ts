import axios from '../config/axios.config';
import { API_CONFIG } from '../config/api.config';

export interface AgoraChannelResponse {
  channelName: string;
  token: string;
  uid: number;
  appId: string;
}

export const agoraService = {
  async getChannelInfo(agentId: string): Promise<AgoraChannelResponse> {
    const response = await axios.get<AgoraChannelResponse>(`${API_CONFIG.ENDPOINTS.AGORA.CHANNEL}/${agentId}`);
    return response.data;
  }
};