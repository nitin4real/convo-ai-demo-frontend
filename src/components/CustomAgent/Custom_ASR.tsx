import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"

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


const DEFAULT_ARES_ASR: ARES_ASR_PARAMS = {
    vendor: 'ares',
    language: 'en-US',
}

const DEFAULT_DEEPGRAM_ASR: DEEPGRAM_ASR_PARAMS = {
    vendor: 'deepgram',
    params: {
        url: '<YOUR_URL>',
        key: '<YOUR_KEY>',
        model: 'nova-2',
        language: 'en',
    }
}

const DEFAULT_MICROSOFT_ASR: MICROSOFT_ASR = {
    vendor: 'microsoft',
    params: {
        key: '<YOUR_KEY>',
        region: 'eastus',
        language: 'en-US',
        phrase_list: ["agora", "conversational", "ai", "engine"],
    }
}

interface CustomASRProps {
    asrVendor: string
    asrConfig: any
    setAsrVendor: (vendor: string) => void
    setAsrConfig: (config: any) => void
}

const CustomASR = ({ asrVendor, asrConfig, setAsrVendor, setAsrConfig }: CustomASRProps) => {
    const handleAsrVendorChange = (vendor: string) => {
        setAsrVendor(vendor)
        let newConfig
        switch (vendor) {
            case 'ares':
                newConfig = DEFAULT_ARES_ASR
                break
            case 'deepgram':
                newConfig = DEFAULT_DEEPGRAM_ASR
                break
            case 'microsoft':
                newConfig = DEFAULT_MICROSOFT_ASR
                break
            default:
                newConfig = DEFAULT_ARES_ASR
        }
        setAsrConfig(newConfig)
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Automatic Speech Recognition (ASR)</h3>
            
            <div className="space-y-2">
                <Label htmlFor="asr-vendor">Vendor</Label>
                <Select value={asrVendor} onValueChange={handleAsrVendorChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select ASR vendor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ares">Ares</SelectItem>
                        <SelectItem value="deepgram">Deepgram</SelectItem>
                        <SelectItem value="microsoft">Microsoft</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            {asrVendor === 'ares' && (
                <div className="space-y-2">
                    <Label htmlFor="asr-language">Language</Label>
                    <Input
                        id="asr-language"
                        value={asrConfig.language || 'en-US'}
                        onChange={(e) => setAsrConfig({...asrConfig, language: e.target.value})}
                        placeholder="e.g., en-US"
                    />
                </div>
            )}

            {asrVendor === 'deepgram' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="deepgram-url">URL</Label>
                        <Input
                            id="deepgram-url"
                            value={asrConfig.params?.url || ''}
                            onChange={(e) => setAsrConfig({
                                ...asrConfig,
                                params: {...asrConfig.params, url: e.target.value}
                            })}
                            placeholder="Deepgram URL"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deepgram-key">API Key</Label>
                        <Input
                            id="deepgram-key"
                            type="password"
                            value={asrConfig.params?.key || ''}
                            onChange={(e) => setAsrConfig({
                                ...asrConfig,
                                params: {...asrConfig.params, key: e.target.value}
                            })}
                            placeholder="Your Deepgram API key"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deepgram-model">Model</Label>
                        <Input
                            id="deepgram-model"
                            value={asrConfig.params?.model || 'nova-2'}
                            onChange={(e) => setAsrConfig({
                                ...asrConfig,
                                params: {...asrConfig.params, model: e.target.value}
                            })}
                            placeholder="e.g., nova-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deepgram-language">Language</Label>
                        <Input
                            id="deepgram-language"
                            value={asrConfig.params?.language || 'en'}
                            onChange={(e) => setAsrConfig({
                                ...asrConfig,
                                params: {...asrConfig.params, language: e.target.value}
                            })}
                            placeholder="e.g., en"
                        />
                    </div>
                </div>
            )}

            {asrVendor === 'microsoft' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="microsoft-key">API Key</Label>
                        <Input
                            id="microsoft-key"
                            type="password"
                            value={asrConfig.params?.key || ''}
                            onChange={(e) => setAsrConfig({
                                ...asrConfig,
                                params: {...asrConfig.params, key: e.target.value}
                            })}
                            placeholder="Your Microsoft API key"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="microsoft-region">Region</Label>
                        <Input
                            id="microsoft-region"
                            value={asrConfig.params?.region || 'eastus'}
                            onChange={(e) => setAsrConfig({
                                ...asrConfig,
                                params: {...asrConfig.params, region: e.target.value}
                            })}
                            placeholder="e.g., eastus"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="microsoft-language">Language</Label>
                        <Input
                            id="microsoft-language"
                            value={asrConfig.params?.language || 'en-US'}
                            onChange={(e) => setAsrConfig({
                                ...asrConfig,
                                params: {...asrConfig.params, language: e.target.value}
                            })}
                            placeholder="e.g., en-US"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomASR