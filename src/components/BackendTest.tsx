import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, Loader2, Database } from 'lucide-react';
import { healthCheck, userAPI } from '../utils/api';
import { useUser } from '../contexts/UserContext';

export function BackendTest() {
  const { user, isAuthenticated } = useUser();
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [profileData, setProfileData] = useState<any>(null);

  const runHealthCheck = async () => {
    setTestStatus('loading');
    setTestMessage('Checking backend connection...');
    
    try {
      const result = await healthCheck();
      if (result.status === 'ok') {
        setTestStatus('success');
        setTestMessage('Backend is connected and responding!');
      } else {
        setTestStatus('error');
        setTestMessage('Backend returned unexpected response');
      }
    } catch (error: any) {
      setTestStatus('error');
      setTestMessage(`Backend connection failed: ${error.message}`);
    }
  };

  const fetchProfile = async () => {
    setTestStatus('loading');
    setTestMessage('Fetching user profile from backend...');
    
    try {
      const { profile } = await userAPI.getProfile();
      setProfileData(profile);
      setTestStatus('success');
      setTestMessage('Profile loaded successfully!');
    } catch (error: any) {
      setTestStatus('error');
      setTestMessage(`Failed to fetch profile: ${error.message}`);
      setProfileData(null);
    }
  };

  const StatusIcon = () => {
    switch (testStatus) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Database className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600" />
          <CardTitle>LocalStorage Integration Test</CardTitle>
        </div>
        <CardDescription>
          Test the localStorage API connection and endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Check Section */}
        <div className="space-y-3">
          <h3 className="font-semibold">Health Check</h3>
          <p className="text-sm text-gray-600">
            Test if the backend server is running and responding
          </p>
          <Button onClick={runHealthCheck} disabled={testStatus === 'loading'}>
            {testStatus === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Health Check'
            )}
          </Button>
        </div>

        {/* Profile Test Section */}
        {isAuthenticated && (
          <div className="space-y-3 pt-6 border-t">
            <h3 className="font-semibold">User Profile API</h3>
            <p className="text-sm text-gray-600">
              Fetch your profile from the backend database
            </p>
            <Button onClick={fetchProfile} disabled={testStatus === 'loading'}>
              {testStatus === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                'Fetch Profile'
              )}
            </Button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="pt-6 border-t">
            <p className="text-sm text-amber-600">
              Sign in to test authenticated endpoints
            </p>
          </div>
        )}

        {/* Test Results */}
        {testStatus !== 'idle' && (
          <div className="pt-6 border-t space-y-3">
            <div className="flex items-center gap-2">
              <StatusIcon />
              <span className="font-semibold">
                {testStatus === 'loading' ? 'Testing...' : 'Test Results'}
              </span>
            </div>
            
            <div className={`p-4 rounded-lg ${
              testStatus === 'success' ? 'bg-green-50 border border-green-200' :
              testStatus === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm ${
                testStatus === 'success' ? 'text-green-800' :
                testStatus === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {testMessage}
              </p>
            </div>

            {/* Profile Data Display */}
            {profileData && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3">Profile Data:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-mono text-xs">{profileData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span>{profileData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <Badge variant="outline">{profileData.role}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-xs">
                      {new Date(profileData.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {profileData.savedProperties && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saved Properties:</span>
                      <span>{profileData.savedProperties.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Auth Status */}
        <div className="pt-6 border-t">
          <h3 className="font-semibold mb-3">Authentication Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Logged In:</span>
              <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                {isAuthenticated ? 'Yes' : 'No'}
              </Badge>
            </div>
            {user && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">User:</span>
                  <span>{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}