import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { Switch } from "../ui/switch"
import { Slider } from "../ui/slider"
import { TURN_DETECTION, PARAMETERS } from "./CustomAgent"


interface CustomDetectionProps {
    enable_mllm: boolean
    turnDetectionConfig: TURN_DETECTION
    parametersConfig: PARAMETERS
    setTurnDetectionConfig: (config: TURN_DETECTION) => void
    setParametersConfig: (config: PARAMETERS) => void
}

const CustomTurnDetection = ({
    enable_mllm,
    turnDetectionConfig,
    parametersConfig,
    setTurnDetectionConfig,
    setParametersConfig
}: CustomDetectionProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Turn Detection & Parameters</h3>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="detection-type">Detection Type</Label>
                    <Select
                        value={turnDetectionConfig.type}
                        onValueChange={(value) => {
                            setTurnDetectionConfig({
                                ...turnDetectionConfig,
                                type: value as 'agora_vad' | 'server_vad' | 'semantic_vad',
                                eagerness: value === 'server_vad' || value === 'semantic_vad' ? 'auto' : turnDetectionConfig.eagerness
                            })
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="agora_vad">Agora VAD</SelectItem>
                            {
                                enable_mllm && (
                                    <>
                                        <SelectItem value="server_vad">Server VAD</SelectItem>
                                        <SelectItem value="semantic_vad">Semantic VAD</SelectItem>
                                    </>
                                )
                            }
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="interrupt-mode">Interrupt Mode</Label>
                    <Select
                        value={turnDetectionConfig.interrupt_mode}
                        onValueChange={(value) => setTurnDetectionConfig({
                            ...turnDetectionConfig,
                            interrupt_mode: value as 'interrupt' | 'append' | 'ignore'
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="interrupt">Interrupt</SelectItem>
                            {
                                !enable_mllm && (
                                    <>
                                        <SelectItem value="append">Append</SelectItem>
                                        <SelectItem value="ignore">Ignore</SelectItem>
                                    </>
                                )
                            }
                        </SelectContent>
                    </Select>
                </div>

                {
                    (turnDetectionConfig.type === 'semantic_vad' || turnDetectionConfig.type === 'server_vad') && (
                        <>

                            <div className="space-y-2">
                                <Label htmlFor="eagerness">Eagerness</Label>
                                <Select
                                    value={turnDetectionConfig.eagerness}
                                    onValueChange={(value) => setTurnDetectionConfig({
                                        ...turnDetectionConfig,
                                        eagerness: value as 'auto' | 'low' | 'high'
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto">Auto</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                {
                    turnDetectionConfig.type !== 'semantic_vad' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="interrupt-duration">Interrupt Duration: {turnDetectionConfig.interrupt_duration_ms}ms</Label>
                                <Slider
                                    id="interrupt-duration"
                                    min={100}
                                    max={5000}
                                    step={100}
                                    value={[turnDetectionConfig.interrupt_duration_ms]}
                                    onValueChange={(value) => setTurnDetectionConfig({
                                        ...turnDetectionConfig,
                                        interrupt_duration_ms: value[0]
                                    })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="silence-duration">Silence Duration: {turnDetectionConfig.silence_duration_ms}ms</Label>
                                <Slider
                                    id="silence-duration"
                                    min={100}
                                    max={3000}
                                    step={100}
                                    value={[turnDetectionConfig.silence_duration_ms]}
                                    onValueChange={(value) => setTurnDetectionConfig({
                                        ...turnDetectionConfig,
                                        silence_duration_ms: value[0]
                                    })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="threshold">Threshold: {turnDetectionConfig.threshold}</Label>
                                <Slider
                                    id="threshold"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={[turnDetectionConfig.threshold]}
                                    onValueChange={(value) => setTurnDetectionConfig({
                                        ...turnDetectionConfig,
                                        threshold: value[0]
                                    })}
                                />
                            </div>

                        </>
                    )
                }
                {
                    turnDetectionConfig.type !== 'agora_vad' && (
                        <>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="create-response"
                                    checked={turnDetectionConfig.create_response || false}
                                    onCheckedChange={(checked) => setTurnDetectionConfig({
                                        ...turnDetectionConfig,
                                        create_response: checked
                                    })}
                                />
                                <Label htmlFor="create-response">Create Response</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="interrupt-response"
                                    checked={turnDetectionConfig.interrupt_response || true}
                                    onCheckedChange={(checked) => setTurnDetectionConfig({
                                        ...turnDetectionConfig,
                                        interrupt_response: checked
                                    })}
                                />
                                <Label htmlFor="interrupt-response">Interrupt Response</Label>
                            </div>
                        </>
                    )
                }

            </div>

            <Separator />

            <h4 className="text-md font-semibold">General Parameters</h4>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="data-channel">Data Channel</Label>
                    <Select
                        value={parametersConfig.data_channel}
                        onValueChange={(value) => setParametersConfig({
                            ...parametersConfig,
                            data_channel: value as 'datastream' | 'rtm'
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="datastream">DataStream</SelectItem>
                            <SelectItem value="rtm">RTM</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="enable-metrics"
                        checked={parametersConfig.enable_metrics}
                        onCheckedChange={(checked) => setParametersConfig({
                            ...parametersConfig,
                            enable_metrics: checked
                        })}
                    />
                    <Label htmlFor="enable-metrics">Enable Metrics</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="enable-error-message"
                        checked={parametersConfig.enable_error_message}
                        onCheckedChange={(checked) => setParametersConfig({
                            ...parametersConfig,
                            enable_error_message: checked
                        })}
                    />
                    <Label htmlFor="enable-error-message">Enable Error Messages</Label>
                </div>

                {
                    !enable_mllm && parametersConfig.silence_config && (
                        <>
                            <Separator />

                            <h4 className="text-md font-semibold">Silence Configuration</h4>

                            <div className="space-y-2">
                                <Label htmlFor="silence-timeout">Silence Timeout: {parametersConfig.silence_config.timeout_ms}ms</Label>
                                <Slider
                                    id="silence-timeout"
                                    min={500}
                                    max={5000}
                                    step={100}
                                    value={[parametersConfig.silence_config.timeout_ms]}
                                    onValueChange={(value) => setParametersConfig({
                                        ...parametersConfig,
                                        silence_config: {
                                            action: 'speak',
                                            content: '',
                                            ...parametersConfig.silence_config,
                                            timeout_ms: value[0]
                                        }
                                    })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="silence-action">Silence Action</Label>
                                <Select
                                    value={parametersConfig.silence_config.action}
                                    onValueChange={(value) => setParametersConfig({
                                        ...parametersConfig,
                                        silence_config: {
                                            timeout_ms: 0,
                                            content: '',
                                            ...parametersConfig.silence_config,
                                            action: value as 'speak' | 'think'
                                        }
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="speak">Speak</SelectItem>
                                        <SelectItem value="think">Think</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="silence-content">Silence Content</Label>
                                <Input
                                    id="silence-content"
                                    value={parametersConfig.silence_config.content}
                                    onChange={(e) => setParametersConfig({
                                        ...parametersConfig,
                                        silence_config: {
                                            timeout_ms: 1000,
                                            action: 'speak',
                                            ...parametersConfig.silence_config,
                                            content: e.target.value
                                        }
                                    })}
                                    placeholder="What to say during silence"
                                />
                            </div>
                        </>
                    )
                }
            </div>

        </div>
    )
}

export default CustomTurnDetection 