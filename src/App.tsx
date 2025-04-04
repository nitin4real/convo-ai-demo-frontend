import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Agent from './components/Agent';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { Toaster } from './components/ui/sonner';

const App: React.FC = () => {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agent/:agentId" element={<Agent />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
