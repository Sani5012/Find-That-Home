import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useUser } from '../contexts/UserContext';
import {
  Home, FileText, Bell, Calendar, DollarSign, CheckCircle, Clock,
  MapPin, MessageSquare, TrendingUp, Heart, Eye, Loader2
} from 'lucide-react';
import { alertStore, offerStore, propertyStore } from '../services/platformData';
import { Property, RentalOffer, Alert } from '../types/property';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600';

export function TenantDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [offers, setOffers] = useState<RentalOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await propertyStore.getApproved();
        if (isMounted) {
          setProperties(data);
        }
      } catch (error) {
        console.error('Failed to load tenant properties', error);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!user?.id) {
      setOffers([]);
      return () => {
        isMounted = false;
      };
    }

    const loadOffers = async () => {
      try {
        setLoadingOffers(true);
        const data = await offerStore.getByUser(user.id);
        if (isMounted) {
          const rentalOffers = data.filter(offer => {
            const type = (offer.offerType ?? '').toLowerCase();
            if (type.includes('rent')) return true;
            const listing = (offer.property?.listingType ?? offer.property?.type ?? '').toLowerCase();
            return listing === 'rent';
          });
          setOffers(rentalOffers);
        }
      } catch (error) {
        console.error('Failed to load tenant offers', error);
      } finally {
        if (isMounted) {
          setLoadingOffers(false);
        }
      }
    };

    loadOffers();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;
    if (!user?.id) {
      setNotifications([]);
      return () => {
        isMounted = false;
      };
    }

    const loadNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const data = await alertStore.getByUser(user.id);
        if (isMounted) {
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to load tenant alerts', error);
      } finally {
        if (isMounted) {
          setLoadingNotifications(false);
        }
      }
    };

    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const rentProperties = useMemo(
    () => properties.filter(p => (p.listingType || p.type) === 'rent'),
    [properties]
  );

  const normalizeStatus = (value?: string) => (value ?? '').toLowerCase();
  const formatDate = (value?: string) => {
    if (!value) return 'TBD';
    try {
      return new Date(value).toLocaleDateString();
    } catch (error) {
      return value;
    }
  };

  const applications = useMemo(() => {
    if (offers.length === 0) return [];
    return offers.map((offer, index) => ({
      id: offer.id,
      propertyId: offer.propertyId,
      property: offer.property,
      status: offer.status,
      appliedDate: offer.createdAt,
      offeredRent: offer.offeredRent ?? offer.property?.price ?? 0,
      moveInDate: offer.moveInDate ?? '',
      leaseTerm: offer.leaseTerm ?? 12,
      progress:
        normalizeStatus(offer.status) === 'accepted'
          ? 90
          : normalizeStatus(offer.status) === 'pending'
          ? 45
          : 70 + index * 5,
    }));
  }, [offers]);

  const savedProperties = useMemo(
    () => rentProperties.slice(0, 3),
    [rentProperties]
  );

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
              {loadingOffers ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Loader2 className="size-10 mx-auto mb-4 animate-spin" />
                  Loading applications...
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="size-12 mx-auto mb-4 opacity-20" />
                  <p className="mb-2">No applications yet</p>
                  <Button onClick={() => navigate('/search')}>
                    Browse Properties
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => {
                    const propertyId = app.propertyId || app.property?.id;
                    return (
                      <Card key={app.id}>
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <img
                              src={app.property?.images?.[0] || FALLBACK_IMAGE}
                              alt={app.property?.title || 'Property'}
                              className="w-32 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="mb-1">{app.property?.title || 'Rental application'}</h3>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="size-3" />
                                    {typeof app.property?.location === 'string'
                                      ? app.property.location
                                      : app.property?.location?.city || 'Unknown location'}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    normalizeStatus(app.status) === 'accepted'
                                      ? 'default'
                                      : normalizeStatus(app.status) === 'rejected'
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                >
                                  {app.status || 'pending'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Offered Rent</p>
                                  <p>£{(app.offeredRent ?? 0).toLocaleString()}/mo</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Move-in Date</p>
                                  <p>{formatDate(app.moveInDate)}</p>
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
                                  disabled={!propertyId}
                                  onClick={() => propertyId && navigate(`/property/${propertyId}`)}
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
                    );
                  })}
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
              {loadingNotifications ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Loader2 className="size-10 mx-auto mb-4 animate-spin" />
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="size-12 mx-auto mb-4 opacity-20" />
                  <p>No alerts yet</p>
                </div>
              ) : (
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
                              {formatDate(notif.date)}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
