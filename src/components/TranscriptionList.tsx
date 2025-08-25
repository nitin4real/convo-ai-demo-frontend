import React, { useEffect, useRef } from 'react';
import { IMessage } from '../types/agent.types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface TranscriptionListProps {
  transcripts: IMessage[];
  isVisible: boolean;
}

export const TranscriptionList: React.FC<TranscriptionListProps> = ({ transcripts, isVisible }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && isVisible) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts, isVisible]);

  const handleDownload = () => {
    const formattedText = transcripts
      .map(transcript => `${transcript.speaker === 'user' ? 'User' : 'Agent'}: ${transcript.transcription}`)
      .join('\n');

    const blob = new Blob([formattedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <Card className="shadow-lg p-2 h-full overflow-y-clip">
      <div className="p-2 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Transcript</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time conversation transcript
            </p>
          </div>
          <Button onClick={handleDownload} variant="outline">
            Download Transcript
          </Button>
        </div>
      </div>
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="border rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-[78vh] overflow-y-auto"
        >
          <div className="p-4 space-y-4">
            {transcripts.length > 0 ? (
              transcripts.map((transcript, index) => (
                <Card key={index} className="shadow-sm">
                  <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">
                        {transcript.speaker === 'user' ? 'U' : 'A'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">
                        {transcript.speaker === 'user' ? 'You' : 'Agent'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transcript.transcription}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No transcripts yet</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 