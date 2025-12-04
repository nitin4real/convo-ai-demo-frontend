import axios from '../config/axios.config';
import { API_CONFIG } from '../config/api.config';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  UID
} from 'agora-rtc-sdk-ng';
import { messageEngine } from './agora.message.service';
import { IMessage, IMetricMessage } from '../types/agent.types';

export interface AgoraChannelResponse {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  rtmToken: string;
}

export interface RemoteUser {
  uid: UID;
  audioTrack?: IRemoteAudioTrack;
  videoTrack?: IRemoteVideoTrack;
}

export interface AgoraServiceCallbacks {
  onUserJoined?: (user: RemoteUser) => void;
  onUserLeft?: (uid: UID) => void;
  onUserPublished?: (user: RemoteUser, mediaType: 'audio' | 'video') => void;
  onUserUnpublished?: (user: RemoteUser) => void;
  onMessage?: (message: IMessage) => void;
  onMetric?: (metric: IMetricMessage) => void;
}

class AgoraRTCService {
  private client: IAgoraRTCClient;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private remoteUsers: Map<UID, RemoteUser> = new Map();
  private callbacks: AgoraServiceCallbacks = {};
  private isSIPAgent: boolean = false;

  constructor() {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on('user-joined', async (user) => {
      this.remoteUsers.set(user.uid, { uid: user.uid });
      this.callbacks.onUserJoined?.(this.remoteUsers.get(user.uid)!);
    });

    this.client.on('user-left', (user) => {
      this.remoteUsers.delete(user.uid);
      this.callbacks.onUserLeft?.(user.uid);
    });

    this.client.on('user-published', async (user, mediaType) => {
      if (mediaType === 'audio') {
        await this.client.subscribe(user, mediaType);
        const remoteUser = this.remoteUsers.get(user.uid);
        if (remoteUser) {
          remoteUser.audioTrack = user.audioTrack;
          if (this.isSIPAgent) {
            // skip
            return;
          }
          remoteUser.audioTrack?.play();
        }
      } else if (mediaType === 'video') {
        await this.client.subscribe(user, mediaType);
        const remoteUser = this.remoteUsers.get(user.uid);
        if (remoteUser) {
          remoteUser.videoTrack = user.videoTrack;
          this.callbacks.onUserPublished?.(remoteUser, mediaType);
        }
      }
    });

    this.client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'audio') {
        const remoteUser = this.remoteUsers.get(user.uid);
        if (remoteUser) {
          remoteUser.audioTrack = undefined;
          this.callbacks.onUserUnpublished?.(remoteUser);
        }
      }
    });

    this.client.on('stream-message', (_: UID, payload: Uint8Array) => {
      const { transcript, metric } = messageEngine.handleStreamMessage(payload)
      if (transcript) {
        this.callbacks.onMessage?.(transcript)
      } else if (metric){
        this.callbacks.onMetric?.(metric)
      }
    })

  }

  muteRemoteUsers(): void {
    this.remoteUsers.forEach(user => {
      if (user.audioTrack) {
        user.audioTrack?.stop();
      }
    });
  }

  unmuteRemoteUsers(): void {
    this.remoteUsers.forEach(user => {
      if (user.audioTrack) {
        user.audioTrack?.play();
      }
    });
  }

  setAsSIPAgent(isSIPAgent: boolean): void {
    this.isSIPAgent = isSIPAgent;
  }

  setCallbacks(callbacks: AgoraServiceCallbacks) {
    this.callbacks = callbacks;
  }

  async getChannelInfo(agentId: string): Promise<AgoraChannelResponse> {
    const response = await axios.get<AgoraChannelResponse>(
      `${API_CONFIG.ENDPOINTS.AGORA.CHANNEL}/${agentId}`
    );
    return response.data;
  }

  async getChannelInfoForSip(channelName: string): Promise<AgoraChannelResponse> {
    const response = await axios.get<any>(
      `${API_CONFIG.ENDPOINTS.AGENT.CHANNEL_FOR_SIP}?channelName=${channelName}`
    );
    if (response.data.tokenData) {
      return response.data.tokenData;
    }
    throw new Error('Failed to get channel info for SIP');
  }

  async joinChannel(channelInfo: AgoraChannelResponse): Promise<void> {
    await this.client.join(
      channelInfo.appId,
      channelInfo.channelName,
      channelInfo.token,
      channelInfo.uid
    );

    if (this.isSIPAgent) {
      return
    }

    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await this.client.publish([this.localAudioTrack]);

    // only for avatar landscape transcript

    // this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    // await this.client.publish([this.localVideoTrack]);
  }

  async leaveChannel(): Promise<void> {
    if (this.localAudioTrack) {
      this.localAudioTrack.close();
    }
    await this.client.leave();
    this.localAudioTrack = null;
    this.remoteUsers.clear();
  }

  getLocalAudioTrack(): IMicrophoneAudioTrack | null {
    return this.localAudioTrack;
  }

  getLocalVideoTrack(): ICameraVideoTrack | null {
    return this.localVideoTrack;
  }

  getRemoteUsers(): RemoteUser[] {
    return Array.from(this.remoteUsers.values());
  }

  toggleAudio(enabled: boolean): void {
    if (this.localAudioTrack) {
      this.localAudioTrack.setEnabled(enabled);
    } else {
      (async () => {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await this.client.publish([this.localAudioTrack]);
      })();
    }
  }
}

export const agoraRTCService = new AgoraRTCService();