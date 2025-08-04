import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { toast } from "sonner"

// Import sub-components
import CustomASR from "./Custom_ASR"
import CustomLLM from "./Custom_LLM"
import CustomTTS from "./Custom_TTS"
import CustomAvatar from "./Custom_Avatar"
import CustomTurnDetection from "./Custom_Detection"
import CustomAdvanced from "./Custom_Advanced"
import CustomMLLM from "./Custom_MLLM"


interface ARES_ASR_PARAMS {
    vendor: 'ares'
    language: string
}

interface DEEPGRAM_ASR_PARAMS {
    vendor: 'deepgram'
    params: {
        url: string
        key: string
        model: string
        language: string
    }
}

interface MICROSOFT_ASR {
    vendor: 'microsoft'
    params: {
        key: string
        region: string
        language: string
        phrase_list: string[]
    }
}

type ASR = ARES_ASR_PARAMS | DEEPGRAM_ASR_PARAMS | MICROSOFT_ASR

const DEFAULT_ARES_ASR: ARES_ASR_PARAMS = {
    vendor: 'ares',
    language: 'en-US',
}


interface OPENAI_LLM {
    url: string
    api_key: string
    system_messages: Array<{
        role: string
        content: string
    }>
    greeting_message: string
    failure_message: string
    max_history: number
    params: {
        model: string
    }
}

interface DIFY_LLM {
    url: string
    api_key: string
    system_messages: Array<{
        role: string
        content: string
    }>
    greeting_message: string
    failure_message: string
    max_history: number
    params: {
        model: string
    }
    style: "dify"
}

interface GOOGLE_LLM {
    url: string
    system_messages: Array<{
        role: string
        content: string
    }>
    greeting_message: string
    failure_message: string
    max_history: number
    params: {
        model: string
    }
    style: "gemini"
}

interface ANTHROPIC_LLM {
    url: string
    api_key: string
    headers: string
    system_messages: Array<{
        role: string
        content: string
    }>
    greeting_message: string
    failure_message: string
    max_history: number
    params: {
        model: string
        max_tokens: number
    }
    style: "anthropic"
}

interface GEMINI_VERTEX_LLM {
    url: string
    api_key: string
    system_messages: Array<{
        role: string
        parts: Array<{
            text: string
        }>
    }>
    greeting_message: string
    failure_message: string
    max_history: number
    params: {
        model: string
    }
    style: "gemini"
}

const DEFAULT_OPENAI_LLM: OPENAI_LLM = {
    url: 'https://api.openai.com/v1/chat/completions',
    api_key: '<YOUR_KEY>',
    system_messages: [{ role: 'system', content: 'You are a helpful chatbot.' }],
    greeting_message: 'Hello, how can I help you today?',
    failure_message: 'Hold on a second.',
    max_history: 32,
    params: {
        model: 'gpt-4o-mini',
    }
}

type LLM = OPENAI_LLM | GOOGLE_LLM | ANTHROPIC_LLM | DIFY_LLM | GEMINI_VERTEX_LLM

interface MICROSOFT_TTS {
    vendor: 'microsoft'
    params: {
        key: string
        region: string
        voice_name: string
        speed: number
        volume: number
        sample_rate: number
    }
}

interface ELEVENLABS_TTS {
    vendor: 'elevenlabs'
    params: {
        key: string
        model_id: string
        voice_id: string
        sample_rate: number
        speed: number
    }
}

interface CARTESIA_TTS {
    vendor: 'cartesia'
    params: {
        api_key: string
        model_id: string
        voice: {
            mode: string
            id: string
        }
    }
}

interface OPENAI_TTS {
    vendor: 'openai'
    params: {
        api_key: string
        model: string
        voice: string
        instructions: string
        speed: number
    }
}

interface HUEMAI_TTS {
    vendor: 'humeai'
    params: {
        key: string
        voice_id: string
        provider: "HUME_AI" | "CUSTOM_VOICE"
        speed: number
        trailing_silence: number
    }
}

type TTS = MICROSOFT_TTS | ELEVENLABS_TTS | CARTESIA_TTS | OPENAI_TTS | HUEMAI_TTS

