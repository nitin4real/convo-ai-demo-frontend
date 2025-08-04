import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { Switch } from "../ui/switch"
import { Slider } from "../ui/slider"

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

const DEFAULT_HEYGEN_AVATAR: HEYGEN_AVATAR = {
    vendor: "heygen",
    enable: false,
    params: {
        api_key: "<heygen_key>",
        quality: "medium",
        agora_uid: "<avatar_rtc_uid>",
        agora_token: "<avatar_rtc_token>",
        avatar_id: "",
        disable_idle_timeout: false,
        activity_idle_timeout: 60
    }
}


interface CustomAvatarProps {
    avatarVendor: string
    avatarConfig: any
    setAvatarVendor: (vendor: string) => void
    setAvatarConfig: (config: any) => void
}

const CustomAvatar = ({ avatarVendor, avatarConfig, setAvatarVendor, setAvatarConfig }: CustomAvatarProps) => {
    const handleAvatarVendorChange = (vendor: string) => {
        setAvatarVendor(vendor)
        const newConfig = vendor === 'akool' ? DEFAULT_AKOOL_AVATAR : DEFAULT_HEYGEN_AVATAR
        setAvatarConfig(newConfig)
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Avatar Configuration</h3>
            
            <div className="space-y-2">
                <Label htmlFor="avatar-vendor">Vendor</Label>
                <Select value={avatarVendor} onValueChange={handleAvatarVendorChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select avatar vendor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="akool">Akool</SelectItem>
                        <SelectItem value="heygen">HeyGen</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="avatar-enable"
                    checked={avatarConfig.enable || false}
                    onCheckedChange={(checked) => setAvatarConfig({...avatarConfig, enable: checked})}
                />
                <Label htmlFor="avatar-enable">Enable Avatar</Label>
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="avatar-key">API Key</Label>
                    <Input
                        id="avatar-key"
                        type="password"
                        value={avatarConfig.params?.api_key || ''}
                        onChange={(e) => setAvatarConfig({
                            ...avatarConfig,
                            params: {...avatarConfig.params, api_key: e.target.value}
                        })}
                        placeholder={`Your ${avatarVendor} API key`}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="avatar-id">Avatar ID</Label>
                    <Input
                        id="avatar-id"
                        value={avatarConfig.params?.avatar_id || ''}
                        onChange={(e) => setAvatarConfig({
                            ...avatarConfig,
                            params: {...avatarConfig.params, avatar_id: e.target.value}
                        })}
                        placeholder="Avatar ID"
                    />
                </div>

                {avatarVendor === 'heygen' && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="heygen-quality">Quality</Label>
                            <Select
                                value={avatarConfig.params?.quality || 'medium'}
                                onValueChange={(value) => setAvatarConfig({
                                    ...avatarConfig,
                                    params: {...avatarConfig.params, quality: value}
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="disable-idle"
                                checked={avatarConfig.params?.disable_idle_timeout || false}
                                onCheckedChange={(checked) => setAvatarConfig({
                                    ...avatarConfig,
                                    params: {...avatarConfig.params, disable_idle_timeout: checked}
                                })}
                            />
                            <Label htmlFor="disable-idle">Disable Idle Timeout</Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="idle-timeout">Activity Idle Timeout: {avatarConfig.params?.activity_idle_timeout || 60}s</Label>
                            <Slider
                                id="idle-timeout"
                                min={10}
                                max={300}
                                step={10}
                                value={[avatarConfig.params?.activity_idle_timeout || 60]}
                                onValueChange={(value) => setAvatarConfig({
                                    ...avatarConfig,
                                    params: {...avatarConfig.params, activity_idle_timeout: value[0]}
                                })}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CustomAvatar 