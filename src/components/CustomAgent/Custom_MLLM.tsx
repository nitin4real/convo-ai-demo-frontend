import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Slider } from "../ui/slider"

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

interface CustomMLLMProps {
    mllmConfig: MLLM
    setMllmConfig: (config: MLLM) => void
}

const CustomMLLM = ({ mllmConfig, setMllmConfig }: CustomMLLMProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Multimodal Large Language Model (MLLM)</h3>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="mllm-key">API Key</Label>
                    <Input
                        id="mllm-key"
                        type="password"
                        value={mllmConfig.api_key || ''}
                        onChange={(e) => setMllmConfig({...mllmConfig, api_key: e.target.value})}
                        placeholder="Your OpenAI API key"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mllm-model">Model</Label>
                    <Input
                        id="mllm-model"
                        value={mllmConfig.params?.model || 'gpt-4o-realtime-preview'}
                        onChange={(e) => setMllmConfig({
                            ...mllmConfig,
                            params: {...mllmConfig.params, model: e.target.value}
                        })}
                        placeholder="e.g., gpt-4o-realtime-preview"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mllm-voice">Voice</Label>
                    <Select
                        value={mllmConfig.params?.voice || 'coral'}
                        onValueChange={(value) => setMllmConfig({
                            ...mllmConfig,
                            params: {...mllmConfig.params, voice: value}
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="coral">Coral</SelectItem>
                            <SelectItem value="sage">Sage</SelectItem>
                            <SelectItem value="alloy">Alloy</SelectItem>
                            <SelectItem value="echo">Echo</SelectItem>
                            <SelectItem value="fable">Fable</SelectItem>
                            <SelectItem value="onyx">Onyx</SelectItem>
                            <SelectItem value="nova">Nova</SelectItem>
                            <SelectItem value="shimmer">Shimmer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mllm-instructions">Instructions</Label>
                    <Input
                        id="mllm-instructions"
                        value={mllmConfig.params?.instructions || ''}
                        onChange={(e) => setMllmConfig({
                            ...mllmConfig,
                            params: {...mllmConfig.params, instructions: e.target.value}
                        })}
                        placeholder="You are a Conversational AI Agent, developed by Agora."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mllm-greeting">Greeting Message</Label>
                    <Input
                        id="mllm-greeting"
                        value={mllmConfig.greeting_message || ''}
                        onChange={(e) => setMllmConfig({...mllmConfig, greeting_message: e.target.value})}
                        placeholder="Hello, how can I help you today?"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mllm-history">Max History: {mllmConfig.max_history || 20}</Label>
                    <Slider
                        id="mllm-history"
                        min={1}
                        max={50}
                        step={1}
                        value={[mllmConfig.max_history || 20]}
                        onValueChange={(value) => setMllmConfig({...mllmConfig, max_history: value[0]})}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mllm-transcription-language">Transcription Language</Label>
                    <Input
                        id="mllm-transcription-language"
                        value={mllmConfig.params?.input_audio_transcription?.language || 'en'}
                        onChange={(e) => setMllmConfig({
                            ...mllmConfig,
                            params: {
                                ...mllmConfig.params,
                                input_audio_transcription: {
                                    ...mllmConfig.params.input_audio_transcription,
                                    language: e.target.value
                                }
                            }
                        })}
                        placeholder="e.g., en"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mllm-transcription-model">Transcription Model</Label>
                    <Input
                        id="mllm-transcription-model"
                        value={mllmConfig.params?.input_audio_transcription?.model || 'gpt-4o-mini-transcribe'}
                        onChange={(e) => setMllmConfig({
                            ...mllmConfig,
                            params: {
                                ...mllmConfig.params,
                                input_audio_transcription: {
                                    ...mllmConfig.params.input_audio_transcription,
                                    model: e.target.value
                                }
                            }
                        })}
                        placeholder="e.g., gpt-4o-mini-transcribe"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mllm-transcription-prompt">Transcription Prompt</Label>
                    <Input
                        id="mllm-transcription-prompt"
                        value={mllmConfig.params?.input_audio_transcription?.prompt || ''}
                        onChange={(e) => setMllmConfig({
                            ...mllmConfig,
                            params: {
                                ...mllmConfig.params,
                                input_audio_transcription: {
                                    ...mllmConfig.params.input_audio_transcription,
                                    prompt: e.target.value
                                }
                            }
                        })}
                        placeholder="expect words related to real-time engagement"
                    />
                </div>
            </div>
        </div>
    )
}

export default CustomMLLM