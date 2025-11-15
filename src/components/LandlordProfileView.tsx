import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { RentalOffer, RentalApplication, RentalContract } from '../types/property';
import { 
  Users, FileText, CheckCircle, XCircle, Clock, 
  DollarSign, Calendar, AlertCircle, Eye, Check, X,
  MessageSquare, Shield, Building2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useUser } from '../contexts/UserContext';

export function LandlordProfileView() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedOffer, setSelectedOffer] = useState<RentalOffer | null>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedDepositScheme, setSelectedDepositScheme] = useState('DPS');

  const [offers, setOffers] = useState<RentalOffer[]>([
    {
      id: 'off-1',
      propertyId: '9',
      userId: 'user-123',
      offeredRent: 2200,
      moveInDate: '2025-12-01',
      leaseTerm: 12,
      message: 'Hi, I am very interested in this property. I have excellent references and stable employment.',
      status: 'pending',
      createdAt: '2025-10-25T10:00:00Z',
    },
    {
      id: 'off-2',
      propertyId: '10',
      userId: 'user-456',
      offeredRent: 1800,
      moveInDate: '2025-11-15',
      leaseTerm: 6,
      message: 'Looking for a 6-month lease initially with possibility to extend.',
      status: 'pending',
      createdAt: '2025-10-26T14:30:00Z',
    },
    {
      id: 'off-3',
      propertyId: '9',
      userId: 'user-789',
      offeredRent: 2100,
      moveInDate: '2025-12-15',
      leaseTerm: 12,
      message: 'Professional couple, non-smokers, no pets. Can provide deposit immediately.',
      status: 'accepted',
      createdAt: '2025-10-20T09:00:00Z',
    },
  ]);

  const [applications, setApplications] = useState<RentalApplication[]>([
    {
      id: 'app-1',
      propertyId: '9',
      userId: 'user-111',
      status: 'pending',
      submittedAt: '2025-10-28T10:00:00Z',
      tenantInfo: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+44 7700 900001',
        employmentStatus: 'Employed',
        annualIncome: 45000,
        references: 2,
      },
    },
    {
      id: 'app-2',
      propertyId: '10',
      userId: 'user-222',
      status: 'pending',
      submittedAt: '2025-10-29T14:30:00Z',
      tenantInfo: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+44 7700 900002',
        employmentStatus: 'Self-Employed',
        annualIncome: 52000,
        references: 3,
      },
    },
    {
      id: 'app-3',
      propertyId: '9',
      userId: 'user-333',
      status: 'approved',
      submittedAt: '2025-10-20T09:00:00Z',
      tenantInfo: {
        name: 'Michael Brown',
        email: 'mbrown@email.com',
        phone: '+44 7700 900003',
        employmentStatus: 'Employed',
        annualIncome: 60000,
        references: 2,
      },
    },
    {
      id: 'app-4',
      propertyId: '11',
      userId: 'user-444',
      status: 'rejected',
      submittedAt: '2025-10-18T16:00:00Z',
      tenantInfo: {
        name: 'Emma Wilson',
        email: 'emma.w@email.com',
        phone: '+44 7700 900004',
        employmentStatus: 'Employed',
        annualIncome: 38000,
        references: 1,
      },
    },
  ]);

  const [contracts, setContracts] = useState<RentalContract[]>([
    {
      id: 'contract-1',
      propertyId: '9',
      tenantId: 'user-333',
      landlordId: user?.id || 'landlord-1',
      startDate: '2025-11-01',
      endDate: '2026-11-01',
      monthlyRent: 2100,
      depositAmount: 6300,
      depositScheme: 'DPS',
      status: 'active',
      signedAt: '2025-10-25T10:00:00Z',
      tenantInfo: {
        name: 'Michael Brown',
        email: 'mbrown@email.com',
        phone: '+44 7700 900003',
      },
    },
  ]);

  const stats = useMemo(() => ({
    totalOffers: offers.length,
    pendingOffers: offers.filter(o => o.status === 'pending').length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === 'pending').length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
  }), [offers, applications, contracts]);

  const handleOfferAction = (offer: RentalOffer, action: 'accept' | 'reject') => {
    setOffers(offers.map(o => 
      o.id === offer.id 
        ? { ...o, status: action === 'accept' ? 'accepted' : 'rejected' }
        : o
    ));
    
    if (action === 'accept') {
      toast.success('Offer accepted! You can now proceed to create a contract.');
    } else {
      toast.success('Offer rejected');
    }
    
    setShowOfferDialog(false);
  };

  const handleApplicationAction = (appId: string, action: 'approve' | 'reject') => {
    setApplications(applications.map(app => 
      app.id === appId 
        ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' }
        : app
    ));
    
    toast.success(`Application ${action === 'approve' ? 'approved' : 'rejected'}`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: 'secondary', label: 'Pending', icon: Clock },
      accepted: { variant: 'default', label: 'Accepted', icon: CheckCircle },
      approved: { variant: 'default', label: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive', label: 'Rejected', icon: XCircle },
      active: { variant: 'default', label: 'Active', icon: CheckCircle },
      completed: { variant: 'secondary', label: 'Completed', icon: CheckCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="size-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your rental offers, applications, and contracts
            </p>
          </div>
          <Button onClick={() => navigate('/landlord-dashboard')} variant="outline" className="gap-2">
            <Building2 className="h-4 w-4" />
            View My Properties
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Pending Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl">{stats.pendingOffers}</p>
                <p className="text-sm text-muted-foreground">of {stats.totalOffers} total</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl">{stats.pendingApplications}</p>
                <p className="text-sm text-muted-foreground">of {stats.totalApplications} total</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Active Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl">{stats.activeContracts}</p>
                <p className="text-sm text-muted-foreground">contract{stats.activeContracts !== 1 ? 's' : ''}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="offers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="offers" className="gap-2">
            <DollarSign className="size-4" />
            Rental Offers
            {stats.pendingOffers > 0 && (
              <Badge variant="secondary" className="ml-1">{stats.pendingOffers}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2">
            <Users className="size-4" />
            Applications
            {stats.pendingApplications > 0 && (
              <Badge variant="secondary" className="ml-1">{stats.pendingApplications}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-2">
            <FileText className="size-4" />
            Contracts
          </TabsTrigger>
        </TabsList>

        {/* Offers Tab */}
        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <CardTitle>Rental Offers</CardTitle>
              <CardDescription>
                Review and respond to rental offers from prospective tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {offers.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="size-12 mx-auto mb-4 text-gray-400 opacity-20" />
                  <p className="text-muted-foreground">No rental offers yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Offered Rent</TableHead>
                      <TableHead>Move-in Date</TableHead>
                      <TableHead>Lease Term</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          £{offer.offeredRent.toLocaleString()}/mo
                        </TableCell>
                        <TableCell>
                          {new Date(offer.moveInDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{offer.leaseTerm} months</TableCell>
                        <TableCell>{getStatusBadge(offer.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOffer(offer);
                              setShowOfferDialog(true);
                            }}
                          >
                            <Eye className="size-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Applications</CardTitle>
              <CardDescription>
                Review tenant applications and conduct reference checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="size-12 mx-auto mb-4 text-gray-400 opacity-20" />
                  <p className="text-muted-foreground">No applications yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Employment</TableHead>
                      <TableHead>Annual Income</TableHead>
                      <TableHead>References</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {app.tenantInfo.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{app.tenantInfo.name}</p>
                              <p className="text-sm text-muted-foreground">{app.tenantInfo.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{app.tenantInfo.phone}</TableCell>
                        <TableCell>{app.tenantInfo.employmentStatus}</TableCell>
                        <TableCell>£{app.tenantInfo.annualIncome.toLocaleString()}</TableCell>
                        <TableCell>{app.tenantInfo.references} provided</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          {app.status === 'pending' ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApplicationAction(app.id, 'approve')}
                              >
                                <Check className="size-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplicationAction(app.id, 'reject')}
                              >
                                <X className="size-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {app.status === 'approved' ? 'Approved' : 'Rejected'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Rental Contracts</CardTitle>
              <CardDescription>
                Active and completed rental agreements with deposit protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="size-12 mx-auto mb-4 text-gray-400 opacity-20" />
                  <p className="text-muted-foreground">No contracts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <Card key={contract.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {contract.tenantInfo.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{contract.tenantInfo.name}</p>
                              <p className="text-sm text-muted-foreground">{contract.tenantInfo.email}</p>
                            </div>
                          </div>
                          {getStatusBadge(contract.status)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Monthly Rent</p>
                            <p className="font-medium">£{contract.monthlyRent.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                            <p className="font-medium">
                              {new Date(contract.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">End Date</p>
                            <p className="font-medium">
                              {new Date(contract.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Deposit</p>
                            <p className="font-medium">£{contract.depositAmount.toLocaleString()}</p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="size-5 text-blue-600" />
                          <p className="font-medium">Deposit Protection: {contract.depositScheme}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="size-4 mr-2" />
                            View Contract
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="size-4 mr-2" />
                            Message Tenant
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Offer Details Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rental Offer Details</DialogTitle>
            <DialogDescription>
              Review the offer and decide whether to accept or reject
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Offered Rent</Label>
                  <p className="text-2xl font-medium text-blue-600">
                    £{selectedOffer.offeredRent.toLocaleString()}/month
                  </p>
                </div>
                <div>
                  <Label>Lease Term</Label>
                  <p className="text-2xl font-medium">{selectedOffer.leaseTerm} months</p>
                </div>
                <div>
                  <Label>Move-in Date</Label>
                  <p className="font-medium">
                    {new Date(selectedOffer.moveInDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedOffer.status)}</div>
                </div>
              </div>

              <div>
                <Label>Message from Tenant</Label>
                <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                  {selectedOffer.message}
                </p>
              </div>

              {selectedOffer.status === 'pending' && (
                <>
                  <Separator />
                  <div>
                    <Label htmlFor="response">Your Response (Optional)</Label>
                    <Textarea
                      id="response"
                      placeholder="Add a message to the tenant..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedOffer?.status === 'pending' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => selectedOffer && handleOfferAction(selectedOffer, 'reject')}
                >
                  <X className="size-4 mr-2" />
                  Reject Offer
                </Button>
                <Button
                  onClick={() => selectedOffer && handleOfferAction(selectedOffer, 'accept')}
                >
                  <Check className="size-4 mr-2" />
                  Accept Offer
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setShowOfferDialog(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
