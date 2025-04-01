import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Video, VideoOff, Play } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { APP_CONFIG } from '../config/app.config';
import { API_CONFIG } from '../config/api.config';
import { AgoraChannelResponse, agoraService } from '../services/agora.service';
import Header from './Header';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import axios from '../config/axios.config';

const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

const Agent: React.FC = () => {
  const { agentId } = useParams();
  const [channelInfo, setChannelInfo] = useState<AgoraChannelResponse | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isAgentStarted, setIsAgentStarted] = useState(false);
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
      await client.join(channelInfo.appId, channelInfo.channelName, channelInfo.token, channelInfo.uid.toString());
      
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);
      
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }
      
      setIsJoined(true);
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  const leaveChannel = async () => {
    if (localAudioTrack) {
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.close();
    }
    await client.leave();
    setIsJoined(false);
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setIsAgentStarted(false);
  };

  const toggleMute = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
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
              <div className="flex justify-center">
                <div 
                  ref={localVideoRef} 
                  className="w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden"
                />
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
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Agent; 