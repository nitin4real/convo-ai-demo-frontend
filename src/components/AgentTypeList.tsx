import React from 'react';
import { AgentType } from '../types/agent.types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { AIAgentIcon } from './AIAgentIcon';
import { cn } from '@/lib/utils';

interface AgentTypeListProps {
  agentTypes: AgentType[];
  onTypeClick: (typeId: string) => void;
}

const AgentTypeList: React.FC<AgentTypeListProps> = ({ agentTypes, onTypeClick }) => {
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <AIAgentIcon size="lg" variant="glow" />
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">No Agent Types Available</h2>
        <p className="text-muted-foreground max-w-md">
          We're working on adding more agent types to enhance your experience. 
          Check back soon for exciting new AI companions!
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Choose an Agent Type</h2>
        <p className="text-muted-foreground">
          Select a category to explore available AI agents
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentTypes.length > 0 ? (
          agentTypes.map((type) => (
            <Card 
              key={type.id}
              className={cn(
                "group cursor-pointer transition-all duration-200",
                "hover:shadow-lg hover:scale-[1.02]",
                "border-2 hover:border-primary/50"
              )}
              onClick={() => onTypeClick(type.id)}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <AIAgentIcon size="md" variant="glow" />
                  </div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[100px] pr-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {type.description}
                  </p>
                </ScrollArea>
                <div className="mt-4 text-sm text-primary font-medium group-hover:translate-x-1 transition-transform">
                  View Agents →
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

export default AgentTypeList; 