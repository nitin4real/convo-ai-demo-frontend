import { describe, expect, it } from 'vitest'
import { MessageEngine } from './agora.message.service'

describe('MessageEngine RTM messages', () => {
    it('maps direct RTM transcript JSON to the existing UI message shape', () => {
        const engine = new MessageEngine()

        const result = engine.handleRTMMessage(JSON.stringify({
            object: 'assistant.transcription',
            text: 'Hello from RTM',
            turn_id: 7,
        }))

        expect(result.transcript).toEqual({
            speaker: 'assistant',
            transcription: 'Hello from RTM',
            turn_id: 7,
        })
    })

    it('uses the RTM custom type when the JSON payload omits object', () => {
        const engine = new MessageEngine()

        const result = engine.handleRTMMessage(
            JSON.stringify({ text: 'User text', turn_id: 8 }),
            'user.transcription'
        )

        expect(result.transcript).toMatchObject({
            speaker: 'user',
            transcription: 'User text',
            turn_id: 8,
        })
    })

    it('preserves chunk reassembly for fragmented RTM messages', () => {
        const engine = new MessageEngine()
        const encoded = Buffer.from(JSON.stringify({
            object: 'message.metrics',
            metric_name: 'latency',
            module: 'tts',
            turn_id: 9,
            latency_ms: 123,
        })).toString('base64')
        const midpoint = Math.ceil(encoded.length / 2)

        expect(engine.handleRTMMessage(`metric-9|0|2|${encoded.slice(0, midpoint)}`)).toEqual({})
        expect(engine.handleRTMMessage(`metric-9|1|2|${encoded.slice(midpoint)}`)).toEqual({
            metric: {
                metric_name: 'latency',
                module: 'tts',
                turn_id: 9,
                latency_ms: 123,
            }
        })
    })

    it('continues to expose custom message.user events', () => {
        const engine = new MessageEngine()

        expect(engine.handleRTMMessage(JSON.stringify({
            object: 'message.user',
            content: 'show_box',
        }))).toEqual({ eventName: 'show_box' })
    })

    it('maps a voice-input turn.finished event to an authoritative metric batch', () => {
        const engine = new MessageEngine()

        const result = engine.handleRTMMessage(JSON.stringify({
            event_id: '2c6cf560',
            event_type: 'turn.finished',
            payload: {
                turn_id: 2,
                metrics: {
                    e2e_latency_ms: 1799,
                    segmented_latency_ms: [
                        { name: 'algorithm_processing', latency: 200 },
                        { name: 'asr_ttlw', latency: 740 },
                        { name: 'llm_ttft', latency: 281 },
                        { name: 'llm_ftfs', latency: 5 },
                        { name: 'tts_ttfb', latency: 153 },
                        { name: 'transport', latency: 420 },
                    ],
                },
            },
            object: 'PlainText',
        }))

        expect(result.metricBatch).toEqual({
            turn_id: 2,
            metrics: [
                { turn_id: 2, module: 'e2e', metric_name: 'e2e_latency_ms', latency_ms: 1799 },
                { turn_id: 2, module: 'algorithm', metric_name: 'processing', latency_ms: 200 },
                { turn_id: 2, module: 'asr', metric_name: 'ttlw', latency_ms: 740 },
                { turn_id: 2, module: 'llm', metric_name: 'ttft', latency_ms: 281 },
                { turn_id: 2, module: 'llm', metric_name: 'ftfs', latency_ms: 5 },
                { turn_id: 2, module: 'tts', metric_name: 'ttfb', latency_ms: 153 },
                { turn_id: 2, module: 'transport', metric_name: 'latency', latency_ms: 420 },
            ],
        })
    })

    it('maps greeting turn.finished metrics even when only TTS is present', () => {
        const engine = new MessageEngine()

        const result = engine.handleRTMMessage(JSON.stringify({
            event_type: 'turn.finished',
            payload: {
                turn_id: 1,
                metrics: {
                    e2e_latency_ms: 118,
                    segmented_latency_ms: [
                        { name: 'tts_ttfb', latency: 118 },
                    ],
                },
            },
            object: 'PlainText',
        }))

        expect(result.metricBatch).toEqual({
            turn_id: 1,
            metrics: [
                { turn_id: 1, module: 'e2e', metric_name: 'e2e_latency_ms', latency_ms: 118 },
                { turn_id: 1, module: 'tts', metric_name: 'ttfb', latency_ms: 118 },
            ],
        })
    })
})
