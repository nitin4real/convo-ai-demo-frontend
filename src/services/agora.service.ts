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

export interface AgoraChannelResponse {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
}

export interface RemoteUser {
  uid: UID;
  audioTrack?: IRemoteAudioTrack;
  videoTrack?: IRemoteVideoTrack;
}

export interface AgoraServiceCallbacks {
  onUserJoined?: (user: RemoteUser) => void;
  onUserLeft?: (uid: UID) => void;
  onUserPublished?: (user: RemoteUser) => void;
  onUserUnpublished?: (user: RemoteUser) => void;
}

class AgoraService {
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
      console.log('User joined:', user.uid);
      this.remoteUsers.set(user.uid, { uid: user.uid });
      this.callbacks.onUserJoined?.(this.remoteUsers.get(user.uid)!);
    });

    this.client.on('user-left', (user) => {
      console.log('User left:', user.uid);
      this.remoteUsers.delete(user.uid);
      this.callbacks.onUserLeft?.(user.uid);
    });

    this.client.on('user-published', async (user, mediaType) => {
      console.log('User published:', user.uid, mediaType);
      await this.client.subscribe(user, mediaType);
      const remoteUser = this.remoteUsers.get(user.uid);
      if (remoteUser) {
        if (mediaType === 'audio') {
          remoteUser.audioTrack = user.audioTrack;
        } else if (mediaType === 'video') {
          remoteUser.videoTrack = user.videoTrack;
        }
        this.callbacks.onUserPublished?.(remoteUser);
      }
    });

    this.client.on('user-unpublished', (user, mediaType) => {
      console.log('User unpublished:', user.uid, mediaType);
      const remoteUser = this.remoteUsers.get(user.uid);
      if (remoteUser) {
        if (mediaType === 'audio') {
          remoteUser.audioTrack = undefined;
        } else if (mediaType === 'video') {
          remoteUser.videoTrack = undefined;
        }
        this.callbacks.onUserUnpublished?.(remoteUser);
      }
    });
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
      channelInfo.uid.toString()
    );

    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
  }

  async leaveChannel(): Promise<void> {
    if (this.localAudioTrack) {
      this.localAudioTrack.close();
    }
    if (this.localVideoTrack) {
      this.localVideoTrack.close();
    }
    await this.client.leave();
    this.localAudioTrack = null;
    this.localVideoTrack = null;
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

  toggleVideo(enabled: boolean): void {
    if (this.localVideoTrack) {
      this.localVideoTrack.setEnabled(enabled);
    }
  }
}

export const agoraService = new AgoraService();