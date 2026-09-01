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
import { RTMEvents } from 'agora-rtm';
import { IMessage, IMetricMessage, ITurnMetricBatch } from '../types/agent.types';
import { AIDenoiserExtension } from 'agora-extension-ai-denoiser';
import AgoraRTMService from './agora.rtm.services';
export interface AgoraChannelResponse {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  rtmToken: string;
}

interface AgoraRTMTokenResponse {
  uid: number;
  rtmToken: string;
}

interface AgoraSipChannelResponse {
  tokenData?: AgoraChannelResponse;
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
  onMetricBatch?: (batch: ITurnMetricBatch) => void;
  onEvent?: (eventName: string) => void;
  onRawRTMMessage?: (message: RTMEvents.MessageEvent) => void;
}

class AgoraRTCService {
  private client: IAgoraRTCClient;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private remoteUsers: Map<UID, RemoteUser> = new Map();
  private callbacks: AgoraServiceCallbacks = {};
  private isSIPAgent: boolean = false;
  private denoiser: AIDenoiserExtension | null = null;
  private rtmService: AgoraRTMService | null = null;
  private isJoined = false;

  constructor() {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    this.denoiser = new AIDenoiserExtension({ assetsPath: '/external' });
    this.setupDenoiser()
    this.setupEventListeners();
  }

  private setupDenoiser() {
    console.log("denoiser", this.denoiser)
    if (this.denoiser && !this.denoiser.checkCompatibility()) {
      console.error("Does not support AI Denoiser!");
      this.denoiser = null
    } else if (this.denoiser) {
      AgoraRTC.registerExtensions([this.denoiser]);
    }

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
    const response = await axios.get<AgoraSipChannelResponse>(
      `${API_CONFIG.ENDPOINTS.AGENT.CHANNEL_FOR_SIP}?channelName=${channelName}`
    );
    if (response.data.tokenData) {
      return response.data.tokenData;
    }
    throw new Error('Failed to get channel info for SIP');
  }

  async getMicrophones(skipPermissionCheck: boolean = true): Promise<MediaDeviceInfo[]> {
    return AgoraRTC.getMicrophones(skipPermissionCheck);
  }

  private async createLocalAudioTrack(microphoneId?: string): Promise<IMicrophoneAudioTrack> {
    const track = await AgoraRTC.createMicrophoneAudioTrack(
      microphoneId ? { microphoneId } : undefined
    );

    try {
      if (this.denoiser) {
        const processor = this.denoiser.createProcessor();
        processor.enable();
        track.pipe(processor).pipe(track.processorDestination);
        await processor.enable();
        console.log("AINS enabled success")
      }
    } catch (error) {
      console.log("AINS enabled failed", error)
    }

    return track;
  }

  async joinChannel(channelInfo: AgoraChannelResponse, microphoneId?: string): Promise<void> {
    try {
      await this.client.join(
        channelInfo.appId,
        channelInfo.channelName,
        channelInfo.token,
        channelInfo.uid
      );
      this.isJoined = true;

      this.rtmService = new AgoraRTMService({
        appId: channelInfo.appId,
        token: channelInfo.rtmToken,
        channel: channelInfo.channelName,
        uid: channelInfo.uid.toString(),
      });
      this.rtmService.setCallbacks({
        onMessage: message => this.callbacks.onMessage?.(message),
        onMetric: metric => this.callbacks.onMetric?.(metric),
        onMetricBatch: batch => this.callbacks.onMetricBatch?.(batch),
        onEvent: eventName => this.callbacks.onEvent?.(eventName),
        onRawMessage: message => this.callbacks.onRawRTMMessage?.(message),
        onTokenWillExpire: async () => {
          const response = await axios.get<AgoraRTMTokenResponse>(
            API_CONFIG.ENDPOINTS.AGORA.RTM_TOKEN
          );
          if (response.data.uid !== channelInfo.uid) {
            throw new Error('The renewed RTM token identity does not match the joined user');
          }
          return response.data.rtmToken;
        },
      });
      await this.rtmService.login();

      if (this.isSIPAgent) {
        return
      }

      this.localAudioTrack = await this.createLocalAudioTrack(microphoneId);
      await this.client.publish([this.localAudioTrack]);
    } catch (error) {
      try {
        await this.leaveChannel();
      } catch (cleanupError) {
        console.error('Failed to clean up after joining the Agora channel:', cleanupError);
      }
      throw error;
    }

    // only for avatar landscape transcript

    // this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    // await this.client.publish([this.localVideoTrack]);
  }

  async leaveChannel(): Promise<void> {
    if (this.localAudioTrack) {
      this.localAudioTrack.close();
    }
    if (this.localVideoTrack) {
      this.localVideoTrack.close();
    }

    let cleanupError: unknown;
    if (this.isJoined) {
      try {
        await this.client.leave();
      } catch (error) {
        cleanupError = error;
      }
    }

    try {
      await this.rtmService?.logout();
    } catch (error) {
      cleanupError ??= error;
    }

    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.rtmService = null;
    this.isJoined = false;
    this.remoteUsers.clear();

    if (cleanupError) {
      throw cleanupError;
    }
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

  async setMicrophoneDevice(deviceId: string): Promise<void> {
    if (!this.localAudioTrack) {
      return;
    }

    await this.localAudioTrack.setDevice(deviceId);
  }

  async toggleAudio(enabled: boolean, microphoneId?: string): Promise<void> {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setEnabled(enabled);
    } else {
      this.localAudioTrack = await this.createLocalAudioTrack(microphoneId);
      await this.client.publish([this.localAudioTrack]);
    }
  }
}

export const agoraRTCService = new AgoraRTCService();
