// import AgoraAIRec from '@/assets/agora-rec.svg';
import AgoraAIRec from '@/assets/agora-blue.svg';
import { handleUserErrors } from '@/utils/toast.utils';
import { Mic, MicOff, MessageSquare, MessageSquareOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { API_CONFIG } from '../config/api.config';
import axios from '../config/axios.config';
import { AgoraChannelResponse, agoraRTCService, RemoteUser } from '../services/agora.rtc.service';
import { AgentTile, IMessage, StartAgentRequest, StartAgentResponse } from '../types/agent.types';
import { MainCardHeader } from './MainCardHeader';
import { FeedbackDialog, FeedbackDialogRef } from './FeedbackDialog';
import Header from './Header';
import { PlatformUsageDialog, PlatformUsageDialogRef } from './PlatformUsageDialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TranscriptionList } from './TranscriptionList';
import AgoraRTMService from '../services/agora.rtm.services';
import { MetaDataView } from './MetaDataView';
import { Layout } from '@/types/agent.types';
import CustomAgent, { IProperties } from './CustomAgent/CustomAgent';

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
  const [customAgentProperties, setCustomAgentProperties] = useState<IProperties | null>(null);
  const videoRef = useRef<any>(null);

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
                <div className=''>
                  <div className="flex flex-col items-center gap-6 pt-4">
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
                          {isJoined && <Button
                            onClick={toggleMute}
                            variant={isMuted ? "destructive" : "outline"}
                            size="lg"
                            className="w-12 h-12"
                          >
                            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                          </Button>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end m-4 items-end">
                    <Button
                      onClick={() => setShowTranscriptions(!showTranscriptions)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {showTranscriptions ? (
                        <>
                          <MessageSquareOff className="h-4 w-4" />
                          Hide Transcriptions
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4" />
                          Show Transcriptions
                        </>
                      )}
                    </Button>
                  </div>
                </div>
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
                      isAgentStarted &&
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
    </div>
  );
};

export default Agent;
