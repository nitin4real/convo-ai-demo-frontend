import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Agent from './components/Agent';
import SIP_Agent_Outbound from './components/SIP_Agent_Outbound';
import SIP_Agent_Inbound from './components/SIP_Agent_Inbound';
import Dashboard from './components/Dashboard';
import AgentsList from './components/Agents';
import Login from './components/Login';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents" element={<AgentsList />} />
          <Route path="/agent/:agentId" element={<Agent />} />
          <Route path="/sip-agent-inbound/:agentId" element={<SIP_Agent_Inbound />} />
          <Route path="/sip-agent-outbound/:agentId" element={<SIP_Agent_Outbound />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
};

export default App;
