import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
    const listeners = new Map<string, (event: unknown) => void | Promise<void>>()
    const client = {
        login: vi.fn(),
        logout: vi.fn(),
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
        renewToken: vi.fn(),
        addEventListener: vi.fn((
            event: string,
            listener: (payload: unknown) => void | Promise<void>
        ) => {
            listeners.set(event, listener)
        }),
        removeEventListener: vi.fn((event: string) => {
            listeners.delete(event)
        }),
    }
    const RTM = vi.fn(function () {
        return client
    })

    return { client, listeners, RTM }
})

vi.mock('agora-rtm', () => ({
    default: { RTM: mocks.RTM },
}))

import AgoraRTMService from './agora.rtm.services'

describe('AgoraRTMService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.listeners.clear()
        mocks.client.login.mockResolvedValue({})
        mocks.client.logout.mockResolvedValue({})
        mocks.client.subscribe.mockResolvedValue({})
        mocks.client.unsubscribe.mockResolvedValue({})
        mocks.client.renewToken.mockResolvedValue({})
    })

    const createService = () => new AgoraRTMService({
        appId: 'app-id',
        token: 'rtm-token',
        channel: 'conversation-channel',
        uid: '42',
    })

    it('logs in before subscribing to the matching message channel', async () => {
        const service = createService()

        await service.login()

        expect(mocks.RTM).toHaveBeenCalledWith('app-id', '42')
        expect(mocks.client.login).toHaveBeenCalledWith({ token: 'rtm-token' })
        expect(mocks.client.subscribe).toHaveBeenCalledWith('conversation-channel', {
            withMessage: true,
            withPresence: true,
        })
        expect(mocks.client.login.mock.invocationCallOrder[0])
            .toBeLessThan(mocks.client.subscribe.mock.invocationCallOrder[0])
    })

    it('routes RTM transcripts and raw messages through existing callbacks', async () => {
        const service = createService()
        const onMessage = vi.fn()
        const onRawMessage = vi.fn()
        service.setCallbacks({ onMessage, onRawMessage })
        await service.login()

        const event = {
            channelName: 'conversation-channel',
            customType: 'assistant.transcription',
            message: JSON.stringify({ text: 'RTM transcript', turn_id: 3 }),
        }
        mocks.listeners.get('message')?.(event)

        expect(onRawMessage).toHaveBeenCalledWith(event)
        expect(onMessage).toHaveBeenCalledWith({
            speaker: 'assistant',
            transcription: 'RTM transcript',
            turn_id: 3,
        })
    })

    it('routes turn.finished metrics as one final turn batch', async () => {
        const service = createService()
        const onMetricBatch = vi.fn()
        service.setCallbacks({ onMetricBatch })
        await service.login()

        mocks.listeners.get('message')?.({
            channelName: 'conversation-channel',
            customType: '',
            message: JSON.stringify({
                event_type: 'turn.finished',
                payload: {
                    turn_id: 4,
                    metrics: {
                        e2e_latency_ms: 500,
                        segmented_latency_ms: [
                            { name: 'transport', latency: 90 },
                        ],
                    },
                },
                object: 'PlainText',
            }),
        })

        expect(onMetricBatch).toHaveBeenCalledWith({
            turn_id: 4,
            metrics: [
                { turn_id: 4, module: 'e2e', metric_name: 'e2e_latency_ms', latency_ms: 500 },
                { turn_id: 4, module: 'transport', metric_name: 'latency', latency_ms: 90 },
            ],
        })
    })

    it('unsubscribes before logging out', async () => {
        const service = createService()
        await service.login()

        await service.logout()

        expect(mocks.client.unsubscribe).toHaveBeenCalledWith('conversation-channel')
        expect(mocks.client.logout).toHaveBeenCalledOnce()
        expect(mocks.client.unsubscribe.mock.invocationCallOrder[0])
            .toBeLessThan(mocks.client.logout.mock.invocationCallOrder[0])
    })

    it('does not leave a partial login when subscription fails', async () => {
        mocks.client.subscribe.mockRejectedValueOnce(new Error('subscribe failed'))
        const service = createService()

        await expect(service.login()).rejects.toThrow('subscribe failed')

        expect(mocks.client.logout).toHaveBeenCalledOnce()
    })

    it('renews the logged-in RTM token', async () => {
        const service = createService()
        await service.login()

        await service.renewToken('fresh-token')

        expect(mocks.client.renewToken).toHaveBeenCalledWith('fresh-token')
    })

    it('requests and applies a fresh token when Agora reports upcoming expiry', async () => {
        const service = createService()
        const onTokenWillExpire = vi.fn().mockResolvedValue('event-token')
        service.setCallbacks({ onTokenWillExpire })
        await service.login()

        await mocks.listeners.get('token')?.({ eventType: 'WILL_EXPIRE' })

        expect(onTokenWillExpire).toHaveBeenCalledOnce()
        expect(mocks.client.renewToken).toHaveBeenCalledWith('event-token')
    })
})
