import { Mic, MicOff, Captions, CaptionsOff } from 'lucide-react';
import { Button } from './ui/button';
import { AgoraChannelResponse } from '@/services/agora.rtc.service';
import { AgentTile } from '@/types/agent.types';
import { INBOUND_STATES } from './SIP_Agent_Inbound';

interface ISipInboundControlsProps {
    isJoined: boolean;
    inboundState: INBOUND_STATES;
    channelInfo: AgoraChannelResponse | null;
    agentDetails: AgentTile | null;
    selectedLanguage: string;
    setSelectedLanguage: (value: string) => void;
    showTranscriptions: boolean;
    setShowTranscriptions: (value: boolean) => void;
    joinChannel: () => Promise<void>;
    handleEndConversation: () => Promise<void>;
    toggleMute: () => void;
    isMuted: boolean;
    isMutedRemoteUsers: boolean;
    muteRemoteUsers: () => void;
    unmuteRemoteUsers: () => void;
    handleResetCall: () => void;
}

export const SipInboundControls = (props: ISipInboundControlsProps) => {
    const { isJoined,
        inboundState,
        channelInfo,
        agentDetails,
        selectedLanguage,
        setSelectedLanguage,
        handleResetCall,
        showTranscriptions,
        setShowTranscriptions,
        joinChannel,
        handleEndConversation,
        toggleMute,
        unmuteRemoteUsers,
        isMuted,
        isMutedRemoteUsers,
        muteRemoteUsers } = props;
    return <div className=''>
        <div className="flex flex-col items-center gap-6 p-4">
            <div className="flex flex-col items-center gap-4">
                {inboundState === INBOUND_STATES.ERROR || inboundState === INBOUND_STATES.DISCONNECTED && (
                    <Button
                        onClick={handleResetCall}
                        variant="destructive"
                        size="lg"
                        className="min-w-[200px]"
                    >
                        Reset Call
                    </Button>
                )}
                {isJoined && (
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={async () => {
                                if (isMutedRemoteUsers) {
                                    unmuteRemoteUsers();
                                } else {
                                    muteRemoteUsers();
                                }
                            }}
                            variant={isMutedRemoteUsers ? "destructive" : "outline"}
                            size="lg"
                            className="min-w-[200px]"
                        >
                            {isMutedRemoteUsers ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            {isMutedRemoteUsers ? 'Unmute Remote Users' : 'Mute Remote Users'}
                        </Button>

                        <Button
                            onClick={handleEndConversation}
                            variant="destructive"
                            size="lg"
                            className="min-w-[200px]"
                        >
                            Leave Call
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