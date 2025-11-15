import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { mockProperties } from '../data/mockProperties';
import { useUser } from '../contexts/UserContext';
import { 
  Home, FileText, Bell, Calendar, DollarSign, CheckCircle, Clock, 
  AlertCircle, MapPin, MessageSquare, TrendingUp, Heart, Eye
} from 'lucide-react';

export function TenantDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Mock data for tenant applications
  const [applications] = useState([
    {
      id: 'app-1',
      propertyId: '9',
      property: mockProperties.find(p => p.id === '9'),
      status: 'pending',
      appliedDate: '2025-10-25',
      offeredRent: 2000,
      moveInDate: '2025-12-01',
      leaseTerm: 12,
      progress: 40,
    },
    {
      id: 'app-2',
      propertyId: '10',
      property: mockProperties.find(p => p.id === '10'),
      status: 'accepted',
      appliedDate: '2025-10-20',
      offeredRent: 1800,
      moveInDate: '2025-11-15',
      leaseTerm: 12,
      progress: 85,
    },
  ]);

  const [savedProperties] = useState(
    mockProperties.filter(p => p.listingType === 'rent').slice(0, 3)
  );

  const [notifications] = useState([
    {
      id: '1',
      type: 'new-listing',
      message: 'New property matching your preferences in Camden',
      date: '2025-10-29',
      read: false,
    },
    {
      id: '2',
      type: 'application-update',
      message: 'Your application for Riverside Loft has been accepted!',
      date: '2025-10-28',
      read: false,
    },
    {
      id: '3',
      type: 'price-drop',
      message: 'Price reduced on a saved property',
      date: '2025-10-27',
      read: true,
    },
  ]);

  const stats = useMemo(() => ({
    activeApplications: applications.filter(a => a.status === 'pending').length,
    acceptedOffers: applications.filter(a => a.status === 'accepted').length,
    savedProperties: savedProperties.length,
    unreadNotifications: notifications.filter(n => !n.read).length,
  }), [applications, savedProperties, notifications]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Your tenant dashboard - manage your applications and find your perfect home
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Applications</p>
                <p className="text-3xl mt-1">{stats.activeApplications}</p>
              </div>
              <FileText className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted Offers</p>
                <p className="text-3xl mt-1">{stats.acceptedOffers}</p>
              </div>
              <CheckCircle className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saved Properties</p>
                <p className="text-3xl mt-1">{stats.savedProperties}</p>
              </div>
              <Heart className="size-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Notifications</p>
                <p className="text-3xl mt-1">{stats.unreadNotifications}</p>
              </div>
              <Bell className="size-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="applications">
            My Applications
            {stats.activeApplications > 0 && (
              <Badge className="ml-2" variant="secondary">{stats.activeApplications}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="saved">Saved Properties</TabsTrigger>
          <TabsTrigger value="search">Browse Properties</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Rental Applications</CardTitle>
              <CardDescription>Track the status of your rental applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="size-12 mx-auto mb-4 opacity-20" />
                  <p className="mb-2">No applications yet</p>
                  <Button onClick={() => navigate('/search')}>
                    Browse Properties
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <img
                            src={app.property?.images[0]}
                            alt={app.property?.title}
                            className="w-32 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="mb-1">{app.property?.title}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="size-3" />
                                  {app.property?.location}
                                </p>
                              </div>
                              <Badge variant={
                                app.status === 'accepted' ? 'default' :
                                app.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {app.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Offered Rent</p>
                                <p>£{app.offeredRent}/mo</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Move-in Date</p>
                                <p>{new Date(app.moveInDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Lease Term</p>
                                <p>{app.leaseTerm} months</p>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Application Progress</span>
                                <span>{app.progress}%</span>
                              </div>
                              <Progress value={app.progress} />
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/property/${app.propertyId}`)}
                              >
                                <Eye className="size-4 mr-1" />
                                View Property
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="size-4 mr-1" />
                                Message Landlord
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Properties Tab */}
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Properties</CardTitle>
              <CardDescription>Properties you've marked as favorites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedProperties.map((property) => (
                  <Card 
                    key={property.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    <CardContent className="p-0">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="p-4">
                        <h3 className="mb-1">{property.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                          <MapPin className="size-3" />
                          {property.location}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-2xl text-blue-600">£{property.price}/mo</p>
                          <Badge>{property.bedrooms} bed</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Browse Properties Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Find Your Perfect Home</CardTitle>
              <CardDescription>Browse available rental properties</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Home className="size-16 mx-auto mb-4 text-blue-600 opacity-20" />
              <h3 className="mb-2">Start Your Search</h3>
              <p className="text-muted-foreground mb-6">
                Use our AI-powered search to find properties that match your lifestyle
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/search')}>
                  Browse All Properties
                </Button>
                <Button variant="outline" onClick={() => navigate('/nearby')}>
                  <MapPin className="size-4 mr-2" />
                  Find Nearby
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Stay updated on your applications and new listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border ${
                      notif.read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Bell className={`size-5 mt-0.5 ${
                          notif.read ? 'text-gray-400' : 'text-blue-600'
                        }`} />
                        <div>
                          <p className="mb-1">{notif.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notif.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {!notif.read && (
                        <Badge variant="default" className="ml-2">New</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
