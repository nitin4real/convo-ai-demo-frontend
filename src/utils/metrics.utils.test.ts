import { describe, expect, it } from 'vitest'
import { applyTurnMetricBatch, upsertMetric } from './metrics.utils'

describe('metrics state helpers', () => {
    it('replaces partial metrics for a finished turn and preserves other turns', () => {
        const result = applyTurnMetricBatch([
            { turn_id: 1, module: 'tts', metric_name: 'ttfb', latency_ms: 100 },
            { turn_id: 2, module: 'asr', metric_name: 'latency', latency_ms: 600 },
            { turn_id: 2, module: 'llm', metric_name: 'latency', latency_ms: 300 },
        ], {
            turn_id: 2,
            metrics: [
                { turn_id: 2, module: 'e2e', metric_name: 'e2e_latency_ms', latency_ms: 1799 },
                { turn_id: 2, module: 'asr', metric_name: 'ttlw', latency_ms: 740 },
                { turn_id: 2, module: 'transport', metric_name: 'latency', latency_ms: 420 },
            ],
        })

        expect(result).toEqual([
            { turn_id: 1, module: 'tts', metric_name: 'ttfb', latency_ms: 100 },
            { turn_id: 2, module: 'e2e', metric_name: 'e2e_latency_ms', latency_ms: 1799 },
            { turn_id: 2, module: 'asr', metric_name: 'ttlw', latency_ms: 740 },
            { turn_id: 2, module: 'transport', metric_name: 'latency', latency_ms: 420 },
        ])
    })

    it('updates a repeated partial metric instead of duplicating it', () => {
        const result = upsertMetric([
            { turn_id: 3, module: 'tts', metric_name: 'ttfb', latency_ms: 100 },
        ], {
            turn_id: 3,
            module: 'tts',
            metric_name: 'ttfb',
            latency_ms: 125,
        })

        expect(result).toEqual([
            { turn_id: 3, module: 'tts', metric_name: 'ttfb', latency_ms: 125 },
        ])
    })
})
