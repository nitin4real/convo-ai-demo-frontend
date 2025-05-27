import AgoraAIRec from '@/assets/agora-rec.svg';
import { handleUserErrors } from '@/utils/toast.utils';
import { Mic, MicOff, MessageSquare, MessageSquareOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { API_CONFIG } from '../config/api.config';
import axios from '../config/axios.config';
import { AgoraChannelResponse, agoraService, RemoteUser } from '../services/agora.service';
import { AgentTile, IMessage, StartAgentRequest, StartAgentResponse } from '../types/agent.types';
import { AIAgentIcon } from './AIAgentIcon';
import { FeedbackDialog, FeedbackDialogRef } from './FeedbackDialog';
import Header from './Header';
import { PlatformUsageDialog, PlatformUsageDialogRef } from './PlatformUsageDialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TranscriptionList } from './TranscriptionList';

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
        const info = await agoraService.getChannelInfo(agentId || '');
        setChannelInfo(info);
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
    agoraService.setCallbacks({
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
              return [...prev.slice(0, -1), message];
            } else {
              return [...prev, message];
            }
          }
          return [...prev, message];
        });
      }
    });
  }, []);

  const startAgent = async () => {
    if (!agentId || !channelInfo) return;

    try {
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
      await agoraService.joinChannel(channelInfo);
      setIsJoined(true);
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  const leaveChannel = async () => {
    await agoraService.leaveChannel();
    setIsJoined(false);
    setIsAgentStarted(false);
    setRemoteUsers([]);
    stopHeartbeat();
    convoAgentId.current = null;
  };

  const toggleMute = () => {
    console.log('Current mute state', isMuted);
    console.log('Toggling mute state', !isMuted);
    agoraService.toggleAudio(isMuted);
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

  return (
    <div className="min-h-screen bg-background">
      <Header feedbackDialogRef={feedbackDialogRef} />

      <main className="container mx-auto p-4 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <AIAgentIcon size="md" variant="glow" />
                <span>{agentDetails?.title || 'Agent Interface'}</span>
              </CardTitle>
              {isAgentStarted && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Active</span>
                  {remainingTime !== null && (
                    <span className="ml-2 text-muted-foreground">
                      {String(Math.floor(remainingTime / 60)).padStart(2, '0')}:{Math.floor(remainingTime % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-6">
                <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center">
                  <img src={AgoraAIRec} alt="Agora AI Rec" className="w-24 h-24" />
                </div>

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

                {/* {remoteUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex -space-x-2">
                      {remoteUsers.slice(0, 3).map((user) => (
                        <div key={user.uid} className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs">U</span>
                        </div>
                      ))}
                      {remoteUsers.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs">+{remoteUsers.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <span>{remoteUsers.length} user{remoteUsers.length !== 1 ? 's' : ''} in channel</span>
                  </div>
                )} */}
              </div>
            </div>
            <div className="flex justify-end mb-4">
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
          </CardContent>
        </Card>
      </main>
      <div className="container mx-auto p-4 max-w-4xl">
        <TranscriptionList
          transcripts={transcripts}
          isVisible={showTranscriptions}
        />
      </div>
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