const DEFAULT_MICROSOFT_TTS: MICROSOFT_TTS = {
    vendor: "microsoft",
    params: {
        key: "<your_microsoft_key>",
        region: "eastus",
        voice_name: "en-US-AndrewMultilingualNeural",
        speed: 1.0,
        volume: 70,
        sample_rate: 24000
    }
}


export interface AdvanceFeatures {
    enable_aivad?: boolean
    enable_rtm?: boolean
    enable_mllm?: boolean
}

interface MLLM {
    url: string
    api_key: string
    params: {
        model: string
        voice: string
        instructions: string
        input_audio_transcription: {
            language: string
            model: string
            prompt: string
        }
    }
    max_history: number
    greeting_message: string
    output_modalities: string[]
    vendor: 'openai'
    style: 'openai'
}

const DEFAULT_MLLM: MLLM = {
    url: "wss://api.openai.com/v1/realtime",
    api_key: "<YOUR_KEY>",
    params: {
        model: "gpt-4o-realtime-preview",
        voice: "coral",
        instructions: "You are a Conversational AI Agent, developed by Agora.",
        input_audio_transcription: {
            language: "<language>",
            model: "gpt-4o-mini-transcribe",
            prompt: "expect words related to real-time engagement"
        }
    },
    max_history: 20,
    greeting_message: "Hello, how can I help you today?",
    output_modalities: ["text", "audio"],
    vendor: "openai",
    style: "openai"
}

interface AKOOL_AVATAR {
    vendor: "akool"
    enable: boolean
    params: {
        api_key: string
        agora_uid: string
        agora_token: string
        avatar_id: string
    }
}

interface HEYGEN_AVATAR {
    vendor: "heygen"
    enable: boolean
    params: {
        api_key: string
        quality: "medium" | "high"
        agora_uid: string
        agora_token: string
        avatar_id: string
        disable_idle_timeout: boolean
        activity_idle_timeout: number
    }
}

const DEFAULT_AKOOL_AVATAR: AKOOL_AVATAR = {
    vendor: "akool",
    enable: false,
    params: {
        api_key: "<akool_key>",
        agora_uid: "<avatar_rtc_uid>",
        agora_token: "<avatar_rtc_token>",
        avatar_id: "<akool_avatar_id>"
    }
}

type AVATAR = AKOOL_AVATAR | HEYGEN_AVATAR

export interface TURN_DETECTION {
    type: 'agora_vad' | 'server_vad' | 'semantic_vad'
    interrupt_mode: 'interrupt' | 'append' | 'ignore'
    interrupt_duration_ms: number
    prefix_padding_ms: number
    silence_duration_ms: number
    threshold: number
    create_response?: boolean
    interrupt_response?: boolean
    eagerness?: 'auto' | 'low' | 'high'
}

export interface SILENCE_CONFIG {
    timeout_ms: number
    action: 'speak' | 'think'
    content: string
}

export const DEFAULT_SILENCE_CONFIG: SILENCE_CONFIG = {
    timeout_ms: 0, // max is 60000, 0 disables silence reminder feature
    action: 'speak',
    content: 'Are you still there?'
}

export const DEFAULT_TURN_DETECTION_VALUES: TURN_DETECTION = {
    type: 'agora_vad',
    interrupt_mode: 'interrupt',
    interrupt_duration_ms: 160,
    prefix_padding_ms: 800,
    silence_duration_ms: 640,
    threshold: 0.5,
}


export const DEFAULT_PARAMETERS: PARAMETERS = {
    data_channel: 'datastream',
    enable_metrics: false,
    enable_error_message: false,
    silence_config: DEFAULT_SILENCE_CONFIG,
}

export const DEFAULT_MLLM_PARAMETERS: PARAMETERS = {
    data_channel: 'datastream',
    enable_metrics: false,
    enable_error_message: false,
}

export interface PARAMETERS {
    data_channel: 'datastream' | 'rtm'
    enable_metrics: boolean
    enable_error_message: boolean
    silence_config?: SILENCE_CONFIG
}

export interface IProperties {
    channel: string;
    token: string;
    agent_rtc_uid: string;
    remote_rtc_uids: string[];
    enable_string_uid: boolean;
    idle_timeout: number;
    llm?: LLM
    asr?: ASR
    tts?: TTS
    avatar?: AVATAR
    mllm?: MLLM
    turn_detection?: TURN_DETECTION
    parameters?: PARAMETERS
    advanced_features?: AdvanceFeatures
}

