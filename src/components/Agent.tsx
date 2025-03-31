import React from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const Agent: React.FC = () => {
  const { agentId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Agent Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Agent interaction interface for {agentId} coming soon...
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Agent; 