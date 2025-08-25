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
import { IMessage } from '../types/agent.types';

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
}

class AgoraRTCService {
  private client: IAgoraRTCClient;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private remoteUsers: Map<UID, RemoteUser> = new Map();
  private callbacks: AgoraServiceCallbacks = {};

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
      const messages = messageEngine.handleStreamMessage(payload)
      if (messages) {
        this.callbacks.onMessage?.(messages)
      }
    })

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

  async joinChannel(channelInfo: AgoraChannelResponse): Promise<void> {
    await this.client.join(
      channelInfo.appId,
      channelInfo.channelName,
      channelInfo.token,
      channelInfo.uid
    );

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
    }
  }
}

export const agoraRTCService = new AgoraRTCService();