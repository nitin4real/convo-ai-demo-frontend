import { Mic, MicOff, Video, VideoOff, Play } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { APP_CONFIG } from '../config/app.config';
import { API_CONFIG } from '../config/api.config';
import { AgoraChannelResponse, agoraService, RemoteUser } from '../services/agora.service';
import Header from './Header';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import axios from '../config/axios.config';

const Agent: React.FC = () => {
  const { agentId } = useParams();
  const [channelInfo, setChannelInfo] = useState<AgoraChannelResponse | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isAgentStarted, setIsAgentStarted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const localVideoRef = useRef<HTMLDivElement>(null);

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
        setRemoteUsers(prev => [...prev, user]);
      },
      onUserLeft: (uid) => {
        setRemoteUsers(prev => prev.filter(user => user.uid !== uid));
      },
      onUserPublished: (user) => {
        setRemoteUsers(prev => 
          prev.map(u => u.uid === user.uid ? user : u)
        );
      },
      onUserUnpublished: (user) => {
        setRemoteUsers(prev => 
          prev.map(u => u.uid === user.uid ? user : u)
        );
      }
    });
  }, []);

  const startAgent = async () => {
    if (!agentId || !channelInfo) return;

    try {
      await axios.post(`${API_CONFIG.ENDPOINTS.AGENT.START}/${agentId}`, {
        channelName: channelInfo.channelName
      });
      setIsAgentStarted(true);
    } catch (error) {
      console.error('Failed to start agent:', error);
    }
  };

  const joinChannel = async () => {
    if (!channelInfo) return;

    try {
      await agoraService.joinChannel(channelInfo);
      
      const videoTrack = agoraService.getLocalVideoTrack();
      if (videoTrack && localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }
      
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
  };

  const toggleMute = () => {
    agoraService.toggleAudio(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    agoraService.toggleVideo(!isVideoOff);
    setIsVideoOff(!isVideoOff);
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-center">
                  <div 
                    ref={localVideoRef} 
                    className="w-full aspect-video bg-black rounded-lg overflow-hidden"
                  />
                </div>
                {remoteUsers.map((user) => (
                  <div key={user.uid.toString()} className="flex justify-center">
                    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                      {user.videoTrack && (
                        <div ref={(el) => {
                          if (el) {
                            user.videoTrack?.play(el);
                          }
                        }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                {isJoined && (
                  <>
                    <Button
                      onClick={toggleMute}
                      variant="outline"
                      size="icon"
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={toggleVideo}
                      variant="outline"
                      size="icon"
                    >
                      {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    </Button>
                  </>
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