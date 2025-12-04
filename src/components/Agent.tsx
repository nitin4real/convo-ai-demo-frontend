// import AgoraAIRec from '@/assets/agora-rec.svg';
import AgoraAIRec from '@/assets/agora-blue.svg';
import { handleUserErrors } from '@/utils/toast.utils';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { API_CONFIG } from '../config/api.config';
import axios from '../config/axios.config';
import { AgoraChannelResponse, agoraRTCService, RemoteUser } from '../services/agora.rtc.service';
import { AgentTile, IMessage, StartAgentRequest, StartAgentResponse } from '../types/agent.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import { MainCardHeader } from './MainCardHeader';
import { FeedbackDialog, FeedbackDialogRef } from './FeedbackDialog';
import Header from './Header';
import { PlatformUsageDialog, PlatformUsageDialogRef } from './PlatformUsageDialog';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { TranscriptionList } from './TranscriptionList';
import AgoraRTMService from '../services/agora.rtm.services';
import { MetaDataView } from './MetaDataView';
import { Layout } from '@/types/agent.types';
import CustomAgent, { IProperties } from './CustomAgent/CustomAgent';
import { AgentControls } from './AgentControls';
import { MetricList } from './MetricList';
import { IMetricMessage } from '../types/agent.types';

const Agent: React.FC = () => {
  const { agentId } = useParams();
  const convoAgentId = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackDialogRef = useRef<FeedbackDialogRef>(null);
  const platformUsageDialogRef = useRef<PlatformUsageDialogRef>(null);
  const [channelInfo, setChannelInfo] = useState<AgoraChannelResponse | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAgentStarted, setIsAgentStarted] = useState(false);
  // ref for agoraRTMService
  const agoraRTMServiceRef = useRef<AgoraRTMService | null>(null);
  const [metaData, setMetaData] = useState<any[]>([]);
  // @ts-ignore
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [agentDetails, setAgentDetails] = useState<AgentTile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [transcripts, setTranscripts] = useState<IMessage[]>([]);
  const [showTranscriptions, setShowTranscriptions] = useState(false);
  const [metrics, setMetrics] = useState<IMetricMessage[]>([]);
  const [showMetrics, setShowMetrics] = useState(false);
  const [customAgentProperties, setCustomAgentProperties] = useState<IProperties | null>(null);
  const videoRef = useRef<any>(null);
  // const selfVideoRef = useRef<any>(null);
  const [isStartingOutbound, setIsStartingOutbound] = useState(false);

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

  const sendHeartbeat = async () => {
    if (!convoAgentId.current) return;

    try {
      const response = await axios.post<{ status: string; secondsRemaining: number }>(
        `${API_CONFIG.ENDPOINTS.AGENT.HEARTBEAT}/${convoAgentId.current}`,
        {}
      );
      setRemainingTime(response.data.secondsRemaining);
    } catch (error: any) {
      handleUserErrors(error);
      if (error?.response?.status === 440) {
        handleTimeout();
      } else {
        console.error('Failed to send heartbeat', error);
      }
    }
  };

  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    sendHeartbeat();
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 8000);

    // Update timer every second
    timerIntervalRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setRemainingTime(null);
  };

  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, []);

  useEffect(() => {
    const initializeChannel = async () => {
      try {
        const info = await agoraRTCService.getChannelInfo(agentId || '');
        setChannelInfo(info);
        agoraRTMServiceRef.current = new AgoraRTMService({
          appId: info.appId,
          token: info.rtmToken,
          channel: info.channelName,
          uid: info.uid.toString()
        });
        agoraRTMServiceRef.current?.setCallbacks({
          onMessage: (message) => {
            setMetaData(prev => [...prev, message]);
          }
        });
      } catch (error) {
        console.error('Failed to get channel info:', error);
      }
    };

    if (agentId) {
      initializeChannel();
    }

    return () => {
      leaveChannel();
    };
  }, [agentId]);

  useEffect(() => {
    agoraRTCService.setCallbacks({
      onUserJoined: (user) => {
        console.log('Loggin Service', 'User joined:', user);
        setRemoteUsers(prev => [...prev, user]);
      },
      onUserLeft: (uid) => {
        console.log('Loggin Service', 'User left:', uid);
        setRemoteUsers(prev => prev.filter(user => user.uid !== uid));
      },
      onMetric: (metric) => {
        setMetrics(prev => [...prev, metric]);
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
      onUserPublished: (user, mediaType) => {
        if (mediaType === 'video') {
          user.videoTrack?.play(videoRef.current!);
        }
      },
      onUserUnpublished: (user) => {
        if (user.videoTrack) {
          user.videoTrack.stop();
        }
      }
    });
  }, []);

  const startAgent = async () => {
    if (!agentId || !channelInfo) return;

    try {
      if (agentDetails?.id === 'custom' && customAgentProperties) {
        const response = await axios.post<StartAgentResponse>(
          `${API_CONFIG.ENDPOINTS.AGENT.START}/${agentId}`,
          {
            properties: customAgentProperties,
            channelName: channelInfo.channelName,
          }
        );
        convoAgentId.current = response.data.agent_id;
        console.log('Loggin Service', 'Agent started:', response.data);
      } else {
        const request: StartAgentRequest = {
          channelName: channelInfo.channelName,
          languageCode: selectedLanguage || ""
        };
        const response = await axios.post<StartAgentResponse>(
          `${API_CONFIG.ENDPOINTS.AGENT.START}/${agentId}`,
          request
        );
        convoAgentId.current = response.data.agent_id;
        console.log('Loggin Service', 'Agent started:', response.data);
      }
      toast.success('Conversation started');
      setIsAgentStarted(true);
      startHeartbeat();
    } catch (error: any) {
      handleUserErrors(error);
      if (error?.response?.status === 440) {
        handleTimeout();
      } else {
        console.error('Failed to start agent:', error);
      }
    }
  };

  const stopAgent = async () => {
    if (!convoAgentId.current) return;

    try {
      await axios.post(
        `${API_CONFIG.ENDPOINTS.AGENT.STOP}`,
        {}
      );
      console.log('Loggin Service', 'Agent stopped');
      setIsAgentStarted(false);
      stopHeartbeat();
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
      // const localVideoTrack = agoraRTCService.getLocalVideoTrack();
      // if (localVideoTrack) {
      //   console.log('Playing local video track', localVideoTrack);
      //   localVideoTrack.play(selfVideoRef.current!);
      //   console.log('Local video track played', selfVideoRef.current);
      // }
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
    setMetrics([]);
    stopHeartbeat();
    convoAgentId.current = null;
  };

  const toggleMute = () => {
    console.log('Current mute state', isMuted);
    console.log('Toggling mute state', !isMuted);
    agoraRTCService.toggleAudio(isMuted);
    setIsMuted(!isMuted);
  };

  const handleTimeout = () => {
    console.log('Session expired, stopping heartbeat');
    stopHeartbeat();
    leaveChannel();
    setIsAgentStarted(false);
    convoAgentId.current = null;
    platformUsageDialogRef.current?.open();
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

  const startOutboundCall = async (phoneNumber: string) => {
    setIsStartingOutbound(true);
    try {
      const request = {
        phoneNumber: phoneNumber,
        agentId: agentId,
        language: selectedLanguage || ""
      };
      const response = await axios.post<StartAgentResponse>(
        `${API_CONFIG.ENDPOINTS.AGENT.START_SIP_CALL}`,
        request
      );
      console.log('Loggin Service', 'Outbound call started:', response.data);
      toast.success('Outbound call started');
    }
    catch (error: any) {
      console.error('Failed to start outbound call:', error);
    } finally {
      setIsStartingOutbound(false);
    }
  };

  if (agentDetails?.id === 'custom' && !customAgentProperties) {
    return <div className="min-h-screen bg-background">
      <Header feedbackDialogRef={feedbackDialogRef} />

      <CustomAgent
        onCreateAgent={(agent: IProperties) => {
          setCustomAgentProperties(agent);
          console.log('Creating agent', agent);
        }}
      />
    </div>
  }

  if (showTranscriptions && (agentDetails?.layout === Layout.METADATA_TRANSCRIPT || agentDetails?.layout === Layout.AVATAR_TRANSCRIPT)) {
    grid = 'grid grid-cols-3 gap-4 w-[100%]';
    mainClass = 'max-w-[90%] ';
  } else if (showTranscriptions || (agentDetails?.layout === Layout.METADATA_TRANSCRIPT || agentDetails?.layout === Layout.AVATAR_TRANSCRIPT)) {
    grid = 'grid grid-cols-2 gap-4 w-[100%]';
    mainClass = 'max-w-[70%] ';
  }

  // const SelfView = () => <div className=''>
  //   <video ref={selfVideoRef} autoPlay className="w-full h-full object-cover rounded-lg" />
  // </div>

  const agentControls = () => <AgentControls
    isJoined={isJoined}
    isAgentStarted={isAgentStarted}
    channelInfo={channelInfo}
    agentDetails={agentDetails}
    selectedLanguage={selectedLanguage || ""}
    setSelectedLanguage={setSelectedLanguage}
    customAgentProperties={customAgentProperties}
    setCustomAgentProperties={setCustomAgentProperties}
    showTranscriptions={showTranscriptions}
    setShowTranscriptions={setShowTranscriptions}
    showMetrics={showMetrics}
    setShowMetrics={setShowMetrics}
    joinChannel={joinChannel}
    startAgent={startAgent}
    handleEndConversation={handleEndConversation}
    toggleMute={toggleMute}
    isMuted={isMuted}
  />

  if (agentDetails?.layout === Layout.SIP_CALL_INBOUND) {
    return <div className="min-h-screen bg-background">
      <Header feedbackDialogRef={feedbackDialogRef} />
      <main className="container mx-auto p-4 w-full h-[90vh] flex flex-col lg:flex-row gap-6">
        <Card className="shadow-lg h-full flex-1">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">Inbound Calls</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="space-y-3">
                <p className="font-medium text-foreground">To make an inbound call:</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-semibold text-primary mb-2">Dial: 02247790159</p>
                  <p className="text-muted-foreground mb-2">You'll be prompted to enter a PIN:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Enter <span className="font-mono bg-primary/10 px-2 py-1 rounded">123#</span> (For English)</li>
                    <li>• Enter <span className="font-mono bg-primary/10 px-2 py-1 rounded">321#</span> (For Hindi)</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  This will connect you to the Agora Conversational AI Agent.
                </p>
              </div>
              <div className="space-y-3">
                <p className="font-medium text-foreground">How it works:</p>
                <div className="space-y-2 text-muted-foreground">
                  <p>• The AI agent will try to resolve the wifi issue</p>
                  <p>• If not resolved, it will transfer your call to a human agent</p>
                  <p>• You can intervene at any time to initiate a transfer to a human</p>
                  <p>• Before transferring, the agent will seek your confirmation</p>
                  <p>• The call will be routed to Human Agent</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg h-full flex-1">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">Outbound Calls</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="phoneNumber" className="block text-sm font-bold text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    id="phoneNumber"
                    placeholder="Enter 11-digit number with 0 prefix"
                    className="max-w-sm"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Example: 03892372789
                  </p>
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
                </div>

                <Button
                  onClick={() => {
                    const phoneNumber = (document.getElementById('phoneNumber') as HTMLInputElement).value || '';
                    if (phoneNumber.length === 11 && phoneNumber.startsWith('0') && !isNaN(Number(phoneNumber))) {
                      startOutboundCall(phoneNumber);
                    } else {
                      toast.error('Please enter a valid 11-digit phone number with 0 prefix');
                    }
                  }}
                  className="max-w-[200px]"
                  disabled={isStartingOutbound}
                >
                  {isStartingOutbound ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Starting...
                    </>
                  ) : (
                    'Start Outbound Call'
                  )}
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This will initiate the call to the number and connect to the Agora Conversational AI Agent. (English Speaking Agent By default). <br />
                  You can converse with the agent or request a transfer to a human agent at any point of the conversation. Upon your confirmation, the agent will exit the call and transfer it to Human Agent.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  }

  if (agentDetails?.layout === Layout.AVATAR_LANDSCAPE_TRANSCRIPT) {
    return (
      <div className="min-h-screen bg-background">
        <Header feedbackDialogRef={feedbackDialogRef} />
        <main className={`container mx-auto p-4 w-full h-[90vh] flex flex-row`}>
          <Card className="shadow-lg h-full w-full flex flex-col relative">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl">Avatar</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex justify-center items-center relative overflow-auto">
              {
                isJoined ?
                  <video ref={videoRef} autoPlay className="w-full h-full object-cover rounded-lg" />
                  :
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">Conversation not started yet...</p>
                  </div>
              }
              <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
                {agentControls()}
              </div>
            </CardContent>
          </Card>
          {showTranscriptions && (
            <div className="ml-5 w-[30vw]">
              <TranscriptionList
                transcripts={transcripts}
                isVisible={showTranscriptions}
              />
            </div>
          )}
          {/* <div className='absolute bottom-20 right-60 border-2 border-red-500 rounded-lg'>
            <SelfView />
          </div> */}
        </main>
      </div>
    )
  }

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
                {agentControls()}
              </div>
            </CardContent>
          </Card>
          {
            agentDetails?.layout === Layout.AVATAR_TRANSCRIPT && (
              <div className="h-full">
                <Card className="shadow-lg h-full">
                  <CardHeader className="border-b">
                    <CardTitle className="text-2xl">Avatar</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 flex justify-center items-center h-full">
                    {
                      isJoined ?
                        <video ref={videoRef} autoPlay className="w-[80%] rounded-lg" />
                        :
                        <div className="flex justify-center items-center h-full">
                          <p className="text-muted-foreground">Conversation not started yet...</p>
                        </div>
                    }
                  </CardContent>
                </Card>
              </div>
            )
          }
          {agentDetails?.layout === Layout.METADATA_TRANSCRIPT && (
            <div className="h-full">
              <MetaDataView metaData={metaData} />
            </div>
          )}
          {showTranscriptions && (
            <div className="h-full">
              <TranscriptionList
                transcripts={transcripts}
                isVisible={showTranscriptions}
              />
            </div>
          )}
        </div>
      </main>
      <FeedbackDialog ref={feedbackDialogRef}>
        <div className="hidden" />
      </FeedbackDialog>
      <PlatformUsageDialog
        ref={platformUsageDialogRef}
        feedbackDialogRef={feedbackDialogRef}
      />
      {showMetrics && (
        <div className="fixed bottom-4 left-4 w-[350px] h-[450px] z-50">
          <MetricList
            metrics={metrics}
            isVisible={showMetrics}
          />
        </div>
      )}
    </div>
  );
};

export default Agent;
