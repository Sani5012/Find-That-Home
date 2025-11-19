import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Building2, TrendingUp, MapPin, Clock, CheckCircle, 
  XCircle, Eye, Star, Users, Calendar, Home, Award,
  BarChart3, Activity
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { propertyStore } from '../services/platformData';
import { Property } from '../types/property';

export function AgentProfileView() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    const load = async () => {
      try {
        const data = await propertyStore.getByAgent(user.id, user.email);
        if (isMounted) {
          setProperties(data);
        }
      } catch (error) {
        console.error('Failed to load agent properties', error);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  // Calculate stats
  const stats = useMemo(() => {
    const approved = properties.filter(p => p.approvalStatus === 'approved');
    const pending = properties.filter(p => p.approvalStatus === 'pending');
    const rejected = properties.filter(p => p.approvalStatus === 'rejected');
    
    const totalValue = approved.reduce((sum, p) => sum + p.price, 0);
    const avgPrice = approved.length > 0 ? totalValue / approved.length : 0;
    
    // Calculate success rate (approved / (approved + rejected))
    const total = approved.length + rejected.length;
    const successRate = total > 0 ? (approved.length / total) * 100 : 0;

    return {
      total: properties.length,
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      totalValue,
      avgPrice,
      successRate,
    };
  }, [properties]);

  // Recent properties (last 5)
  const recentProperties = useMemo(() => {
    return [...properties]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [properties]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500 gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500 gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-xl">
                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="mb-1">{user?.name}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <Badge className="mt-2 gap-1">
                <Award className="w-3 h-3" />
                Agent Account
              </Badge>
            </div>
          </div>
          <Button onClick={() => navigate('/agent-dashboard')} className="gap-2">
            <Building2 className="h-4 w-4" />
            Agent Dashboard
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl">{stats.total}</p>
                <p className="text-sm text-muted-foreground">properties</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl text-green-600">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">live</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl text-blue-600">{stats.successRate.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">approval</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl">£{(stats.totalValue / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground">total</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="properties" className="gap-2">
            <Home className="size-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <BarChart3 className="size-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Listings</CardTitle>
                <CardDescription>Your latest property additions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="size-12 mx-auto mb-4 text-gray-400 opacity-20" />
                    <p className="text-muted-foreground">No properties yet</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/agent-dashboard')}
                    >
                      Add Your First Property
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProperties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {property.images[0] && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium truncate">{property.title}</p>
                            {getStatusBadge(property.approvalStatus)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {property.location.city}
                          </p>
                          <p className="text-sm font-medium text-blue-600 mt-1">
                            £{property.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Your listing performance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Approval Rate</span>
                    <span className="text-sm font-medium">{stats.successRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={stats.successRate} className="h-2" />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Approved Listings</span>
                    </div>
                    <span className="font-medium">{stats.approved}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Pending Review</span>
                    </div>
                    <span className="font-medium">{stats.pending}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Rejected</span>
                    </div>
                    <span className="font-medium">{stats.rejected}</span>
                  </div>
                </div>

                <Separator />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <p className="font-medium text-blue-900">Average Property Value</p>
                  </div>
                  <p className="text-2xl font-medium text-blue-600">
                    £{stats.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access key features and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start gap-2"
                  onClick={() => navigate('/agent-dashboard')}
                >
                  <Building2 className="w-4 h-4" />
                  Manage Properties
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start gap-2"
                  onClick={() => navigate('/search')}
                >
                  <MapPin className="w-4 h-4" />
                  Search Listings
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start gap-2"
                  onClick={() => navigate('/market-intelligence')}
                >
                  <TrendingUp className="w-4 h-4" />
                  Market Data
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start gap-2"
                  onClick={() => navigate('/nearby')}
                >
                  <MapPin className="w-4 h-4" />
                  Nearby Properties
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>All Properties</CardTitle>
              <CardDescription>
                Complete list of your property listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="size-12 mx-auto mb-4 text-gray-400 opacity-20" />
                  <p className="text-muted-foreground mb-4">No properties listed yet</p>
                  <Button onClick={() => navigate('/agent-dashboard')}>
                    Add Your First Property
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {property.images[0] && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3>{property.title}</h3>
                                {getStatusBadge(property.approvalStatus)}
                              </div>
                              <p className="text-sm text-gray-600">
                                {property.location.address}, {property.location.city}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Price:</span>
                              <p>£{property.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <p className="capitalize">{property.type}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Bedrooms:</span>
                              <p>{property.bedrooms}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Area:</span>
                              <p>{property.area} sq ft</p>
                            </div>
                          </div>
                          {property.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                              <p className="text-sm text-red-800">
                                <strong>Rejection Reason:</strong> {property.rejectionReason}
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/property/${property.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Listing Statistics</CardTitle>
                <CardDescription>Breakdown of your property portfolio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-green-700">Approved Properties</p>
                        <p className="text-2xl font-medium text-green-900">{stats.approved}</p>
                      </div>
                    </div>
                    <p className="text-sm text-green-600">
                      {stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(0) : 0}%
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-yellow-700">Pending Review</p>
                        <p className="text-2xl font-medium text-yellow-900">{stats.pending}</p>
                      </div>
                    </div>
                    <p className="text-sm text-yellow-600">
                      {stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(0) : 0}%
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-red-700">Rejected Properties</p>
                        <p className="text-2xl font-medium text-red-900">{stats.rejected}</p>
                      </div>
                    </div>
                    <p className="text-sm text-red-600">
                      {stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Insights</CardTitle>
                <CardDescription>Key metrics about your listings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-medium">
                    £{stats.totalValue.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Average Property Price</span>
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-medium">
                    £{stats.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Properties</span>
                    <Building2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-2xl font-medium">{stats.total}</p>
                </div>

                <Separator />

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <p className="font-medium">Agent Rating</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Keep adding quality listings to improve your rating!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
