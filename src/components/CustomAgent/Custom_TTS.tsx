import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { Slider } from "../ui/slider"

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

const DEFAULT_ELEVENLABS_TTS: ELEVENLABS_TTS = {
    vendor: 'elevenlabs',
    params: {
        key: '<YOUR_KEY>',
        model_id: 'eleven_flash_v2_5',
        voice_id: 'pNInz6obpgDQGcFmaJgB',
        sample_rate: 24000,
        speed: 1.0
    }
}

const DEFAULT_CARTESIA_TTS: CARTESIA_TTS = {
    vendor: "cartesia",
    params: {
        api_key: "<your_cartesia_key>",
        model_id: "sonic-2",
        voice: {
            mode: "id",
            id: "<voice_id>"
        }
    }
}

const DEFAULT_OPENAI_TTS: OPENAI_TTS = {
    vendor: 'openai',
    params: {
        api_key: '<YOUR_KEY>',
        model: 'gpt-4o-mini-tts',
        voice: 'coral',
        instructions: 'Please use standard American English, natural tone, moderate pace, and steady intonation',
        speed: 1.0
    }
}

const DEFAULT_HUEMAI_TTS: HUEMAI_TTS = {
    vendor: 'humeai',
    params: {
        key: '<YOUR_KEY>',
        voice_id: '<YOUR_VOICE_ID>',
        provider: 'CUSTOM_VOICE',
        speed: 1.0,
        trailing_silence: 0.35
    }
}

interface CustomTTSProps {
    ttsVendor: string
    ttsConfig: any
    setTtsVendor: (vendor: string) => void
    setTtsConfig: (config: any) => void
}

