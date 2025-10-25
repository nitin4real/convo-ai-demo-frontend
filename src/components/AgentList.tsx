import React from 'react';
import { AgentTile } from '../types/agent.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { AIAgentIcon } from './AIAgentIcon';

interface AgentListProps {
  agents: AgentTile[];
  loading: boolean;
  onBackClick: () => void;
  onAgentClick: (agentId: string, agent: AgentTile) => void;
}

const AgentList: React.FC<AgentListProps> = ({ agents, loading, onBackClick, onAgentClick }) => {
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <AIAgentIcon size="lg" variant="glow" />
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">No Agents Available Yet</h2>
        <p className="text-muted-foreground max-w-md">
          We're working on adding more agents to enhance your experience. 
          Check back soon for exciting new AI companions!
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Loading agents...</div>
          <div className="text-sm text-muted-foreground">Please wait while we fetch the available agents.</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <button 
          onClick={onBackClick}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Agent Types
        </button>
      </div>
      {agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <Card 
              key={agent.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onAgentClick(agent.id, agent)}
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
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
    </>
  );
};

export default AgentList; 