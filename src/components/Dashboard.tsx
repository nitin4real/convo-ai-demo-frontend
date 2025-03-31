import React from 'react';
import { useNavigate } from 'react-router-dom';
import { agents } from '../config/agents.config';
import Header from './Header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleTileClick = (agentId: string) => {
    navigate(`/agent/${agentId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">AI Agents Dashboard</h1>
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
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Features:</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {agent.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 