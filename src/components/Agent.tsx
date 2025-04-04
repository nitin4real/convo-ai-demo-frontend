import { Mic, MicOff, Play, Square } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { APP_CONFIG } from '../config/app.config';
import { API_CONFIG } from '../config/api.config';
import { AgoraChannelResponse, agoraService, RemoteUser } from '../services/agora.service';
import { IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { StartAgentRequest, StartAgentResponse, StopAgentRequest } from '../types/agent.types';
import Header from './Header';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import axios from '../config/axios.config';

const Agent: React.FC = () => {
  const { agentId } = useParams();
  const convoAgentId = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [channelInfo, setChannelInfo] = useState<AgoraChannelResponse | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAgentStarted, setIsAgentStarted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);

  const sendHeartbeat = async () => {
    if (!convoAgentId.current) return;

    try {
      await axios.post(`${API_CONFIG.ENDPOINTS.AGENT.HEARTBEAT}/${convoAgentId.current}`, {});
    } catch (error: any) {
      if (error?.response?.status === 440) {
        console.log('Session expired, stopping heartbeat');
        stopHeartbeat();
        setIsAgentStarted(false);
        convoAgentId.current = null;
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
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 5000);
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
    } catch (error) {
      console.error('Failed to start agent:', error);
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
      const track = agoraService.getLocalAudioTrack();
      setLocalAudioTrack(track);
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
    setLocalAudioTrack(null);
    stopHeartbeat();
    convoAgentId.current = null;
  };

  const toggleMute = () => {
    agoraService.toggleAudio(!isMuted);
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>{APP_CONFIG.NAME} - Agent Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channelInfo && (
                <div className="text-center text-sm text-muted-foreground">
                  Channel: <span className="font-medium">{channelInfo.channelName}</span>
                </div>
              )}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={isJoined ? leaveChannel : joinChannel}
                  variant={isJoined ? "destructive" : "default"}
                >
                  {isJoined ? 'Leave Channel' : 'Join Channel'}
                </Button>
                {!isAgentStarted && channelInfo && (
                  <Button
                    onClick={startAgent}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Agent
                  </Button>
                )}
                {isAgentStarted && channelInfo && (
                  <Button
                    onClick={stopAgent}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Stop Agent
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
                <div className="text-center text-sm text-green-600">
                  Agent is active in the channel
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
    </div>
  );
};

export default Agent; 