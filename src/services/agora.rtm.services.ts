import AgoraRTM, { RTMClient } from 'agora-rtm-sdk';

const { RTM } = AgoraRTM;

export interface AgoraRTMServiceCallbacks {
    onMessage?: (message: any) => void;
}

enum AgoraRTMMessageType {
    DATA_POINT = 'data_point',
}

export interface AgoraRTMMessage {
    type: AgoraRTMMessageType;
    data: any;
}

export interface RTMConfig {
    appId: string;
    token: string;
    channel: string;
    uid: string;
}

class AgoraRTMService {
    private client: RTMClient | null = null;
    private callbacks: AgoraRTMServiceCallbacks = {};
    private rtmConfig: RTMConfig = {
        appId: '',
        token: '',
        channel: '',
        uid: ''
    }

    constructor(rtmConfig: RTMConfig) {
        this.rtmConfig = rtmConfig;
        try {
            this.client = new RTM(rtmConfig.appId, rtmConfig.uid);
            this.addEventListeners();
        } catch (error) {
            console.error('[agora.rtm.service]', 'Error initializing RTM client:', error);
        }
    }

    addEventListeners() {
        this.client?.addEventListener('message', (message) => {
            this.callbacks.onMessage?.(message);
            console.log('[agora.rtm.service]', 'RTM client message:', message);
        });
    }

    async login() {
        try {
            await this.client?.login({ token: this.rtmConfig.token });
            console.log('[agora.rtm.service]', 'RTM client logged in');
        } catch (error) {
            console.error('[agora.rtm.service]', 'Error logging in to RTM:', error);
        }
    }

    async logout() {
        try {
            await this.client?.logout();
            console.log('[agora.rtm.service]', 'RTM client logged out');
        } catch (error) {
            console.error('[agora.rtm.service]', 'Error logging out of RTM:', error);
        }
    }

    setCallbacks(callbacks: AgoraRTMServiceCallbacks) {
        this.callbacks = callbacks;
    }


    async leaveChannel(): Promise<void> {

    }
}

export default AgoraRTMService;