import AgoraRTM, { RTMClient, RTMEvents } from 'agora-rtm';
import { IMessage, IMetricMessage, ITurnMetricBatch } from '../types/agent.types';
import { messageEngine } from './agora.message.service';

export interface AgoraRTMServiceCallbacks {
    onMessage?: (message: IMessage) => void;
    onMetric?: (metric: IMetricMessage) => void;
    onMetricBatch?: (batch: ITurnMetricBatch) => void;
    onEvent?: (eventName: string) => void;
    onRawMessage?: (message: RTMEvents.MessageEvent) => void;
    onLinkState?: (linkState: RTMEvents.LinkStateEvent) => void;
    onTokenWillExpire?: () => Promise<string> | string;
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
    private isLoggedIn = false;
    private isSubscribed = false;

    constructor(private readonly rtmConfig: RTMConfig) { }

    private readonly handleMessage = (event: RTMEvents.MessageEvent) => {
        if (event.channelName !== this.rtmConfig.channel) {
            return;
        }

        this.callbacks.onRawMessage?.(event);

        const { transcript, metric, metricBatch, eventName } = messageEngine.handleRTMMessage(
            event.message,
            event.customType
        );

        if (transcript) {
            this.callbacks.onMessage?.(transcript);
        } else if (metric) {
            this.callbacks.onMetric?.(metric);
        } else if (metricBatch) {
            this.callbacks.onMetricBatch?.(metricBatch);
        } else if (eventName) {
            this.callbacks.onEvent?.(eventName);
        }
    };

    private readonly handleLinkState = (linkState: RTMEvents.LinkStateEvent) => {
        this.callbacks.onLinkState?.(linkState);
    };

    private readonly handleTokenEvent = async (event: RTMEvents.TokenEvent) => {
        if (event.eventType !== 'WILL_EXPIRE') {
            return;
        }

        try {
            const token = await this.callbacks.onTokenWillExpire?.();
            if (token) {
                await this.renewToken(token);
            }
        } catch (error) {
            console.error('[agora.rtm.service] Failed to renew the RTM token:', error);
        }
    };

    private createClient(): RTMClient {
        const client = new AgoraRTM.RTM(this.rtmConfig.appId, this.rtmConfig.uid);
        client.addEventListener('message', this.handleMessage);
        client.addEventListener('linkState', this.handleLinkState);
        client.addEventListener('token', this.handleTokenEvent);
        return client;
    }

    private removeEventListeners(client: RTMClient): void {
        client.removeEventListener('message', this.handleMessage);
        client.removeEventListener('linkState', this.handleLinkState);
        client.removeEventListener('token', this.handleTokenEvent);
    }

    async login(): Promise<void> {
        if (this.isLoggedIn && this.isSubscribed) {
            return;
        }

        const client = this.client ?? this.createClient();
        this.client = client;

        try {
            await client.login({ token: this.rtmConfig.token });
            this.isLoggedIn = true;

            await client.subscribe(this.rtmConfig.channel, {
                withMessage: true,
                withPresence: true,
            });
            this.isSubscribed = true;
        } catch (error) {
            await this.resetClient();
            console.error('[agora.rtm.service] Failed to log in and subscribe:', error);
            throw error;
        }
    }

    async leaveChannel(): Promise<void> {
        if (!this.client || !this.isSubscribed) {
            return;
        }

        await this.client.unsubscribe(this.rtmConfig.channel);
        this.isSubscribed = false;
    }

    async logout(): Promise<void> {
        await this.resetClient();
    }

    async renewToken(token: string): Promise<void> {
        if (!this.client || !this.isLoggedIn) {
            throw new Error('Cannot renew an RTM token before login');
        }

        await this.client.renewToken(token);
        this.rtmConfig.token = token;
    }

    setCallbacks(callbacks: AgoraRTMServiceCallbacks): void {
        this.callbacks = callbacks;
    }

    private async resetClient(): Promise<void> {
        const client = this.client;
        if (!client) {
            this.isLoggedIn = false;
            this.isSubscribed = false;
            return;
        }

        let cleanupError: unknown;

        if (this.isSubscribed) {
            try {
                await client.unsubscribe(this.rtmConfig.channel);
            } catch (error) {
                cleanupError = error;
            }
        }

        if (this.isLoggedIn) {
            try {
                await client.logout();
            } catch (error) {
                cleanupError ??= error;
            }
        }

        this.removeEventListeners(client);
        this.client = null;
        this.isLoggedIn = false;
        this.isSubscribed = false;

        if (cleanupError) {
            throw cleanupError;
        }
    }
}

export default AgoraRTMService;
