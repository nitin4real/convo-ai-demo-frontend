// import AgoraAIRec from '@/assets/agora-rec.svg';
import AgoraAIRec from '@/assets/agora-blue.svg';
import { handleUserErrors } from '@/utils/toast.utils';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { API_CONFIG } from '../config/api.config';
import axios from '../config/axios.config';
import { AgoraChannelResponse, agoraRTCService, RemoteUser } from '../services/agora.rtc.service';
import { AgentTile, IMessage } from '../types/agent.types';

import { MainCardHeader } from './MainCardHeader';
import {  FeedbackDialogRef } from './FeedbackDialog';
import Header from './Header';
import { Card, CardContent} from './ui/card';
import { TranscriptionList } from './TranscriptionList';
import AgoraRTMService from '../services/agora.rtm.services';
import { SipOutboundControls } from './SipOutboundControls';


export enum INBOUND_STATES {
  IDLE = 'IDLE',
  RINGING = 'RINGING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
}

export enum OUTBOUND_STATES {
  IDLE = 'IDLE',
  INITIATED = 'INITIATED',
  RINGING = 'RINGING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  NOT_ANSWERED = 'NOT_ANSWERED',
  ERROR = 'ERROR',
  TRANSFERRED = 'TRANSFERRED',
}


const SIP_Agent: React.FC = () => {
  const { agentId } = useParams();
  const convoAgentId = useRef<string | null>(null);
  const feedbackDialogRef = useRef<FeedbackDialogRef>(null);
  const [channelInfo, setChannelInfo] = useState<AgoraChannelResponse | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isAgentStarted, setIsAgentStarted] = useState(false);
  const [isMutedRemoteUsers, setIsMutedRemoteUsers] = useState(true);
  const [outboundState, setOutboundState] = useState(OUTBOUND_STATES.IDLE);
  // ref for agoraRTMService
  const agoraRTMServiceRef = useRef<AgoraRTMService | null>(null);
  // @ts-ignore
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [agentDetails, setAgentDetails] = useState<AgentTile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<IMessage[]>([]);
  const [showTranscriptions, setShowTranscriptions] = useState(false);
  const lastEventIdRef = useRef<string | null>(null);
  // const selfVideoRef = useRef<any>(null);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agentId) return;

      try {
        const response = await axios.get<AgentTile>(
          API_CONFIG.ENDPOINTS.AGENT.AGENT_DETAILS.replace(':agentId', agentId)
        );
        setAgentDetails(response.data);
        setError(null);
      } catch (err) {
        handleUserErrors(err);
        console.error('Failed to fetch agent details:', err);
        setError('Failed to load agent details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [agentId]);

  useEffect(() => {
    if (channelInfo) {
      const joinChannelFunction = async () => {
        await joinChannel();
      };
      joinChannelFunction();
    }
  }, [channelInfo]);

  useEffect(() => {
    agoraRTCService.setAsSIPAgent(true);
    agoraRTCService.setCallbacks({
      onUserJoined: (user) => {
        console.log('Loggin Service', 'User joined:', user);
        setRemoteUsers(prev => [...prev, user]);
      },
      onUserLeft: (uid) => {
        console.log('Loggin Service', 'User left:', uid);
        setRemoteUsers(prev => prev.filter(user => user.uid !== uid));
      },
      onMessage: (message) => {
        setTranscripts(prev => {
          if (prev.length > 0) {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.turn_id === message.turn_id && lastMessage.speaker === message.speaker) {
              // compare the last message with the new message
              if (lastMessage.transcription === message.transcription) {
                return prev;
              }
              return [...prev.slice(0, -1), message];
            } else {
              // check if the new message is the same as the last message
              if (lastMessage.transcription === message.transcription) {
                return prev;
              }
              return [...prev, message];
            }
          }
          return [...prev, message];
        });
      },
      onUserPublished: () => {

      },
      onUserUnpublished: () => {

      }
    });
  }, []);


  const stopAgent = async () => {
    if (!convoAgentId.current) return;

    try {
      await axios.post(
        `${API_CONFIG.ENDPOINTS.AGENT.STOP}`,
        {}
      );
      console.log('Loggin Service', 'Agent stopped');
      setIsAgentStarted(false);
      // stopHeartbeat();
      convoAgentId.current = null;
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  };

  const joinChannel = async () => {
    if (!channelInfo) return;

    try {
      await agoraRTCService.joinChannel(channelInfo);
      await agoraRTMServiceRef.current?.login();
      //  by default mute self audio
      setIsJoined(true);
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  const leaveChannel = async () => {
    await agoraRTCService.leaveChannel();
    await agoraRTMServiceRef.current?.logout();
    setIsJoined(false);
    setIsAgentStarted(false);
    setRemoteUsers([]);
    // stopHeartbeat();
    convoAgentId.current = null;
    // refresh page
    window.location.reload();
  };

  const toggleMute = () => {
    console.log('Current mute state', isMuted);
    console.log('Toggling mute state', !isMuted);
    agoraRTCService.toggleAudio(isMuted);
    setIsMuted(!isMuted);
  };



  const handleEndConversation = async () => {
    await stopAgent();
    await leaveChannel();
    feedbackDialogRef.current?.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header feedbackDialogRef={feedbackDialogRef} />
        <main className="container mx-auto p-4">
          <div className="flex justify-center items-center h-[50vh]">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">Loading agent details...</div>
              <div className="text-sm text-muted-foreground">Please wait while we fetch the agent information.</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header feedbackDialogRef={feedbackDialogRef} />
        <main className="container mx-auto p-4">
          <div className="flex justify-center items-center h-[50vh]">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2 text-red-600">Error</div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  let grid = '';
  let mainClass = 'max-w-4xl';

  const getBuffer = async () => {
    const response = await axios.get<any>(`${API_CONFIG.ENDPOINTS.AGENT.GET_BUFFER}`);
    if (response?.data?.bufferLogs?.length > 0) {
      // setCallerId(response?.data?.bufferLogs[0]?.callerId);
      const latestEvent = response?.data?.bufferLogs[0];
      console.log('Buffer:', lastEventIdRef.current, latestEvent);
      if (latestEvent?.direction != 'outbound' && latestEvent?.event != 'transfer_call') return;
      if(lastEventIdRef.current === latestEvent?.eventId) return;
      lastEventIdRef.current = latestEvent?.eventId;

      if (latestEvent?.event === 'call_ringing') {
        setOutboundState(OUTBOUND_STATES.RINGING);
      } else if (latestEvent?.event === 'agora_bridge_start' || latestEvent?.event === 'call_answered') {
        // fetch the channel details and connect right away and turn isJoined to true
        setOutboundState(OUTBOUND_STATES.CONNECTED);
        try {
          const channelName = latestEvent?.channel;
          const channelDetails = await agoraRTCService.getChannelInfoForSip(channelName);
          setChannelInfo(channelDetails);
          await joinChannel();
          setIsJoined(true);
        } catch (error) {
          console.error('Failed to get channel info for SIP:', error);
          setOutboundState(OUTBOUND_STATES.ERROR);
          toast.error('Failed to get channel info for SIP. Please try again later.');
        }
      } else if (latestEvent?.event === 'agora_bridge_end' || latestEvent?.event === 'call_hangup'){
        setOutboundState(OUTBOUND_STATES.DISCONNECTED);
        setIsJoined(false);
        toast.success('Call ended');
      } else if (latestEvent?.event === 'transfer_call') {
        setOutboundState(OUTBOUND_STATES.TRANSFERRED);
        toast.success('Call transferred to human agent');
      } else {
        console.log('Buffer:', latestEvent, outboundState);
      }
    }
    // console.log('Buffer:', response.data);
  };

  const startOutboundCall = async (phoneNumber: string) => {
    // setIsStartingOutbound(true);
    // setCallerId(phoneNumber);
    try {
      const request = {
        phoneNumber: phoneNumber,
        agentId: agentId,
        language: selectedLanguage || ""
      };
      setOutboundState(OUTBOUND_STATES.INITIATED);
      try {
        setInterval(() => {
          getBuffer();
        }, 2000);
      } catch (error) {
        console.error('Failed to get buffer:', error);
      }
      const response = await axios.post<any>(
        `${API_CONFIG.ENDPOINTS.AGENT.START_SIP_CALL}`,
        request
      );
      // response.data.tokenData has the info for channel name token for this user, and appid
      if (response.data?.sipCallData) {
        // if not 200 answered then return and set the state to NOT_ANSWERED
        if (response.data?.sipCallData?.success !== true) {
          toast.error('Call not answered. Refresh the page and try again...');
          setOutboundState(OUTBOUND_STATES.NOT_ANSWERED);
          return;
        }
      }
      const info = response.data?.tokenData;
      setChannelInfo(info);
      // agoraRTMServiceRef.current = new AgoraRTMService({
      //   appId: info.appId,
      //   token: info.rtmToken,
      //   channel: info.channelName,
      //   uid: info.uid.toString()
      // });
      // agoraRTMServiceRef.current?.setCallbacks({
      //   onMessage: (message) => {
      //     setMetaData(prev => [...prev, message]);
      //   }
      // }); 
      // await joinChannel();
      toast.success('Outbound call started');
      setOutboundState(OUTBOUND_STATES.CONNECTED);
    }
    catch (error: any) {
      setOutboundState(OUTBOUND_STATES.IDLE);
      console.error('Failed to start outbound call:', error);
    } finally {
      // setIsStartingOutbound(false);
    }
  };

  const muteRemoteUsers = () => {
    agoraRTCService.muteRemoteUsers();
    setIsMutedRemoteUsers(true);
  };

  const unmuteRemoteUsers = () => {
    agoraRTCService.unmuteRemoteUsers();
    setIsMutedRemoteUsers(false);
  };

  const handleResetCall = () => {
    // refresh page
    window.location.reload();
    toast.success('Call reset successful');
  };

  if (showTranscriptions) {
    grid = 'grid grid-cols-2 gap-4 w-[100%]';
    mainClass = 'max-w-[80%] ';
  }

  const sipOutboundControls = () => <SipOutboundControls
    isJoined={isJoined}
    outboundState={outboundState}
    handleResetCall={handleResetCall}
    channelInfo={channelInfo}
    agentDetails={agentDetails}
    isMutedRemoteUsers={isMutedRemoteUsers}
    muteRemoteUsers={muteRemoteUsers}
    unmuteRemoteUsers={unmuteRemoteUsers}
    selectedLanguage={selectedLanguage || ""}
    setSelectedLanguage={setSelectedLanguage}
    showTranscriptions={showTranscriptions}
    setShowTranscriptions={setShowTranscriptions}
    joinChannel={joinChannel}
    initiateCall={async () => {
      const phoneNumber = (document.getElementById('phoneNumber') as HTMLInputElement).value || '';
      if (phoneNumber.length === 11 && phoneNumber.startsWith('0') && !isNaN(Number(phoneNumber))) {
        await startOutboundCall(phoneNumber);
      } else {
        toast.error('Please enter a valid 11-digit phone number with 0 prefix');
      }
    }}
    handleEndConversation={handleEndConversation}
    toggleMute={toggleMute}
    isMuted={isMuted}
  />

  // if (agentDetails?.layout === Layout.SIP_CALL_INBOUND) {
  //   return <div className="min-h-screen bg-background">
  //     <Header feedbackDialogRef={feedbackDialogRef} />
  //     <main className="container mx-auto p-4 w-full h-[90vh] flex flex-col lg:flex-row gap-6">
  //       <Card className="shadow-lg h-full flex-1">
  //         <CardHeader className="border-b">
  //           <CardTitle className="text-2xl">Inbound Calls</CardTitle>
  //         </CardHeader>
  //         <CardContent className="pt-6">
  //           <div className="space-y-4 text-sm leading-relaxed">
  //             <div className="space-y-3">
  //               <p className="font-medium text-foreground">To make an inbound call:</p>
  //               <div className="bg-muted p-4 rounded-lg">
  //                 <p className="font-semibold text-primary mb-2">Dial: 02247790159</p>
  //                 <p className="text-muted-foreground mb-2">You'll be prompted to enter a PIN:</p>
  //                 <ul className="space-y-1 ml-4">
  //                   <li>• Enter <span className="font-mono bg-primary/10 px-2 py-1 rounded">123#</span> (For English)</li>
  //                   <li>• Enter <span className="font-mono bg-primary/10 px-2 py-1 rounded">321#</span> (For Hindi)</li>
  //                 </ul>
  //               </div>
  //               <p className="text-muted-foreground">
  //                 This will connect you to the Agora Conversational AI Agent.
  //               </p>
  //             </div>
  //             <div className="space-y-3">
  //               <p className="font-medium text-foreground">How it works:</p>
  //               <div className="space-y-2 text-muted-foreground">
  //                 <p>• The AI agent will try to resolve the wifi issue</p>
  //                 <p>• If not resolved, it will transfer your call to a human agent</p>
  //                 <p>• You can intervene at any time to initiate a transfer to a human</p>
  //                 <p>• Before transferring, the agent will seek your confirmation</p>
  //                 <p>• The call will be routed to Human Agent</p>
  //               </div>
  //             </div>
  //           </div>
  //         </CardContent>
  //       </Card>

  //       <Card className="shadow-lg h-full flex-1">
  //         <CardHeader className="border-b">
  //           <CardTitle className="text-2xl">Outbound Calls</CardTitle>
  //         </CardHeader>
  //         <CardContent className="pt-6">
  //           <div className="space-y-6">
  //             <div className="space-y-4">
  //               <div className="flex flex-col gap-2">
  //                 <label htmlFor="phoneNumber" className="block text-sm font-bold text-foreground mb-2">
  //                   Phone Number
  //                 </label>
  //                 <Input
  //                   type="tel"
  //                   id="phoneNumber"
  //                   placeholder="Enter 11-digit number with 0 prefix"
  //                   className="max-w-sm"
  //                 />
  //                 <p className="mt-2 text-sm text-muted-foreground">
  //                   Example: 03892372789
  //                 </p>
  //                 {agentDetails?.languages && (
  //                   <Select
  //                     value={selectedLanguage || ""}
  //                     onValueChange={(value) => setSelectedLanguage(value)}
  //                   >
  //                     <SelectTrigger className="w-[200px]">
  //                       <SelectValue placeholder="Select Language" />
  //                     </SelectTrigger>
  //                     <SelectContent>
  //                       {agentDetails.languages.map((lang) => (
  //                         <SelectItem key={lang.isoCode} value={lang.isoCode}>
  //                           {lang.name}
  //                         </SelectItem>
  //                       ))}
  //                     </SelectContent>
  //                   </Select>
  //                 )}
  //               </div>

  //               <Button
  //                 onClick={() => {
  //                   const phoneNumber = (document.getElementById('phoneNumber') as HTMLInputElement).value || '';
  //                   if (phoneNumber.length === 11 && phoneNumber.startsWith('0') && !isNaN(Number(phoneNumber))) {
  //                     startOutboundCall(phoneNumber);
  //                   } else {
  //                     toast.error('Please enter a valid 11-digit phone number with 0 prefix');
  //                   }
  //                 }}
  //                 className="max-w-[200px]"
  //                 disabled={isStartingOutbound}
  //               >
  //                 {isStartingOutbound ? (
  //                   <>
  //                     <Loader2 className="animate-spin" />
  //                     Starting...
  //                   </>
  //                 ) : (
  //                   'Start Outbound Call'
  //                 )}
  //               </Button>
  //             </div>

  //             <div className="bg-muted p-4 rounded-lg">
  //               <p className="text-sm text-muted-foreground">
  //                 This will initiate the call to the number and connect to the Agora Conversational AI Agent. (English Speaking Agent By default). <br />
  //                 You can converse with the agent or request a transfer to a human agent at any point of the conversation. Upon your confirmation, the agent will exit the call and transfer it to Human Agent.
  //               </p>
  //             </div>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </main>
  //   </div>
  // }

  return (
    <div className="min-h-screen bg-background">
      <Header feedbackDialogRef={feedbackDialogRef} />
      <main className={`container mx-auto p-4 ${mainClass} h-[90vh]`}>
        <div className={`${grid} h-full`}>
          <Card className="shadow-lg h-full">
            <MainCardHeader agentDetails={agentDetails} isAgentStarted={isAgentStarted} remainingTime={remainingTime} />
            <CardContent className="pt-8  h-full">
              <div className="space-y-8 h-full flex flex-col justify-between">
                <div className="flex flex-col items-center gap-6">
                  <img src={AgoraAIRec} alt="Agora AI Rec" className="w-54 h-40" />
                  {agentDetails && (
                    <div className="text-center space-y-4 max-w-2xl">
                      <div>
                        <h2 className="text-2xl font-semibold mb-2">{agentDetails.name}</h2>
                        <p className="text-muted-foreground">{agentDetails.description}</p>
                      </div>
                      {agentDetails.features && agentDetails.features.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg">Key Features</h3>
                          <div className="flex flex-wrap justify-center gap-2">
                            {agentDetails.features.map((feature, index) => (
                              <div
                                key={index}
                                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                              >
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-center space-y-2">
                    {outboundState === OUTBOUND_STATES.IDLE && (
                      <p className="text-lg text-muted-foreground">
                        📞 Ready to make a call
                      </p>
                    )}
                    {outboundState === OUTBOUND_STATES.INITIATED && (
                      <p className="text-lg text-primary">
                        🔄 Initiating call...
                      </p>
                    )}
                    {outboundState === OUTBOUND_STATES.RINGING && (
                      <p className="text-lg text-primary animate-pulse">
                        🔔 Ringing...
                      </p>
                    )}
                    {outboundState === OUTBOUND_STATES.CONNECTED && (
                      <p className="text-lg text-green-600">
                        ✅ Call Connected
                      </p>
                    )}
                    {outboundState === OUTBOUND_STATES.NOT_ANSWERED && (
                      <p className="text-lg text-yellow-600">
                        ❌ Call Not Answered
                      </p>
                    )}
                    {outboundState === OUTBOUND_STATES.DISCONNECTED && (
                      <p className="text-lg text-red-600">
                        ❌ Call Ended
                      </p>
                    )}
                    {outboundState === OUTBOUND_STATES.TRANSFERRED && (
                      <p className="text-lg text-primary">
                        🔄 Call Transferred to Human Agent
                      </p>
                    )}
                  </div>
                </div>
                {sipOutboundControls()}
              </div>
            </CardContent>
          </Card>
          {showTranscriptions && (
            <div className="h-full">
              <TranscriptionList
                isSIPAgent={true}
                transcripts={transcripts}
                isVisible={showTranscriptions}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SIP_Agent;
