import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentTile } from '../config/agents.config';
import { API_CONFIG } from '../config/api.config';
import axios from '../config/axios.config';
import { FeedbackDialog, FeedbackDialogRef } from './FeedbackDialog';
import Header from './Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const feedbackDialogRef = useRef<FeedbackDialogRef>(null);
  const [agents, setAgents] = useState<AgentTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get<AgentTile[]>(API_CONFIG.ENDPOINTS.AGENT.AGENTS);
        setAgents(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
        setError('Failed to load agents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleTileClick = (agentId: string) => {
    navigate(`/agent/${agentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header feedbackDialogRef={feedbackDialogRef} />
        <main className="container mx-auto p-6">
          <div className="flex justify-center items-center h-[50vh]">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">Loading agents...</div>
              <div className="text-sm text-muted-foreground">Please wait while we fetch the available agents.</div>
            </div>
          </div>
        </main>
        <FeedbackDialog ref={feedbackDialogRef}>
          <div className="hidden" />
        </FeedbackDialog>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header feedbackDialogRef={feedbackDialogRef} />
        <main className="container mx-auto p-6">
          <div className="flex justify-center items-center h-[50vh]">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2 text-red-600">Error</div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          </div>
        </main>
        <FeedbackDialog ref={feedbackDialogRef}>
          <div className="hidden" />
        </FeedbackDialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header feedbackDialogRef={feedbackDialogRef} />
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <Card 
              key={agent.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTileClick(agent.id)}
            >
              <CardHeader>
                <CardTitle>{agent.title}</CardTitle>
                <CardDescription>{agent.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <p className="text-sm text-muted-foreground mb-4">
                    {agent.description}
                  </p>
                  {/* <div className="space-y-2">
                    <h4 className="font-semibold">Key Features:</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {agent.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div> */}
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <FeedbackDialog ref={feedbackDialogRef}>
        <div className="hidden" />
      </FeedbackDialog>
    </div>
  );
};

export default Dashboard; 