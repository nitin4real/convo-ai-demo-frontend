
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

// https://github.com/TEN-framework/ten_ai_base/blob/main/interface/ten_ai_base/transcription.py
/**
 * Represents the current status of a message in the system
 * 
 * IN_PROGRESS (0): Message is still being processed/streamed
 * END (1): Message has completed normally
 * INTERRUPTED (2): Message was interrupted before completion
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
}

/**
 * Defines different modes for message rendering
 * 
 * TEXT: Processes messages as complete text blocks without word-by-word processing.
 * Messages are handled as entire units.
 * 
 * WORD: Processes messages word by word, enabling granular control.
 * Suitable for real-time word-by-word display or analysis.
 * 
 * AUTO: Automatically determines the most suitable processing mode (TEXT or WORD)
 * based on context or message characteristics.
 */
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
    object: ETranscriptionObjectType.USER_TRANSCRIPTION // "user.transcription"
    final: boolean
}

export interface IAgentTranscription extends ITranscriptionBase {
    object: ETranscriptionObjectType.AGENT_TRANSCRIPTION // "assistant.transcription"
    quiet: boolean
    turn_seq_id: number
    turn_status: EMessageStatus
}

export interface IMessageInterrupt {
    object: ETranscriptionObjectType.MSG_INTERRUPTED // "message.interrupt"
    message_id: string
    data_type: 'message'
    turn_id: number
    start_ms: number
    send_ts: number
}


const DEFAULT_MESSAGE_CACHE_TIMEOUT = 1000 * 60 * 5 // 5 minutes

export class MessageEngine {
    // handle rtc-engine stream message
    private _messageCache: Record<string, TDataChunk[]> = {}
    private _messageCacheTimeout: number = DEFAULT_MESSAGE_CACHE_TIMEOUT

    public handleStreamMessage(stream: Uint8Array) {
        const chunk = this.streamMessage2Chunk(stream)
        this.handleChunk<
            IUserTranscription | IAgentTranscription | IMessageInterrupt
        >(chunk, (message) => {
            console.log('handleStreamMessage', message)
        })
    }

    public streamMessage2Chunk(stream: Uint8Array) {
        const chunk = this.decodeStreamMessage(stream)
        return chunk
    }


    public handleChunk<
        T extends
        | TDataChunkMessageV1
        | IUserTranscription
        | IAgentTranscription
        | IMessageInterrupt,
    >(chunk: string, callback?: (message: T) => void): void {
        try {
            // split chunk by '|'
            const [msgId, partIdx, partSum, partData] = chunk.split('|')
            // convert to TDataChunk
            const input: TDataChunk = {
                message_id: msgId,
                part_idx: parseInt(partIdx, 10),
                part_sum: partSum === '???' ? -1 : parseInt(partSum, 10), // -1 means total parts unknown
                content: partData,
            }
            // check if total parts is known, skip if unknown
            if (input.part_sum === -1) {
                console.log(
                    'total parts unknown, waiting for further parts.'
                )
                return
            }

            // check if cached
            // case 1: not cached, create new cache
            if (!this._messageCache[input.message_id]) {
                this._messageCache[input.message_id] = []
                // set cache timeout, drop it if incomplete after timeout
                setTimeout(() => {
                    if (
                        this._messageCache[input.message_id] &&
                        this._messageCache[input.message_id].length < input.part_sum
                    ) {
                        console.log(
                            'message cache timeout, drop it.'
                        )
                        delete this._messageCache[input.message_id]
                    }
                }, this._messageCacheTimeout)
            }
            // case 2: cached, add to cache(and sort by part_idx)
            if (
                !this._messageCache[input.message_id]?.find(
                    (item) => item.part_idx === input.part_idx
                )
            ) {
                // unique push
                this._messageCache[input.message_id].push(input)
            }
            this._messageCache[input.message_id].sort(
                (a, b) => a.part_idx - b.part_idx
            )

            // check if complete
            if (this._messageCache[input.message_id].length === input.part_sum) {
                const message = this._messageCache[input.message_id]
                    .map((chunk) => chunk.content)
                    .join('')

                // decode message
                console.log('[message]', atob(message))

                const decodedMessage = JSON.parse(atob(message))

                console.log('[decodedMessage]', decodedMessage)

                // callback
                callback?.(decodedMessage)

                // delete cache
                delete this._messageCache[input.message_id]
            }

            // end
            return
        } catch (error: unknown) {
            console.error('handleChunk error', error)
            return
        }
    }

    public decodeStreamMessage(stream: Uint8Array) {
        const decoder = new TextDecoder()
        return decoder.decode(stream)
    }
}

export const messageEngine = new MessageEngine()