import React, { useEffect, useRef } from 'react';
import { IMessage } from '../types/agent.types';
import { Card, CardContent } from './ui/card';

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

  if (!isVisible || transcripts.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div 
        ref={containerRef}
        className="border rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-h-[400px] overflow-y-auto"
      >
        <div className="p-4 space-y-4">
          {transcripts.map((transcript, index) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}; 