const PLACEHOLDER_JSON: IProperties = {
    channel: '<CHANNEL_NAME>',
    token: '<AGENT_TOKEN>',
    agent_rtc_uid: '<AGENT_RTC_UID>',
    remote_rtc_uids: ['<REMOTE_RTC_UID>'],
    enable_string_uid: false,
    idle_timeout: 30,
    llm: { ...DEFAULT_OPENAI_LLM },
    asr: { ...DEFAULT_ARES_ASR },
    tts: { ...DEFAULT_MICROSOFT_TTS },
    avatar: { ...DEFAULT_AKOOL_AVATAR },
    turn_detection: { ...DEFAULT_TURN_DETECTION_VALUES },
    parameters: { ...DEFAULT_PARAMETERS }
}


const PLACEHOLDER_JSON_MLLM: IProperties = {
    channel: '<CHANNEL_NAME>',
    token: '<AGENT_TOKEN>',
    agent_rtc_uid: '<AGENT_RTC_UID>',
    remote_rtc_uids: ['<REMOTE_RTC_UID>'],
    enable_string_uid: false,
    idle_timeout: 30,
    mllm: { ...DEFAULT_MLLM },
    turn_detection: { ...DEFAULT_TURN_DETECTION_VALUES },
    parameters: { ...DEFAULT_PARAMETERS },
    advanced_features: {
        enable_mllm: true
    }
}


const FIXED_VALUES = {
    channel: '<CHANNEL_NAME>',
    token: '<AGENT_TOKEN>',
    agent_rtc_uid: '<AGENT_RTC_UID>',
    remote_rtc_uids: ['<REMOTE_RTC_UID>'],
    enable_string_uid: false,
}


// const options_json = {
//     mllm: {
//         asr: false,
//         llm: false,
//         tts: false,
//         avatar: false,
//         turn_detection: {
//             type: ['agora_vad', 'server_vad', 'semantic_vad'],
//             interrupt_mode: ['interrupt'],
//         },
//         parameters: false,
//         mllm: true, 
//         silence_config: false,
//     },
//     cascading: {
//         asr: true,
//         llm: true,
//         tts: true,
//         avatar: true,
//         turn_detection: {
//             type: ['agora_vad'],
//             interrupt_mode: ['interrupt', 'append', 'ignore'],
//         },
//         parameters: true,
//         mllm: false, 
//         silence_config: true,
//     }
// }



