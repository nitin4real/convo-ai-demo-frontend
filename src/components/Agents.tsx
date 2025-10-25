import { handleUserErrors } from '@/utils/toast.utils';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AgentTile, AgentType, Layout } from '../types/agent.types';
import { API_CONFIG } from '../config/api.config';
import axios from '../config/axios.config';
import { FeedbackDialog, FeedbackDialogRef } from './FeedbackDialog';
import Header from './Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { AIAgentIcon } from './AIAgentIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { ChevronDown, X } from 'lucide-react';

const AgentsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const feedbackDialogRef = useRef<FeedbackDialogRef>(null);
  const [agents, setAgents] = useState<AgentTile[]>([]);
  const [allAgents, setAllAgents] = useState<AgentTile[]>([]);
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchAgentTypes = async () => {
      try {
        const response = await axios.get<AgentType[]>(API_CONFIG.ENDPOINTS.AGENT.AGENT_TYPES);
        setAgentTypes(response.data);
        setError(null);
      } catch (err) {
        handleUserErrors(err);
        console.error('Failed to fetch agent types:', err);
        setError('Failed to load agent types. Please try again later.');
      }
    };

    fetchAgentTypes();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const endpoint = selectedType 
          ? API_CONFIG.ENDPOINTS.AGENT.AGENTS_BY_TYPE.replace(':type', selectedType)
          : API_CONFIG.ENDPOINTS.AGENT.AGENTS;
        
        const response = await axios.get<AgentTile[]>(endpoint);
        setAllAgents(response.data);
        setError(null);
      } catch (err) {
        handleUserErrors(err);
        console.error('Failed to fetch agents:', err);
        setError('Failed to load agents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [selectedType]);

  // Filter agents based on search query and selected type
  useEffect(() => {
    let filteredAgents = allAgents;

    // Filter by search query
    if (searchQuery) {
      filteredAgents = filteredAgents.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setAgents(filteredAgents);
  }, [allAgents, searchQuery]);

  const handleAgentClick = (agentId: string, agent: AgentTile) => {
    if (agent.layout === Layout.SIP_CALL_INBOUND || agent.layout === Layout.SIP_CALL_OUTBOUND) {
      if (agent.layout === Layout.SIP_CALL_INBOUND) {
        navigate(`/sip-agent-inbound/${agentId}`);
      } else {
        navigate(`/sip-agent-outbound/${agentId}`);
      }
    } else {
      navigate(`/agent/${agentId}`);
    }
  };

  const clearSearch = () => {
    setSearchParams({});
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

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <AIAgentIcon size="lg" variant="glow" />
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">
          {searchQuery ? 'No Agents Found' : 'No Agents Available Yet'}
        </h2>
        <p className="text-muted-foreground max-w-md">
          {searchQuery 
            ? `No agents found matching "${searchQuery}". Try a different search term.`
            : "We're working on adding more agents to enhance your experience. Check back soon for exciting new AI companions!"
          }
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header feedbackDialogRef={feedbackDialogRef} />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">All Agents</h1>
            {searchQuery && (
              <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-sm text-primary">Search: "{searchQuery}"</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0 hover:bg-primary/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {selectedType 
                  ? agentTypes.find(type => type.id === selectedType)?.title 
                  : 'All Types'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedType(null)}>
                All Types
              </DropdownMenuItem>
              {agentTypes.map((type) => (
                <DropdownMenuItem 
                  key={type.id} 
                  onClick={() => setSelectedType(type.id)}
                >
                  {type.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <Card 
                key={agent.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleAgentClick(agent.id, agent)}
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
      </main>
      <FeedbackDialog ref={feedbackDialogRef}>
        <div className="hidden" />
      </FeedbackDialog>
    </div>
  );
};

export default AgentsList; 