import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { AdvanceFeatures } from "./CustomAgent"


interface CustomAdvancedProps {
    advancedFeatures: AdvanceFeatures
    setAdvancedFeatures: (features: AdvanceFeatures) => void
}

const CustomAdvanced = ({ 
    advancedFeatures, 
    setAdvancedFeatures 
}: CustomAdvancedProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Features</h3>
            
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="enable-aivad"
                        checked={advancedFeatures.enable_aivad}
                        onCheckedChange={(checked) => setAdvancedFeatures({
                            ...advancedFeatures,
                            enable_aivad: checked
                        })}
                    />
                    <Label htmlFor="enable-aivad">Enable AI VAD</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="enable-rtm"
                        checked={advancedFeatures.enable_rtm}
                        onCheckedChange={(checked) => setAdvancedFeatures({
                            ...advancedFeatures,
                            enable_rtm: checked
                        })}
                    />
                    <Label htmlFor="enable-rtm">Enable RTM</Label>
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    <div><span className="font-bold">Note: </span>MLLM configuration is available in its dedicated tab when "Use MLLM" is enabled. Toggle MLLM from the top.</div>
                </div>
            </div>
        </div>
    )
}

export default CustomAdvanced 