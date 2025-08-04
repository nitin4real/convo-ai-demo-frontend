import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { Slider } from "../ui/slider"
import { Textarea } from "../ui/textarea"

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

const DEFAULT_GOOGLE_LLM: GOOGLE_LLM = {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=<api_key>',
    system_messages: [{ role: 'system', content: 'You are a helpful chatbot.' }],
    greeting_message: 'Hello, how can I help you today?',
    failure_message: 'I\'m sorry, I\'m having trouble processing your request. Please try again.',
    max_history: 32,
    params: {
        model: 'gemini-2.0-flash-001',
    },
    style: 'gemini'
}

const DEFAULT_ANTHROPIC_LLM: ANTHROPIC_LLM = {
    url: 'https://api.anthropic.com/v1/messages',
    api_key: '<YOUR_KEY>',
    headers: '{"anthropic-version":"2023-06-01"}',
    system_messages: [{ role: 'system', content: 'You are a helpful chatbot.' }],
    greeting_message: 'Hello, how can I help you today?',
    failure_message: 'Hold on a second.',
    max_history: 32,
    params: {
        model: 'claude-3-5-haiku-latest',
        max_tokens: 1024
    },
    style: 'anthropic'
}

const DEFAULT_DIFY_LLM: DIFY_LLM = {
    url: 'https://qv90***.ai-plugin.io/convoai-start',
    api_key: '<YOUR_KEY>',
    system_messages: [{ role: 'system', content: 'You are a helpful chatbot.' }],
    greeting_message: 'Hello, how can I help you today?',
    failure_message: 'Hold on a second.',
    max_history: 32,
    params: {
        model: 'default'
    },
    style: 'dify'
}


interface CustomLLMProps {
    llmType: string
    llmConfig: any
    setLlmType: (type: string) => void
    setLlmConfig: (config: any) => void
}

const CustomLLM = ({ llmType, llmConfig, setLlmType, setLlmConfig }: CustomLLMProps) => {
    const handleLlmTypeChange = (type: string) => {
        setLlmType(type)
        let newConfig
        switch (type) {
            case 'openai':
                newConfig = DEFAULT_OPENAI_LLM
                break
            case 'google':
            case 'gemini':
                newConfig = DEFAULT_GOOGLE_LLM
                break
            case 'anthropic':
                newConfig = DEFAULT_ANTHROPIC_LLM
                break
            case 'dify':
                newConfig = DEFAULT_DIFY_LLM
                break
            default:
                newConfig = DEFAULT_OPENAI_LLM
        }
        setLlmConfig(newConfig)
    }

    const systemMessage = llmConfig?.system_messages?.map((message: any) => message.content).join('\n') || ''

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Large Language Model (LLM)</h3>
            
            <div className="space-y-2">
                <Label htmlFor="llm-type">Provider</Label>
                <Select value={llmType} onValueChange={handleLlmTypeChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select LLM provider" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="google">Google Gemini</SelectItem>
                        <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                        <SelectItem value="dify">Dify</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="llm-greeting">Greeting Message</Label>
                    <Input
                        id="llm-greeting"
                        value={llmConfig.greeting_message || ''}
                        onChange={(e) => setLlmConfig({...llmConfig, greeting_message: e.target.value})}
                        placeholder="Hello, how can I help you today?"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="llm-system-messages">System Messages</Label>
                    <Textarea
                        id="llm-system-messages"
                        value={systemMessage}
                        onChange={(e) => {
                            setLlmConfig({...llmConfig, system_messages: [{ role: 'system', content: e.target.value }]})
                        }}
                        placeholder="You are a helpful chatbot."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="llm-failure">Failure Message</Label>
                    <Input
                        id="llm-failure"
                        value={llmConfig.failure_message || ''}
                        onChange={(e) => setLlmConfig({...llmConfig, failure_message: e.target.value})}
                        placeholder="Hold on a second."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="llm-history">Max History: {llmConfig.max_history || 32}</Label>
                    <Slider
                        id="llm-history"
                        min={1}
                        max={50}
                        step={1}
                        value={[llmConfig.max_history || 32]}
                        onValueChange={(value) => setLlmConfig({...llmConfig, max_history: value[0]})}
                    />
                </div>

                {(llmType === 'openai' || llmType === 'anthropic' || llmType === 'dify') && (
                    <div className="space-y-2">
                        <Label htmlFor="llm-key">API Key</Label>
                        <Input
                            id="llm-key"
                            type="password"
                            value={llmConfig.api_key || ''}
                            onChange={(e) => setLlmConfig({...llmConfig, api_key: e.target.value})}
                            placeholder="Your API key"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="llm-model">Model</Label>
                    <Input
                        id="llm-model"
                        value={llmConfig.params?.model || ''}
                        onChange={(e) => setLlmConfig({
                            ...llmConfig,
                            params: {...llmConfig.params, model: e.target.value}
                        })}
                        placeholder="Model name"
                    />
                </div>
            </div>
        </div>
    )
}

export default CustomLLM