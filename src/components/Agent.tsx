import AgoraAIRec from '@/assets/agoraai-rec.svg';
import { Mic, MicOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_CONFIG } from '../config/api.config';
import { APP_CONFIG } from '../config/app.config';
import axios from '../config/axios.config';
import { AgoraChannelResponse, agoraService, RemoteUser } from '../services/agora.service';
import { StartAgentRequest, StartAgentResponse } from '../types/agent.types';
import { AIAgentIcon } from './AIAgentIcon';
import { FeedbackDialog, FeedbackDialogRef } from './FeedbackDialog';
import Header from './Header';
import { PlatformUsageDialog, PlatformUsageDialogRef } from './PlatformUsageDialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { handleUserErrors } from '@/utils/toast.utils';

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
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);

  const sendHeartbeat = async () => {
    if (!convoAgentId.current) return;

    try {
      await axios.post(`${API_CONFIG.ENDPOINTS.AGENT.HEARTBEAT}/${convoAgentId.current}`, {});
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
    // Clear any existing interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    // Send initial heartbeat
    sendHeartbeat();

    // Set up new interval
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 8000);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
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
      }
    });
  }, []);

  const startAgent = async () => {
    if (!agentId || !channelInfo) return;

    try {
      const request: StartAgentRequest = {
        channelName: channelInfo.channelName
      };
      const response = await axios.post<StartAgentResponse>(
        `${API_CONFIG.ENDPOINTS.AGENT.START}/${agentId}`,
        request
      );
      convoAgentId.current = response.data.agent_id;
      console.log('Loggin Service', 'Agent started:', response.data);
      setIsAgentStarted(true);
      startHeartbeat();
    } catch (error: any) {
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
      const response = await axios.post(
        `${API_CONFIG.ENDPOINTS.AGENT.STOP}`,
        {}
      );
      console.log('Loggin Service', 'Agent stopped:', response.data);
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
    agoraService.toggleAudio(!isMuted);
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

  return (
    <div className="min-h-screen bg-background">
      <Header feedbackDialogRef={feedbackDialogRef} />

      <main className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>{APP_CONFIG.NAME} - Agent Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center">
                <img src={AgoraAIRec} alt="Agora AI Rec" className="h-30" />
              </div>
              <div className="flex justify-center space-x-4">
                {!isJoined && !isAgentStarted && channelInfo && (
                  <Button
                    onClick={async () => {
                      await joinChannel();
                      await startAgent();
                    }}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    Start Conversation
                  </Button>
                )}
                {isJoined && (
                  <Button
                    onClick={handleEndConversation}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    End Conversation
                  </Button>
                )}
                {isJoined && (
                  <Button
                    onClick={toggleMute}
                    variant="outline"
                    size="icon"
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              {isAgentStarted && (
                <div className="text-center text-sm text-green-600 flex items-center justify-center gap-2">
                  <AIAgentIcon size="sm" />
                  <span>Agent is active in the channel</span>
                </div>
              )}
              {remoteUsers.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  {remoteUsers.length} user{remoteUsers.length !== 1 ? 's' : ''} in channel
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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