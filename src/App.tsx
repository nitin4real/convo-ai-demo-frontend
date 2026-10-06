import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Agent from './components/Agent';
import SIP_Agent_Outbound from './components/SIP_Agent_Outbound';
import SIP_Agent_Inbound from './components/SIP_Agent_Inbound';
import Dashboard from './components/Dashboard';
import AgentsList from './components/Agents';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/agents/:type" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute><AgentsList /></ProtectedRoute>} />
          <Route path="/agent/:agentId" element={<ProtectedRoute><Agent /></ProtectedRoute>} />
          <Route path="/sip-agent-inbound/:agentId" element={<ProtectedRoute><SIP_Agent_Inbound /></ProtectedRoute>} />
          <Route path="/sip-agent-outbound/:agentId" element={<ProtectedRoute><SIP_Agent_Outbound /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
};

export default App;
