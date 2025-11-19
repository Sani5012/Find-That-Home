import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Home, 
  Trash2, 
  AlertCircle,
  BarChart,
  Activity,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MapPin,
  Eye,
  UserCheck,
  Building2,
  FileText,
  Download,
  Filter,
  Database
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  phone?: string;
  verified?: boolean;
}

interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  landlordName?: string;
  landlordEmail?: string;
  agentName?: string;
  agentEmail?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  location?: {
    address: string;
    city: string;
  };
  bedrooms?: number;
  bathrooms?: number;
  rejectionReason?: string;
}

interface Stats {
  totalUsers: number;
  usersByRole: {
    tenant: number;
    landlord: number;
    buyer: number;
    admin: number;
    agent: number;
  };
  totalProperties: number;
  propertiesByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'user' | 'property' | 'all'; id?: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [propertyToReject, setPropertyToReject] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState<string>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    avgPropertyPrice: 0,
    mostActiveCity: '',
    growthRate: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const computeAnalytics = (props: Property[]) => {
    if (!props.length) {
      return {
        totalRevenue: 0,
        avgPropertyPrice: 0,
        mostActiveCity: 'N/A',
        growthRate: 0,
        conversionRate: 0,
      };
    }

    const totalRevenue = props.reduce((sum, property) => sum + (property.price || 0), 0);
    const avgPropertyPrice = totalRevenue / props.length;

    const cityCount: Record<string, number> = {};
    props.forEach(property => {
      const city = property.location && typeof property.location === 'object'
        ? property.location.city || 'Unknown'
        : property.city || 'Unknown';
      cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const mostActiveCity = Object.keys(cityCount).sort((a, b) => cityCount[b] - cityCount[a])[0] || 'N/A';

    const now = new Date();
    const thisMonth = props.filter(property => {
      if (!property.createdAt) return false;
      const created = new Date(property.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = props.filter(property => {
      if (!property.createdAt) return false;
      const created = new Date(property.createdAt);
      return created.getMonth() === lastMonthDate.getMonth() && created.getFullYear() === lastMonthDate.getFullYear();
    }).length;

    const growthRate = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : thisMonth > 0 ? 100 : 0;
    const approved = props.filter(property => property.approvalStatus === 'approved').length;
    const conversionRate = (approved / props.length) * 100;

    return {
      totalRevenue,
      avgPropertyPrice,
      mostActiveCity,
      growthRate,
      conversionRate,
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, propertiesData, statsData] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getProperties(),
        adminAPI.getStats(),
      ]);

      setUsers(usersData.users || []);
      const loadedProperties = propertiesData.properties || [];
      setProperties(loadedProperties);
      setAnalytics(computeAnalytics(loadedProperties));
      setStats(statsData.stats || null);
    } catch (error: any) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addActivityLog = (action: string, details: string) => {
    setActivityLogs(prev => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: 'system',
        userName: 'Admin',
        action,
        details,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 50));
  };

  const handleApproveProperty = async (propertyId: string) => {
    try {
      await adminAPI.approveProperty(propertyId);
      const property = properties.find(p => p.id === propertyId);
      addActivityLog('Approved Property', `Approved property: ${property?.title || propertyId}`);
      toast.success('Property approved successfully');
      loadData();
    } catch (error: any) {
      console.error('Failed to approve property:', error);
      toast.error('Failed to approve property: ' + error.message);
    }
  };

  const handleRejectProperty = async () => {
    if (!propertyToReject) return;

    try {
      await adminAPI.rejectProperty(propertyToReject, rejectionReason);
      const property = properties.find(p => p.id === propertyToReject);
      addActivityLog('Rejected Property', `Rejected property: ${property?.title || propertyToReject}. Reason: ${rejectionReason}`);
      toast.success('Property rejected');
      setRejectDialogOpen(false);
      setPropertyToReject(null);
      setRejectionReason('');
      loadData();
    } catch (error: any) {
      console.error('Failed to reject property:', error);
      toast.error('Failed to reject property: ' + error.message);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await adminAPI.deleteProperty(propertyId);
      const property = properties.find(p => p.id === propertyId);
      addActivityLog('Deleted Property', `Deleted property: ${property?.title || propertyId}`);
      toast.success('Property deleted successfully');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete property:', error);
      toast.error('Failed to delete property: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminAPI.deleteUser(userId);
      const user = users.find(u => u.id === userId);
      addActivityLog('Deleted User', `Deleted user: ${user?.name || userId} (${user?.email})`);
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user: ' + error.message);
    }
  };

  const handleClearAll = async () => {
    try {
      await adminAPI.clearAllData();
      addActivityLog('Cleared All Data', 'Cleared all properties and non-admin users');
      toast.success('All data cleared successfully');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      loadData();
    } catch (error: any) {
      console.error('Failed to clear all data:', error);
      toast.error('Failed to clear all data: ' + error.message);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'user' && deleteTarget.id) {
      handleDeleteUser(deleteTarget.id);
    } else if (deleteTarget.type === 'property' && deleteTarget.id) {
      handleDeleteProperty(deleteTarget.id);
    } else if (deleteTarget.type === 'all') {
      handleClearAll();
    }
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-500',
      landlord: 'bg-blue-500',
      tenant: 'bg-green-500',
      buyer: 'bg-orange-500',
      agent: 'bg-indigo-500',
    };
    return <Badge className={colors[role] || 'bg-gray-500'}>{role}</Badge>;
  };

  const exportData = (type: 'users' | 'properties' | 'logs') => {
    let data: any;
    let filename: string;

    switch (type) {
      case 'users':
        data = users;
        filename = 'users_export.json';
        break;
      case 'properties':
        data = properties;
        filename = 'properties_export.json';
        break;
      case 'logs':
        data = activityLogs;
        filename = 'activity_logs.json';
        break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    addActivityLog('Exported Data', `Exported ${type} data`);
    toast.success(`${type} data exported successfully`);
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    if (userRoleFilter === 'all') return true;
    return user.role === userRoleFilter;
  });

  const filteredProperties = properties.filter(property => {
    if (propertyStatusFilter !== 'all' && property.approvalStatus !== propertyStatusFilter) {
      return false;
    }
    if (propertyTypeFilter !== 'all' && property.type !== propertyTypeFilter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-2">Admin Control Panel</h1>
        <p className="text-gray-600">Complete platform management and analytics</p>
      </div>

      {/* Storage System Info Banner */}
      <Alert className="mb-6 border-blue-500 bg-blue-50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center justify-between">
            <span>
              <strong>Storage System:</strong> Connected to Supabase - live production data
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('/SYSTEM_INFO.md', '_blank')}
              className="text-blue-600 hover:text-blue-700"
            >
              <FileText className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 max-w-4xl mb-6">
          <TabsTrigger value="overview">
            <BarChart className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="properties">
            <Home className="w-4 h-4 mr-2" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.usersByRole.landlord} landlords, {stats.usersByRole.tenant} tenants
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Properties</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.totalProperties}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.propertiesByStatus.approved} approved
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Pending Approval</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.propertiesByStatus.pending}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Approval Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{analytics.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Properties approved
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => exportData('properties')}
              >
                <Download className="w-6 h-6 mb-2" />
                Export Properties
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => exportData('users')}
              >
                <Download className="w-6 h-6 mb-2" />
                Export Users
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => {
                  setDeleteTarget({ type: 'all' });
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-6 h-6 mb-2" />
                Clear All Data
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest 5 platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLogs.slice(0, 5).length === 0 ? (
                <p className="text-center text-gray-500 py-4">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <Activity className="w-4 h-4 mt-1 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{log.userName}</span> {log.action.toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Property Listings</CardTitle>
                  <CardDescription>Review and manage all property listings</CardDescription>
                </div>
                <Button onClick={() => exportData('properties')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Label>Status Filter</Label>
                  <Select value={propertyStatusFilter} onValueChange={setPropertyStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Type Filter</Label>
                  <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredProperties.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No properties found</p>
              ) : (
                <div className="space-y-4">
                  {filteredProperties.map((property) => (
                    <div
                      key={property.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3>{property.title}</h3>
                            {getApprovalBadge(property.approvalStatus)}
                            <Badge variant="outline">{property.type}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Price:</span> £{property.price?.toLocaleString()}</p>
                            <p><span className="font-medium">Location:</span> {property.location?.address}, {property.location?.city}</p>
                            {property.bedrooms && (
                              <p><span className="font-medium">Specs:</span> {property.bedrooms} bed, {property.bathrooms} bath</p>
                            )}
                            <p><span className="font-medium">Listed by:</span> {property.landlordName || property.agentName} ({property.landlordEmail || property.agentEmail})</p>
                            <p><span className="font-medium">Listed:</span> {new Date(property.createdAt).toLocaleDateString()}</p>
                            {property.rejectionReason && (
                              <p className="text-red-600"><span className="font-medium">Rejection Reason:</span> {property.rejectionReason}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {property.approvalStatus === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveProperty(property.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setPropertyToReject(property.id);
                                  setRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDeleteTarget({ type: 'property', id: property.id });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Accounts</CardTitle>
                  <CardDescription>Manage all registered users on the platform</CardDescription>
                </div>
                <Button onClick={() => exportData('users')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Role Filter */}
              <div className="mb-6">
                <Label>Role Filter</Label>
                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="tenant">Tenants</SelectItem>
                    <SelectItem value="landlord">Landlords</SelectItem>
                    <SelectItem value="buyer">Buyers</SelectItem>
                    <SelectItem value="agent">Agents</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No users found</p>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3>{user.name}</h3>
                            {getRoleBadge(user.role)}
                            {user.verified && (
                              <Badge className="bg-blue-500">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Email:</span> {user.email}</p>
                            {user.phone && (
                              <p><span className="font-medium">Phone:</span> {user.phone}</p>
                            )}
                            <p><span className="font-medium">User ID:</span> {user.id}</p>
                            <p><span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {user.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDeleteTarget({ type: 'user', id: user.id });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Average Property Price</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">£{analytics.avgPropertyPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all listings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Most Active City</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{analytics.mostActiveCity}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Highest property count
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Growth Rate</CardTitle>
                {analytics.growthRate >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl ${analytics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.growthRate >= 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Month over month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
              <CardDescription>Detailed breakdown of platform metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">User Distribution</h4>
                  <div className="space-y-2">
                    {stats && Object.entries(stats.usersByRole).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <span className="capitalize">{role}s</span>
                        <div className="flex items-center gap-2">
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                            />
                          </div>
                          <span className="w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Property Status</h4>
                  <div className="space-y-2">
                    {stats && Object.entries(stats.propertiesByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                status === 'approved' ? 'bg-green-600' :
                                status === 'pending' ? 'bg-yellow-600' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${(count / stats.totalProperties) * 100}%` }}
                            />
                          </div>
                          <span className="w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Logs</CardTitle>
                  <CardDescription>Complete audit trail of all platform activities</CardDescription>
                </div>
                <Button onClick={() => exportData('logs')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activityLogs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No activity logs yet</p>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <Activity className="w-4 h-4 mt-1 text-blue-500" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm">
                            <span className="font-medium">{log.userName}</span> {log.action.toLowerCase()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure platform-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-approve properties</Label>
                  <p className="text-xs text-gray-500">Automatically approve new property listings</p>
                </div>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email notifications</Label>
                  <p className="text-xs text-gray-500">Send email alerts for important events</p>
                </div>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require property verification</Label>
                  <p className="text-xs text-gray-500">Require verification before listing</p>
                </div>
                <Switch defaultChecked disabled />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Platform Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Platform:</span> Find that Home</p>
                  <p><span className="font-medium">Version:</span> 1.0.0</p>
                  <p><span className="font-medium">Storage:</span> Supabase Cloud Database</p>
                  <p><span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Alert className="border-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Danger Zone: Clear all platform data</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setDeleteTarget({ type: 'all' });
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'all' && 
                'This will permanently delete all properties and all non-admin users. This action cannot be undone. Admin accounts will be preserved.'
              }
              {deleteTarget?.type === 'user' && 
                'This will permanently delete this user and all their associated data. This action cannot be undone.'
              }
              {deleteTarget?.type === 'property' && 
                'This will permanently delete this property. This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Property Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Property</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this property. The landlord will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRejectDialogOpen(false);
              setPropertyToReject(null);
              setRejectionReason('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectProperty}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}