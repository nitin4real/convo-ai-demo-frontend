import { handleUserErrors } from '@/utils/toast.utils';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AgentTile, AgentType, Layout } from '../types/agent.types';
import { API_CONFIG } from '../config/api.config';
import axios from '../config/axios.config';
import { FeedbackDialog, FeedbackDialogRef } from './FeedbackDialog';
import Header from './Header';
import AgentTypeList from './AgentTypeList';
import AgentList from './AgentList';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type?: string }>();
  const feedbackDialogRef = useRef<FeedbackDialogRef>(null);
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [agents, setAgents] = useState<AgentTile[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedType = type ?? null;

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
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchAgentTypes();
  }, []);

  useEffect(() => {
    const fetchAgentsByType = async () => {
      if (!selectedType) {
        setAgents([]);
        setLoadingAgents(false);
        return;
      }
      
      setLoadingAgents(true);
      try {
        const response = await axios.get<AgentTile[]>(
          API_CONFIG.ENDPOINTS.AGENT.AGENTS_BY_TYPE.replace(':type', selectedType)
        );
        setAgents(response.data);
        setError(null);
      } catch (err) {
        handleUserErrors(err);
        console.error('Failed to fetch agents:', err);
        setError('Failed to load agents. Please try again later.');
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgentsByType();
  }, [selectedType]);

  const handleTypeClick = (typeId: string) => {
    navigate(`/agents/${encodeURIComponent(typeId)}`);
  };

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

  if (loadingTypes && !selectedType) {
    return (
      <div className="min-h-screen bg-background">
        <Header feedbackDialogRef={feedbackDialogRef} />
        <main className="container mx-auto p-6">
          <div className="flex justify-center items-center h-[50vh]">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">Loading agent types...</div>
              <div className="text-sm text-muted-foreground">Please wait while we fetch the available agent types.</div>
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
        
        {!selectedType ? (
          <AgentTypeList 
            agentTypes={agentTypes}
            onTypeClick={handleTypeClick}
          />
        ) : (
          <AgentList 
            agents={agents}
            loading={loadingAgents}
            onBackClick={() => navigate('/dashboard')}
            onAgentClick={handleAgentClick}
          />
        )}
      </main>
      <FeedbackDialog ref={feedbackDialogRef}>
        <div className="hidden" />
      </FeedbackDialog>
    </div>
  );
};

export default Dashboard; 