export default function CustomAgent({ onCreateAgent }: { onCreateAgent: (agent: IProperties) => void }) {
    const [jsonText, setJsonText] = useState<string>(JSON.stringify(PLACEHOLDER_JSON, null, 2))
    const [error, setError] = useState<string>("")
    const [isValid, setIsValid] = useState<boolean>(true)
    const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false)

    // Form states for each section
    const [asrVendor, setAsrVendor] = useState<string>('ares')
    const [asrConfig, setAsrConfig] = useState<any>(DEFAULT_ARES_ASR)

    const [llmType, setLlmType] = useState<string>('openai')
    const [llmConfig, setLlmConfig] = useState<any>(DEFAULT_OPENAI_LLM)

    const [ttsVendor, setTtsVendor] = useState<string>('microsoft')
    const [ttsConfig, setTtsConfig] = useState<any>(DEFAULT_MICROSOFT_TTS)

    const [avatarVendor, setAvatarVendor] = useState<string>('akool')
    const [avatarConfig, setAvatarConfig] = useState<any>(DEFAULT_AKOOL_AVATAR)

    const [turnDetectionConfig, setTurnDetectionConfig] = useState<TURN_DETECTION>(DEFAULT_TURN_DETECTION_VALUES)
    const [parametersConfig, setParametersConfig] = useState<PARAMETERS>(DEFAULT_PARAMETERS)

    const [useMllm, setUseMllm] = useState<boolean>(false)
    const [mllmConfig, setMllmConfig] = useState<MLLM>(DEFAULT_MLLM)
    const [activeTab, setActiveTab] = useState<string>("asr")

    const [advancedFeatures, setAdvancedFeatures] = useState<AdvanceFeatures>({
        enable_aivad: false,
        enable_rtm: false,
        enable_mllm: false
    })

    // Readonly fields that users shouldn't modify
    const readonlyFields = ['channel', 'token', 'agent_rtc_uid', 'remote_rtc_uids']

    const syncFormToJson = () => {
        const updatedProperties: IProperties = {
            ...FIXED_VALUES,
            idle_timeout: 30,
            enable_string_uid: false,
            turn_detection: turnDetectionConfig,
            parameters: parametersConfig,
            advanced_features: advancedFeatures,
        }

        if (useMllm) {
            // MLLM mode - only include MLLM configuration
            updatedProperties.mllm = mllmConfig
        } else {
            // Traditional mode - include ASR, LLM, TTS, Avatar
            updatedProperties.asr = asrConfig
            updatedProperties.llm = llmConfig
            updatedProperties.tts = ttsConfig
            updatedProperties.avatar = avatarConfig
        }

        const newJsonText = JSON.stringify(updatedProperties, null, 2)
        setJsonText(newJsonText)
        setIsValid(true)
        setError("")
        return updatedProperties
    }

    const handleMllmToggle = (checked: boolean) => {
        setUseMllm(checked)
        if (checked) {
            setActiveTab("mllm") // Switch to MLLM tab when enabling MLLM
            setAdvancedFeatures({
                enable_aivad: false,
                enable_rtm: false,
                enable_mllm: true
            })
            setJsonText(JSON.stringify(PLACEHOLDER_JSON_MLLM, null, 2))
        } else {
            setActiveTab("asr") // Switch to ASR tab when disabling MLLM
            setAdvancedFeatures({
                enable_aivad: false,
                enable_rtm: false,
                enable_mllm: false
            })
            setJsonText(JSON.stringify(PLACEHOLDER_JSON, null, 2))
        }
    }

    const syncJsonToForm = () => {
        try {
            const parsed = JSON.parse(jsonText)

            // Detect if this is MLLM mode
            const hasMllm = !!parsed.mllm
            const hasTraditionalComponents = !!(parsed.asr || parsed.llm || parsed.tts || parsed.avatar)

            // Set MLLM mode if MLLM is present and no traditional components
            setUseMllm(hasMllm && !hasTraditionalComponents)

            // Update ASR
            if (parsed.asr) {
                setAsrVendor(parsed.asr.vendor)
                setAsrConfig(parsed.asr)
            }

            // Update LLM
            if (parsed.llm) {
                if ('style' in parsed.llm) {
                    setLlmType(parsed.llm.style)
                } else {
                    setLlmType('openai')
                }
                setLlmConfig(parsed.llm)
            }

            // Update TTS
            if (parsed.tts) {
                setTtsVendor(parsed.tts.vendor)
                setTtsConfig(parsed.tts)
            }

            // Update Avatar
            if (parsed.avatar) {
                setAvatarVendor(parsed.avatar.vendor)
                setAvatarConfig(parsed.avatar)
            }

            // Update other configs
            if (parsed.turn_detection) setTurnDetectionConfig(parsed.turn_detection)
            if (parsed.parameters) setParametersConfig(parsed.parameters)
            if (parsed.mllm) setMllmConfig(parsed.mllm)

            setAdvancedFeatures({
                enable_aivad: parsed.advanced_features?.enable_aivad,
                enable_rtm: parsed.advanced_features?.enable_rtm,
                enable_mllm: parsed.advanced_features?.enable_mllm
            })

            // Set the appropriate active tab based on the configuration
            if (parsed.advanced_features?.enable_mllm) {
                setUseMllm(true)
                setActiveTab("mllm")
            } else {
                setUseMllm(false)
                setActiveTab("asr")
            }

            setIsValid(true)
            setError("")
        } catch (err) {
            setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
            setIsValid(false)
        }
    }

    const handleJsonChange = (value: string) => {
        setJsonText(value)

        try {
            const parsed = JSON.parse(value)
            // Preserve readonly fields
            const updatedProperties = { ...parsed }
            readonlyFields.forEach(field => {
                if (field in PLACEHOLDER_JSON) {
                    updatedProperties[field] = PLACEHOLDER_JSON[field as keyof IProperties]
                }
            })

            setError("")
            setIsValid(true)
        } catch (err) {
            setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
            setIsValid(false)
        }
    }

    const handleViewJSONModeToggle = (checked: boolean) => {
        if (checked) {
            // Switching to advanced mode - sync form to JSON
            syncFormToJson()
        } else {
            // Switching to form mode - sync JSON to form
            syncJsonToForm()
        }
        setIsAdvancedMode(checked)
    }

    const copyToClipboard = () => {
        if (!isAdvancedMode) {
            syncFormToJson()
        }
        navigator.clipboard.writeText(jsonText)
        toast.success('Copied to clipboard')
    }

    const formatJson = () => {
        try {
            const parsed = JSON.parse(jsonText)
            const formatted = JSON.stringify(parsed, null, 2)
            setJsonText(formatted)
            setError("")
            setIsValid(true)
        } catch (err) {
            setError(`Cannot format invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
    }

    const resetToDefault = () => {
        const defaultJson = JSON.stringify(PLACEHOLDER_JSON, null, 2)
        setJsonText(defaultJson)

        // Reset form states
        setAsrVendor('ares')
        setAsrConfig(DEFAULT_ARES_ASR)
        setLlmType('openai')
        setLlmConfig(DEFAULT_OPENAI_LLM)
        setTtsVendor('microsoft')
        setTtsConfig(DEFAULT_MICROSOFT_TTS)
        setAvatarVendor('akool')
        setAvatarConfig(DEFAULT_AKOOL_AVATAR)
        setTurnDetectionConfig(DEFAULT_TURN_DETECTION_VALUES)
        setParametersConfig(DEFAULT_PARAMETERS)
        setMllmConfig(DEFAULT_MLLM)
        setAdvancedFeatures({
            enable_aivad: false,
            enable_rtm: false,
            enable_mllm: false
        })
        setUseMllm(false)
        setActiveTab("asr") // Reset to ASR tab when resetting to default
    }

    const minifyJson = () => {
        try {
            const parsed = JSON.parse(jsonText)
            const minified = JSON.stringify(parsed)
            setJsonText(minified)
            setError("")
            setIsValid(true)
        } catch (err) {
            setError(`Cannot minify invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
    }

    // Generate line numbers based on textarea content
    const getLineNumbers = () => {
        const lines = jsonText.split('\n')
        return lines.map((_, index) => index + 1)
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Custom Agent Configuration</CardTitle>

                    {/* Mode Toggle */}


                    <div className="flex gap-2 flex-wrap">
                        {isAdvancedMode && (
                            <>
                                <Button
                                    onClick={formatJson}
                                    variant="outline"
                                    size="sm"
                                >
                                    Format JSON
                                </Button>
                                <Button
                                    onClick={minifyJson}
                                    variant="outline"
                                    size="sm"
                                >
                                    Minify JSON
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={copyToClipboard}
                            variant="outline"
                            size="sm"
                        >
                            Copy to Clipboard
                        </Button>
                        <Button
                            onClick={resetToDefault}
                            variant="outline"
                            size="sm"
                        >
                            Reset to Default
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                            if (!isAdvancedMode) {
                                onCreateAgent(syncFormToJson())
                            } else {
                                onCreateAgent(JSON.parse(jsonText))
                            }
                        }}>Create Agent</Button>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-600">
                                {isValid ? 'Valid JSON' : 'Invalid JSON'}
                            </span>
                        </div>

                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="advanced-mode">View in JSON</Label>
                        <Switch
                            id="advanced-mode"
                            checked={isAdvancedMode}
                            onCheckedChange={handleViewJSONModeToggle}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="use-mllm">Use MLLM</Label>
                        <Switch
                            id="use-mllm"
                            checked={useMllm}
                            onCheckedChange={handleMllmToggle}
                        />
                    </div>

                </CardHeader>
                <CardContent>
                    {
                        isAdvancedMode && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mb-4">
                                <div><span className="font-bold">Info: </span>Channel name, tokens, and UIDs are automatically managed and don't need configuration.</div>
                            </div>
                        )
                    }

                    {isValid && (
                        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md mb-4">
                            ✓ Configuration is valid and ready to use
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
                            <div className="text-red-800">{error}</div>
                        </div>
                    )}

                    {isAdvancedMode ? (
                        // Advanced JSON Mode
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Agent Properties JSON Configuration
                                </label>
                                <div className="relative">
                                    <div className="flex border rounded-md overflow-hidden">
                                        <div className="bg-gray-50 border-r border-gray-200 px-2 py-4 text-right select-none">
                                            {getLineNumbers().map((lineNum) => (
                                                <div
                                                    key={lineNum}
                                                    className="text-xs text-gray-500 leading-5 font-mono h-5"
                                                    style={{ lineHeight: '20px' }}
                                                >
                                                    {lineNum}
                                                </div>
                                            ))}
                                        </div>
                                        <textarea
                                            value={jsonText}
                                            onChange={(e) => handleJsonChange(e.target.value)}
                                            className={`flex-1 p-4 font-mono text-sm resize-none outline-none leading-5 ${isValid
                                                ? 'focus:ring-1 focus:ring-blue-500'
                                                : 'focus:ring-1 focus:ring-red-500'
                                                }`}
                                            style={{ lineHeight: '20px' }}
                                            placeholder="Enter your custom agent configuration JSON here..."
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Form Mode
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className={`grid w-full ${useMllm ? 'grid-cols-3' : 'grid-cols-6'}`}>
                                {!useMllm && <TabsTrigger value="asr">ASR</TabsTrigger>}
                                {!useMllm && <TabsTrigger value="llm">LLM</TabsTrigger>}
                                {!useMllm && <TabsTrigger value="tts">TTS</TabsTrigger>}
                                {!useMllm && <TabsTrigger value="avatar">Avatar</TabsTrigger>}
                                {useMllm && <TabsTrigger value="mllm">MLLM</TabsTrigger>}
                                <TabsTrigger value="detection">Turn Detection</TabsTrigger>
                                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                            </TabsList>

                            {/* ASR Tab */}
                            {!useMllm && (
                                <TabsContent value="asr" className="space-y-4">
                                    <CustomASR
                                        asrVendor={asrVendor}
                                        asrConfig={asrConfig}
                                        setAsrVendor={setAsrVendor}
                                        setAsrConfig={setAsrConfig}
                                    />
                                </TabsContent>
                            )}

                            {/* LLM Tab */}
                            {!useMllm && (
                                <TabsContent value="llm" className="space-y-4">
                                    <CustomLLM
                                        llmType={llmType}
                                        llmConfig={llmConfig}
                                        setLlmType={setLlmType}
                                        setLlmConfig={setLlmConfig}
                                    />
                                </TabsContent>
                            )}

                            {/* TTS Tab */}
                            {!useMllm && (
                                <TabsContent value="tts" className="space-y-4">
                                    <CustomTTS
                                        ttsVendor={ttsVendor}
                                        ttsConfig={ttsConfig}
                                        setTtsVendor={setTtsVendor}
                                        setTtsConfig={setTtsConfig}
                                    />
                                </TabsContent>
                            )}

                            {/* Avatar Tab */}
                            {!useMllm && (
                                <TabsContent value="avatar" className="space-y-4">
                                    <CustomAvatar
                                        avatarVendor={avatarVendor}
                                        avatarConfig={avatarConfig}
                                        setAvatarVendor={setAvatarVendor}
                                        setAvatarConfig={setAvatarConfig}
                                    />
                                </TabsContent>
                            )}

                            {/* MLLM Tab */}
                            {useMllm && (
                                <TabsContent value="mllm" className="space-y-4">
                                    <CustomMLLM
                                        mllmConfig={mllmConfig}
                                        setMllmConfig={setMllmConfig}
                                    />
                                </TabsContent>
                            )}

                            {/* Turn Detection Tab */}
                            <TabsContent value="detection" className="space-y-4">
                                <CustomTurnDetection
                                    enable_mllm={useMllm}
                                    turnDetectionConfig={turnDetectionConfig}
                                    parametersConfig={parametersConfig}
                                    setTurnDetectionConfig={setTurnDetectionConfig}
                                    setParametersConfig={setParametersConfig}
                                />
                            </TabsContent>

                            {/* Advanced Features Tab */}
                            <TabsContent value="advanced" className="space-y-4">
                                <CustomAdvanced
                                    advancedFeatures={advancedFeatures}
                                    setAdvancedFeatures={setAdvancedFeatures}
                                />
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}