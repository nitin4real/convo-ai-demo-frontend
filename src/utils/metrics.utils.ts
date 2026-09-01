import { IMetricMessage, ITurnMetricBatch } from '../types/agent.types'

const isSameMetric = (left: IMetricMessage, right: IMetricMessage): boolean => (
    left.turn_id === right.turn_id &&
    left.module === right.module &&
    left.metric_name === right.metric_name
)

export const upsertMetric = (
    currentMetrics: IMetricMessage[],
    metric: IMetricMessage
): IMetricMessage[] => {
    const existingIndex = currentMetrics.findIndex(current => isSameMetric(current, metric))
    if (existingIndex === -1) {
        return [...currentMetrics, metric]
    }

    return currentMetrics.map((current, index) => index === existingIndex ? metric : current)
}

/** Replace partial metrics for a turn with the authoritative turn.finished values. */
export const applyTurnMetricBatch = (
    currentMetrics: IMetricMessage[],
    batch: ITurnMetricBatch
): IMetricMessage[] => [
    ...currentMetrics.filter(metric => metric.turn_id !== batch.turn_id),
    ...batch.metrics,
]