const CustomTTS = ({ ttsVendor, ttsConfig, setTtsVendor, setTtsConfig }: CustomTTSProps) => {
    const handleTtsVendorChange = (vendor: string) => {
        setTtsVendor(vendor)
        let newConfig
        switch (vendor) {
            case 'microsoft':
                newConfig = DEFAULT_MICROSOFT_TTS
                break
            case 'elevenlabs':
                newConfig = DEFAULT_ELEVENLABS_TTS
                break
            case 'cartesia':
                newConfig = DEFAULT_CARTESIA_TTS
                break
            case 'openai':
                newConfig = DEFAULT_OPENAI_TTS
                break
            case 'humeai':
                newConfig = DEFAULT_HUEMAI_TTS
                break
            default:
                newConfig = DEFAULT_MICROSOFT_TTS
        }
        setTtsConfig(newConfig)
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Text-to-Speech (TTS)</h3>
            
            <div className="space-y-2">
                <Label htmlFor="tts-vendor">Vendor</Label>
                <Select value={ttsVendor} onValueChange={handleTtsVendorChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select TTS vendor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="microsoft">Microsoft</SelectItem>
                        <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                        <SelectItem value="cartesia">Cartesia</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="humeai">Hume AI</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            {ttsVendor === 'microsoft' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="microsoft-tts-key">API Key</Label>
                        <Input
                            id="microsoft-tts-key"
                            type="password"
                            value={ttsConfig.params?.key || ''}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, key: e.target.value}
                            })}
                            placeholder="Your Microsoft API key"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="microsoft-tts-region">Region</Label>
                        <Input
                            id="microsoft-tts-region"
                            value={ttsConfig.params?.region || 'eastus'}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, region: e.target.value}
                            })}
                            placeholder="e.g., eastus"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="microsoft-voice">Voice Name</Label>
                        <Input
                            id="microsoft-voice"
                            value={ttsConfig.params?.voice_name || ''}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, voice_name: e.target.value}
                            })}
                            placeholder="e.g., en-US-AndrewMultilingualNeural"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="microsoft-speed">Speed: {ttsConfig.params?.speed || 1.0}</Label>
                        <Slider
                            id="microsoft-speed"
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            value={[ttsConfig.params?.speed || 1.0]}
                            onValueChange={(value) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, speed: value[0]}
                            })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="microsoft-volume">Volume: {ttsConfig.params?.volume || 70}</Label>
                        <Slider
                            id="microsoft-volume"
                            min={0}
                            max={100}
                            step={1}
                            value={[ttsConfig.params?.volume || 70]}
                            onValueChange={(value) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, volume: value[0]}
                            })}
                        />
                    </div>
                </div>
            )}

            {ttsVendor === 'elevenlabs' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="elevenlabs-key">API Key</Label>
                        <Input
                            id="elevenlabs-key"
                            type="password"
                            value={ttsConfig.params?.key || ''}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, key: e.target.value}
                            })}
                            placeholder="Your ElevenLabs API key"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="elevenlabs-model">Model ID</Label>
                        <Input
                            id="elevenlabs-model"
                            value={ttsConfig.params?.model_id || 'eleven_flash_v2_5'}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, model_id: e.target.value}
                            })}
                            placeholder="e.g., eleven_flash_v2_5"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="elevenlabs-voice">Voice ID</Label>
                        <Input
                            id="elevenlabs-voice"
                            value={ttsConfig.params?.voice_id || ''}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, voice_id: e.target.value}
                            })}
                            placeholder="Voice ID"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="elevenlabs-speed">Speed: {ttsConfig.params?.speed || 1.0}</Label>
                        <Slider
                            id="elevenlabs-speed"
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            value={[ttsConfig.params?.speed || 1.0]}
                            onValueChange={(value) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, speed: value[0]}
                            })}
                        />
                    </div>
                </div>
            )}

            {ttsVendor === 'openai' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="openai-tts-key">API Key</Label>
                        <Input
                            id="openai-tts-key"
                            type="password"
                            value={ttsConfig.params?.api_key || ''}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, api_key: e.target.value}
                            })}
                            placeholder="Your OpenAI API key"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="openai-tts-model">Model</Label>
                        <Input
                            id="openai-tts-model"
                            value={ttsConfig.params?.model || 'gpt-4o-mini-tts'}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, model: e.target.value}
                            })}
                            placeholder="e.g., gpt-4o-mini-tts"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="openai-tts-voice">Voice</Label>
                        <Select
                            value={ttsConfig.params?.voice || 'coral'}
                            onValueChange={(value) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, voice: value}
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
                        <Label htmlFor="openai-tts-speed">Speed: {ttsConfig.params?.speed || 1.0}</Label>
                        <Slider
                            id="openai-tts-speed"
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            value={[ttsConfig.params?.speed || 1.0]}
                            onValueChange={(value) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, speed: value[0]}
                            })}
                        />
                    </div>
                </div>
            )}

            {ttsVendor === 'cartesia' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cartesia-key">API Key</Label>
                        <Input
                            id="cartesia-key"
                            type="password"
                            value={ttsConfig.params?.api_key || ''}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, api_key: e.target.value}
                            })}
                            placeholder="Your Cartesia API key"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cartesia-model">Model ID</Label>
                        <Input
                            id="cartesia-model"
                            value={ttsConfig.params?.model_id || 'sonic-2'}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, model_id: e.target.value}
                            })}
                            placeholder="e.g., sonic-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cartesia-voice">Voice ID</Label>
                        <Input
                            id="cartesia-voice"
                            value={ttsConfig.params?.voice?.id || ''}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {
                                    ...ttsConfig.params,
                                    voice: {
                                        mode: "id",
                                        id: e.target.value
                                    }
                                }
                            })}
                            placeholder="Voice ID"
                        />
                    </div>
                </div>
            )}

            {ttsVendor === 'humeai' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="humeai-key">API Key</Label>
                        <Input
                            id="humeai-key"
                            type="password"
                            value={ttsConfig.params?.key || ''}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, key: e.target.value}
                            })}
                            placeholder="Your Hume AI API key"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="humeai-voice">Voice ID</Label>
                        <Input
                            id="humeai-voice"
                            value={ttsConfig.params?.voice_id || ''}
                            onChange={(e) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, voice_id: e.target.value}
                            })}
                            placeholder="Voice ID"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="humeai-provider">Provider</Label>
                        <Select
                            value={ttsConfig.params?.provider || 'CUSTOM_VOICE'}
                            onValueChange={(value) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, provider: value}
                            })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HUME_AI">Hume AI</SelectItem>
                                <SelectItem value="CUSTOM_VOICE">Custom Voice</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="humeai-speed">Speed: {ttsConfig.params?.speed || 1.0}</Label>
                        <Slider
                            id="humeai-speed"
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            value={[ttsConfig.params?.speed || 1.0]}
                            onValueChange={(value) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, speed: value[0]}
                            })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="humeai-silence">Trailing Silence: {ttsConfig.params?.trailing_silence || 0.35}s</Label>
                        <Slider
                            id="humeai-silence"
                            min={0}
                            max={2}
                            step={0.05}
                            value={[ttsConfig.params?.trailing_silence || 0.35]}
                            onValueChange={(value) => setTtsConfig({
                                ...ttsConfig,
                                params: {...ttsConfig.params, trailing_silence: value[0]}
                            })}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomTTS