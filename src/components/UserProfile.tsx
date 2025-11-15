import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useUser } from '../contexts/UserContext';
import { TenantDashboard } from './TenantDashboard';
import { BuyerDashboard } from './BuyerDashboard';
import { LandlordProfileView } from './LandlordProfileView';
import { AgentProfileView } from './AgentProfileView';
import { AlertCircle } from 'lucide-react';

export function UserProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  // If not authenticated, show login prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <AlertCircle className="size-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="mb-2">Please Sign In</h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to view your profile
        </p>
        <Button onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'tenant':
      return <TenantDashboard />;
    case 'landlord':
      return <LandlordProfileView />;
    case 'buyer':
      return <BuyerDashboard />;
    case 'agent':
      return <AgentProfileView />;
    default:
      return (
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <AlertCircle className="size-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="mb-2">Unknown User Type</h2>
          <p className="text-muted-foreground mb-6">
            Your account type is not recognized. Please contact support.
          </p>
          <Button onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </div>
      );
  }
}