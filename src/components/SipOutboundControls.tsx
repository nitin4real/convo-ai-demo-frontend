import { Mic, MicOff, Captions, CaptionsOff } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { AgoraChannelResponse } from '@/services/agora.rtc.service';
import { AgentTile } from '@/types/agent.types';
import { Input } from './ui/input';
import { OUTBOUND_STATES } from './SIP_Agent_Outbound';

interface ISipOutboundControlsProps {
    isJoined: boolean;
    outboundState: OUTBOUND_STATES;
    channelInfo: AgoraChannelResponse | null;
    agentDetails: AgentTile | null;
    selectedLanguage: string;
    setSelectedLanguage: (value: string) => void;
    showTranscriptions: boolean;
    setShowTranscriptions: (value: boolean) => void;
    joinChannel: () => Promise<void>;
    initiateCall: () => Promise<void>;
    handleEndConversation: () => Promise<void>;
    toggleMute: () => void;
    isMuted: boolean;
    isMutedRemoteUsers: boolean;
    muteRemoteUsers: () => void;
    unmuteRemoteUsers: () => void;
}

export const SipOutboundControls = (props: ISipOutboundControlsProps) => {
    const { isJoined,
        outboundState,
        agentDetails,
        selectedLanguage,
        setSelectedLanguage,
        showTranscriptions,
        setShowTranscriptions,
        initiateCall,
        handleEndConversation,
        toggleMute,
        unmuteRemoteUsers,
        isMuted,
        isMutedRemoteUsers,
        muteRemoteUsers } = props;
    return <div className=''>
        <div className="flex flex-col items-center gap-6 p-4">
            <div className="flex flex-col items-center gap-4">
                {!isJoined && (
                    <>
                        {
                            outboundState === OUTBOUND_STATES.IDLE && (
                                <>
                                    <Input
                                        type="tel"
                                        id="phoneNumber"
                                        placeholder="Enter 11-digit number with 0 prefix"
                                        className="max-w-sm"
                                    />
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
                                </>
                            )
                        }

                        {/* control buttons for initiate call or join call based on outbound state */}
                        <div className="flex items-center gap-2">
                            {outboundState === OUTBOUND_STATES.IDLE ? (
                                <Button
                                    onClick={async () => {
                                        if (agentDetails?.languages && !selectedLanguage) {
                                            toast.error('Please select a language');
                                            return;
                                        }
                                        // show loader :TODO
                                        await initiateCall();
                                    }}
                                    variant="default"
                                    size="lg"
                                    className="min-w-[200px]"
                                >
                                    Initiate Call
                                </Button>)
                                : 
                                <></>
                                // (
                                //     <Button
                                //         onClick={async () => {
                                //             if (agentDetails?.languages && !selectedLanguage) {
                                //                 toast.error('Please select a language');
                                //                 return;
                                //             }
                                //             await joinChannel();
                                //         }}
                                //         variant="default"
                                //         size="lg"
                                //         className="min-w-[200px]"
                                //     >
                                //         Join Call
                                //     </Button>
                                // )
                                }
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