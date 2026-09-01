import { IMessage, IMetricMessage, ITurnMetricBatch } from '../types/agent.types'
import { SPEAKER_MAP } from '../constant/constants'

export type TDataChunk = {
    message_id: string
    part_idx: number
    part_sum: number
    content: string
}

export type TDataChunkMessageV1 = {
    /** Boolean indicating if the text will no longer change (always True for ASR results) */
    is_final: boolean
    /** Int user ID - 0 for AI agent, non-zero for corresponding user int uid */
    stream_id: number
    /** String unique identifier for each subtitle message */
    message_id: string
    /** String data type, defaults to 'transcribe' */
    data_type: string
    /** Int timestamp when subtitle was generated */
    text_ts: number
    /** String subtitle content */
    text: string
}

export type TDataChunkMessageWord = {
    word: string
    start_ms: number
    duration_ms: number
    stable: boolean
}

export type TMessageEngineObjectWord = TDataChunkMessageWord & {
    word_status?: EMessageStatus
}

export type TQueueItem = {
    turn_id: number
    text: string
    words: TMessageEngineObjectWord[]
    status: EMessageStatus
    stream_id: number
}

/**
 * Represents the current status of a message in the system.
 * IN_PROGRESS (0): Message is still being processed/streamed.
 * END (1): Message has completed normally.
 * INTERRUPTED (2): Message was interrupted before completion.
 */
export enum EMessageStatus {
    IN_PROGRESS = 0,
    END = 1,
    INTERRUPTED = 2,
}

export enum ETranscriptionObjectType {
    USER_TRANSCRIPTION = 'user.transcription',
    AGENT_TRANSCRIPTION = 'assistant.transcription',
    MSG_INTERRUPTED = 'message.interrupt',
    METRIC = 'message.metrics',
}

export enum EMessageEngineMode {
    TEXT = 'text',
    WORD = 'word',
    AUTO = 'auto',
}

export interface ITranscriptionBase {
    object: ETranscriptionObjectType
    text: string
    start_ms: number
    duration_ms: number
    language: string
    turn_id: number
    stream_id: number
    user_id: string
    words: TDataChunkMessageWord[] | null
}

export interface IUserTranscription extends ITranscriptionBase {
    object: ETranscriptionObjectType.USER_TRANSCRIPTION
    final: boolean
}

export interface IAgentTranscription extends ITranscriptionBase {
    object: ETranscriptionObjectType.AGENT_TRANSCRIPTION
    quiet: boolean
    turn_seq_id: number
    turn_status: EMessageStatus
}

export interface IAgentMetric {
    object: ETranscriptionObjectType.METRIC
    metric_name: string
    turn_id: number
    module: string
    latency_ms: number
}

export interface IMessageInterrupt {
    object: ETranscriptionObjectType.MSG_INTERRUPTED
    message_id: string
    data_type: 'message'
    turn_id: number
    start_ms: number
    send_ts: number
}

export interface MessageEngineResult {
    transcript?: IMessage
    metric?: IMetricMessage
    metricBatch?: ITurnMetricBatch
    eventName?: string
}

type AgoraDataMessage = {
    object?: unknown
    text?: unknown
    turn_id?: unknown
    metric_name?: unknown
    module?: unknown
    latency_ms?: unknown
    content?: unknown
    event_type?: unknown
    payload?: unknown
}

const DEFAULT_MESSAGE_CACHE_TIMEOUT = 1000 * 60 * 5

export class MessageEngine {
    private _messageCache: Record<string, TDataChunk[]> = {}
    private _messageCacheTimeout: number = DEFAULT_MESSAGE_CACHE_TIMEOUT

    /** Retained for compatibility with callers that still provide RTC data-stream bytes. */
    public handleStreamMessage(stream: Uint8Array): MessageEngineResult {
        return this.handleTransportMessage(stream)
    }

    public handleRTMMessage(
        message: string | Uint8Array,
        customType?: string
    ): MessageEngineResult {
        return this.handleTransportMessage(message, customType)
    }

    private handleTransportMessage(
        message: string | Uint8Array,
        customType?: string
    ): MessageEngineResult {
        const decoded = typeof message === 'string'
            ? message
            : this.decodeStreamMessage(message)

        if (this.isChunk(decoded)) {
            let result: MessageEngineResult = {}
            this.handleChunk<AgoraDataMessage>(decoded, parsedMessage => {
                result = this.mapMessage(parsedMessage)
            })
            return result
        }

        try {
            const parsedMessage = JSON.parse(decoded)
            if (!parsedMessage || typeof parsedMessage !== 'object') {
                return {}
            }

            const normalizedMessage = parsedMessage.object || !customType
                ? parsedMessage
                : { ...parsedMessage, object: customType }
            return this.mapMessage(normalizedMessage as AgoraDataMessage)
        } catch (error) {
            console.error('Unable to parse Agora message', error)
            return {}
        }
    }

    public streamMessage2Chunk(stream: Uint8Array): string {
        return this.decodeStreamMessage(stream)
    }

    private isChunk(message: string): boolean {
        return /^[^|]+\|\d+\|(\d+|\?\?\?)\|/.test(message)
    }

