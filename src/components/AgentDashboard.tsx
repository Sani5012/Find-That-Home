import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger 
} from './ui/dialog';
import { 
  Home, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  TrendingUp,
  Search,
  Check,
  X,
  Clock,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getPropertiesByAgent, getAlertsByUser, Property } from '../utils/localStorage';
import { AddPropertyForm } from './AddPropertyForm';
import { Alert } from '../utils/localStorage';

export function AgentDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (user?.role !== 'agent') {
      navigate('/');
      return;
    }
    loadProperties();
    loadAlerts();
  }, [user]);

  const loadProperties = () => {
    if (user?.id) {
      const agentProperties = getPropertiesByAgent(user.id);
      setProperties(agentProperties);
    }
  };

  const loadAlerts = () => {
    if (user?.id) {
      const userAlerts = getAlertsByUser(user.id);
      setAlerts(userAlerts);
    }
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowAddForm(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingProperty(null);
    loadProperties();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const stats = {
    total: properties.length,
    approved: properties.filter(p => p.approvalStatus === 'approved').length,
    pending: properties.filter(p => p.approvalStatus === 'pending').length,
    rejected: properties.filter(p => p.approvalStatus === 'rejected').length,
  };

  if (showAddForm) {
    return (
      <AddPropertyForm 
        property={editingProperty} 
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Agent Dashboard</h1>
        <p className="text-gray-600">Manage your property listings and track performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Button onClick={handleAddProperty} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
        <Button variant="outline" onClick={() => setActiveTab('search')} className="w-full">
          <Search className="w-4 h-4 mr-2" />
          Search Properties
        </Button>
        <Button variant="outline" onClick={() => navigate('/nearby')} className="w-full">
          <MapPin className="w-4 h-4 mr-2" />
          Nearby Properties
        </Button>
        <Button variant="outline" onClick={() => navigate('/market-intelligence')} className="w-full">
          <TrendingUp className="w-4 h-4 mr-2" />
          Market Intelligence
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="properties">
            <Home className="w-4 h-4 mr-2" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="w-4 h-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* My Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Properties</CardTitle>
              <CardDescription>
                Manage all your property listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3>No properties listed yet</h3>
                  <p className="text-gray-600 mt-2 mb-4">
                    Start by adding your first property listing
                  </p>
                  <Button onClick={handleAddProperty}>
                    <Plus className="w-4 h-4 mr-2" />
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
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProperty(property)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
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

        {/* Search Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search All Properties</CardTitle>
              <CardDescription>
                Browse all approved properties visible to buyers and tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  Search and explore approved properties in the marketplace
                </p>
                <Button onClick={() => navigate('/search')}>
                  Go to Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>
                Stay updated with property alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  Manage your property alerts and notifications
                </p>
                <Button onClick={() => navigate('/alerts')}>
                  Go to Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}