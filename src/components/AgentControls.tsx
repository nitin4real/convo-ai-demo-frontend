import { Mic, MicOff, Captions, CaptionsOff } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { AgoraChannelResponse } from '@/services/agora.rtc.service';
import { AgentTile } from '@/types/agent.types';
import { IProperties } from './CustomAgent/CustomAgent';

interface IAgentControlProps {
    isJoined: boolean;
    isAgentStarted: boolean;
    channelInfo: AgoraChannelResponse | null;
    agentDetails: AgentTile | null;
    selectedLanguage: string;
    setSelectedLanguage: (value: string) => void;
    customAgentProperties: IProperties | null;
    setCustomAgentProperties: (value: IProperties | null) => void;
    showTranscriptions: boolean;
    setShowTranscriptions: (value: boolean) => void;
    joinChannel: () => Promise<void>;
    startAgent: () => Promise<void>;
    handleEndConversation: () => Promise<void>;
    toggleMute: () => void;
    isMuted: boolean;
}

export const AgentControls = (props: IAgentControlProps) => {
    const { isJoined,
        isAgentStarted,
        channelInfo,
        agentDetails,
        selectedLanguage,
        setSelectedLanguage,
        customAgentProperties,
        setCustomAgentProperties,
        showTranscriptions,
        setShowTranscriptions,
        joinChannel,
        startAgent,
        handleEndConversation,
        toggleMute,
        isMuted } = props;
    return <div className=''>
        <div className="flex flex-col items-center gap-6 p-4">
            <div className="flex flex-col items-center gap-4">
                {!isJoined && !isAgentStarted && channelInfo && (
                    <>
                        {agentDetails?.languages && (
                            <Select
                                value={selectedLanguage || ""}
                                onValueChange={(value) => setSelectedLanguage(value)}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agentDetails.languages.map((lang) => (
                                        <SelectItem key={lang.isoCode} value={lang.isoCode}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <div className="flex items-center gap-2">
                            {agentDetails?.id === 'custom' && customAgentProperties && (
                                <Button
                                    variant="default"
                                    size="lg"
                                    className="min-w-[200px]"
                                    onClick={() => {
                                        setCustomAgentProperties(null);
                                    }}
                                >
                                    Edit Agent Config
                                </Button>
                            )}

                            <Button
                                onClick={async () => {
                                    if (agentDetails?.languages && !selectedLanguage) {
                                        toast.error('Please select a language');
                                        return;
                                    }
                                    await joinChannel();
                                    await startAgent();
                                }}
                                variant="default"
                                size="lg"
                                className="min-w-[200px]"
                            >
                                Start Conversation
                            </Button>
                            <Button
                                title="Transcriptions"
                                onClick={() => setShowTranscriptions(!showTranscriptions)}
                                variant={showTranscriptions ? "destructive" : "outline"}
                                size="lg"
                                className="w-10 h-10"
                            >
                                {showTranscriptions ? <CaptionsOff className="h-6 w-6" /> : <Captions className="h-6 w-6" />}
                            </Button>
                        </div>
                    </>
                )}
                {isJoined && (
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleEndConversation}
                            variant="destructive"
                            size="lg"
                            className="min-w-[200px]"
                        >
                            End Conversation
                        </Button>
                        <Button
                            title="Transcriptions"
                            onClick={() => setShowTranscriptions(!showTranscriptions)}
                            variant={showTranscriptions ? "destructive" : "outline"}
                            size="lg"
                            className="w-10 h-10"
                        >
                            {showTranscriptions ? <CaptionsOff className="h-6 w-6" /> : <Captions className="h-6 w-6" />}
                        </Button>
                        {isJoined && <Button
                            onClick={toggleMute}
                            variant={isMuted ? "destructive" : "outline"}
                            size="lg"
                            className="w-10 h-10"
                        >
                            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>}
                    </div>
                )}
            </div>
        </div>
    </div>
}