    private mapMessage(message: AgoraDataMessage): MessageEngineResult {
        // console.log('messageEngine mapMessage', message)
        const metricBatch = this.mapTurnFinishedMetrics(message)
        if (metricBatch) {
            return { metricBatch }
        }

        if (message.object === 'message.state') {
            return {}
        }

        if (
            message.object === ETranscriptionObjectType.USER_TRANSCRIPTION &&
            typeof message.text === 'string' &&
            typeof message.turn_id === 'number'
        ) {
            return {
                transcript: {
                    speaker: SPEAKER_MAP.USER,
                    transcription: message.text,
                    turn_id: message.turn_id,
                }
            }
        }

        if (
            message.object === ETranscriptionObjectType.AGENT_TRANSCRIPTION &&
            typeof message.text === 'string' &&
            typeof message.turn_id === 'number'
        ) {
            return {
                transcript: {
                    speaker: SPEAKER_MAP.ASSISTANT,
                    transcription: message.text,
                    turn_id: message.turn_id,
                }
            }
        }

        if (
            message.object === ETranscriptionObjectType.METRIC &&
            typeof message.metric_name === 'string' &&
            typeof message.module === 'string' &&
            typeof message.turn_id === 'number' &&
            typeof message.latency_ms === 'number'
        ) {
            if (message.module === 'llm' && message.metric_name === 'ttfb') {
                return {}
            }

            return {
                metric: {
                    metric_name: message.metric_name,
                    module: message.module,
                    turn_id: message.turn_id,
                    latency_ms: message.latency_ms
                }
            }
        }

        if (message.object === 'message.user' && typeof message.content === 'string') {
            return { eventName: message.content }
        }

        return {}
    }

    private mapTurnFinishedMetrics(message: AgoraDataMessage): ITurnMetricBatch | undefined {
        if (message.event_type !== 'turn.finished' || !this.isRecord(message.payload)) {
            return undefined
        }

        const turnId = message.payload.turn_id
        const sourceMetrics = message.payload.metrics
        if (typeof turnId !== 'number' || !this.isRecord(sourceMetrics)) {
            return undefined
        }

        const metrics: IMetricMessage[] = []
        if (typeof sourceMetrics.e2e_latency_ms === 'number') {
            metrics.push({
                turn_id: turnId,
                module: 'e2e',
                metric_name: 'e2e_latency_ms',
                latency_ms: sourceMetrics.e2e_latency_ms,
            })
        }

        if (Array.isArray(sourceMetrics.segmented_latency_ms)) {
            sourceMetrics.segmented_latency_ms.forEach(segment => {
                if (
                    !this.isRecord(segment) ||
                    typeof segment.name !== 'string' ||
                    typeof segment.latency !== 'number'
                ) {
                    return
                }

                const separatorIndex = segment.name.indexOf('_')
                const module = separatorIndex === -1
                    ? segment.name
                    : segment.name.slice(0, separatorIndex)
                const metricName = separatorIndex === -1
                    ? 'latency'
                    : segment.name.slice(separatorIndex + 1)
                metrics.push({
                    turn_id: turnId,
                    module: module.toLowerCase(),
                    metric_name: metricName,
                    latency_ms: segment.latency,
                })
            })
        }

        return metrics.length > 0 ? { turn_id: turnId, metrics } : undefined
    }

    private isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null
    }

    public handleChunk<T = unknown>(
        chunk: string,
        callback?: (message: T) => void
    ): void {
        try {
            const [msgId, partIdx, partSum, partData] = chunk.split('|')
            const input: TDataChunk = {
                message_id: msgId,
                part_idx: parseInt(partIdx, 10),
                part_sum: partSum === '???' ? -1 : parseInt(partSum, 10),
                content: partData,
            }

            if (input.part_sum === -1) {
                return
            }

            if (!this._messageCache[input.message_id]) {
                this._messageCache[input.message_id] = []
                setTimeout(() => {
                    if (
                        this._messageCache[input.message_id] &&
                        this._messageCache[input.message_id].length < input.part_sum
                    ) {
                        delete this._messageCache[input.message_id]
                    }
                }, this._messageCacheTimeout)
            }

            if (
                !this._messageCache[input.message_id]?.find(
                    item => item.part_idx === input.part_idx
                )
            ) {
                this._messageCache[input.message_id].push(input)
            }
            this._messageCache[input.message_id].sort(
                (a, b) => a.part_idx - b.part_idx
            )

            if (this._messageCache[input.message_id].length === input.part_sum) {
                const encodedMessage = this._messageCache[input.message_id]
                    .map(messageChunk => messageChunk.content)
                    .join('')
                const binaryMessage = atob(encodedMessage)
                const bytes = Uint8Array.from(
                    binaryMessage,
                    character => character.charCodeAt(0)
                )
                const decodedMessage = JSON.parse(new TextDecoder().decode(bytes))

                callback?.(decodedMessage)
                delete this._messageCache[input.message_id]
            }
        } catch (error: unknown) {
            console.error('handleChunk error', error)
        }
    }

    public decodeStreamMessage(stream: Uint8Array): string {
        return new TextDecoder().decode(stream)
    }
}

export const messageEngine = new MessageEngine()
