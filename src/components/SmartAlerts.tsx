import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert } from '../types/property';
import { Bell, BellOff, Home, TrendingDown, MapPin, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SmartAlerts() {
  const navigate = useNavigate();
  const [newListingAlerts, setNewListingAlerts] = useState(true);
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);
  const [marketUpdateAlerts, setMarketUpdateAlerts] = useState(false);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'new-listing',
      message: 'New 3-bedroom house in Austin matching your preferences',
      date: '2025-10-27',
      propertyId: '1',
      read: false
    },
    {
      id: '2',
      type: 'price-drop',
      message: 'Price reduced by $25,000 on Luxury Downtown Apartment',
      date: '2025-10-26',
      propertyId: '2',
      read: false
    },
    {
      id: '3',
      type: 'market-update',
      message: 'Austin real estate market: Prices up 3% this quarter',
      date: '2025-10-25',
      read: true
    },
    {
      id: '4',
      type: 'new-listing',
      message: 'New suburban home with 4 bedrooms near top-rated schools',
      date: '2025-10-24',
      propertyId: '3',
      read: true
    },
    {
      id: '5',
      type: 'price-drop',
      message: 'Contemporary Townhouse price dropped by $200/month',
      date: '2025-10-23',
      propertyId: '4',
      read: true
    }
  ]);

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  const AlertIcon = ({ type }: { type: Alert['type'] }) => {
    switch (type) {
      case 'new-listing':
        return <Home className="h-5 w-5 text-blue-600" />;
      case 'price-drop':
        return <TrendingDown className="h-5 w-5 text-green-600" />;
      case 'market-update':
        return <MapPin className="h-5 w-5 text-purple-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1>Smart Alerts</h1>
              <p className="text-gray-600">Stay updated on properties and market trends</p>
            </div>
            <Badge variant={unreadCount > 0 ? 'default' : 'secondary'}>
              {unreadCount} Unread
            </Badge>
          </div>

          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="settings">Alert Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  {alerts.length} total alerts
                </p>
                {alerts.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearAllAlerts}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              {alerts.length === 0 ? (
                <Card className="p-12 text-center">
                  <BellOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3>No alerts yet</h3>
                  <p className="text-gray-600 mt-2">
                    Enable alerts in settings to get notified about new properties and price changes
                  </p>
                </Card>
              ) : (
                alerts.map(alert => (
                  <Card
                    key={alert.id}
                    className={`cursor-pointer transition-all ${
                      alert.read ? 'opacity-60' : 'border-blue-200 bg-blue-50/50'
                    }`}
                    onClick={() => {
                      markAsRead(alert.id);
                      if (alert.propertyId) {
                        navigate(`/property/${alert.propertyId}`);
                      }
                    }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <AlertIcon type={alert.type} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className={alert.read ? '' : ''}>
                                {alert.message}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">{alert.date}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAlert(alert.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Preferences</CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <Label htmlFor="new-listings">New Listings</Label>
                        <p className="text-sm text-gray-600">
                          Get notified when new properties match your preferences
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="new-listings"
                      checked={newListingAlerts}
                      onCheckedChange={setNewListingAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <Label htmlFor="price-drops">Price Drops</Label>
                        <p className="text-sm text-gray-600">
                          Be alerted when properties you're watching drop in price
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="price-drops"
                      checked={priceDropAlerts}
                      onCheckedChange={setPriceDropAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <Label htmlFor="market-updates">Market Updates</Label>
                        <p className="text-sm text-gray-600">
                          Receive insights about market trends in your preferred areas
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="market-updates"
                      checked={marketUpdateAlerts}
                      onCheckedChange={setMarketUpdateAlerts}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Alert Criteria</CardTitle>
                  <CardDescription>Define specific criteria for your alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-sm">
                      Alerts are automatically configured based on your profile preferences.
                      Update your preferences in the Profile section to customize your alerts.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/profile')}>
                    Edit Profile Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
