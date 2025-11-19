import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  Mail,
  Loader2,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useUser } from '../contexts/UserContext';
import { RentalOffer } from '../types/property';
import {
  LegalProcessRecord,
  legalProcessStore,
  offerStore,
  propertyStore,
} from '../services/platformData';

const formatCurrency = (value?: number) => {
  if (!value || Number.isNaN(value)) return '—';
  return `£${value.toLocaleString()}`;
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch (error) {
    return value;
  }
};

const statusKey = (value?: string | null) => (value ?? '').toLowerCase();

const getStatusBadge = (status?: string | null) => {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string; icon: any }> = {
    pending: { variant: 'secondary', label: 'Pending', icon: Clock },
    accepted: { variant: 'default', label: 'Accepted', icon: CheckCircle },
    approved: { variant: 'default', label: 'Approved', icon: CheckCircle },
    rejected: { variant: 'destructive', label: 'Rejected', icon: XCircle },
    'in-progress': { variant: 'secondary', label: 'In progress', icon: Clock },
    completed: { variant: 'default', label: 'Completed', icon: CheckCircle },
    active: { variant: 'default', label: 'Active', icon: CheckCircle },
  };

  const normalized = statusKey(status);
  const config = variants[normalized] ?? variants.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
};

const getApplicantInitials = (name?: string) => {
  if (!name) return 'AP';
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export function LandlordProfileView() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [offers, setOffers] = useState<RentalOffer[]>([]);
  const [processes, setProcesses] = useState<LegalProcessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!user?.id && !user?.email) {
        setOffers([]);
        setProcesses([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const managed = await propertyStore.getByAgent(user?.id ?? '', user?.email);
        if (!isMounted) return;

        const propertyIds = managed
          .map(property => Number(property.id))
          .filter((id): id is number => Number.isFinite(id));

        if (!propertyIds.length) {
          setOffers([]);
          setProcesses([]);
          return;
        }

        const offerData = await offerStore.getByPropertyIds(propertyIds);
        if (!isMounted) return;
        setOffers(offerData);

        const offerIds = offerData
          .map(offer => Number(offer.id))
          .filter((id): id is number => Number.isFinite(id));

        if (!offerIds.length) {
          setProcesses([]);
          return;
        }

        const processData = await legalProcessStore.getByOfferIds(offerIds);
        if (isMounted) {
          setProcesses(processData);
        }
      } catch (error) {
        console.error('Failed to load landlord data', error);
        if (isMounted) {
          toast.error('Failed to load data from Supabase.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  const stats = useMemo(() => {
    const pendingOffers = offers.filter(offer => statusKey(offer.status) === 'pending').length;
    const pendingApplications = processes.filter(process => statusKey(process.status) !== 'completed').length;
    const activeContracts = processes.filter(process => ['active', 'in-progress'].includes(statusKey(process.status))).length;

    return {
      totalOffers: offers.length,
      pendingOffers,
      totalApplications: processes.length,
      pendingApplications,
      activeContracts,
    };
  }, [offers, processes]);

  const completedContracts = useMemo(
    () => processes.filter(process => statusKey(process.status) === 'completed'),
    [processes]
  );

  const handleOfferAction = async (offer: RentalOffer, action: 'accept' | 'reject') => {
    try {
      setUpdatingOfferId(offer.id);
      const updated = await offerStore.updateStatus(
        offer.id,
        action === 'accept' ? 'accepted' : 'rejected'
      );
      setOffers(prev => prev.map(current => (current.id === updated.id ? updated : current)));
      toast.success(`Offer ${action === 'accept' ? 'accepted' : 'rejected'}`);
    } catch (error) {
      console.error('Failed to update offer status', error);
      toast.error('Unable to update offer status. Please try again.');
    } finally {
      setUpdatingOfferId(null);
    }
  };

  const renderOffers = () => {
    if (loading) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="mx-auto mb-3 size-6 animate-spin" />
          Loading offers...
        </div>
      );
    }

    if (offers.length === 0) {
      return (
        <div className="text-center py-12">
          <DollarSign className="size-12 mx-auto mb-4 text-gray-400 opacity-20" />
          <p className="text-muted-foreground">No rental offers yet</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Applicant</TableHead>
            <TableHead>Offer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map(offer => {
            const propertyTitle = offer.property?.title || `Property #${offer.propertyId}`;
            const applicantName = offer.buyerName || offer.buyerEmail || 'Applicant';
            const applicantInitials = getApplicantInitials(offer.buyerName);
            const amount = offer.offeredRent ?? offer.offeredPrice ?? offer.property?.price;

            return (
              <TableRow key={offer.id}>
                <TableCell>{formatDate(offer.createdAt)}</TableCell>
                <TableCell>
                  <p className="font-medium">{propertyTitle}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" />
                    {typeof offer.property?.location === 'string'
                      ? offer.property.location
                      : offer.property?.location?.city || 'Unknown'}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback>{applicantInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{applicantName}</p>
                      {offer.buyerEmail && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="size-3" />
                          {offer.buyerEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(amount)}</TableCell>
                <TableCell>{getStatusBadge(offer.status)}</TableCell>
                <TableCell className="text-right">
                  {statusKey(offer.status) === 'pending' ? (
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingOfferId === offer.id}
                        onClick={() => handleOfferAction(offer, 'reject')}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        disabled={updatingOfferId === offer.id}
                        onClick={() => handleOfferAction(offer, 'accept')}
                      >
                        Accept
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No actions</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const renderApplications = () => {
    if (loading) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="mx-auto mb-3 size-6 animate-spin" />
          Loading applications...
        </div>
      );
    }

    if (processes.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="size-12 mx-auto mb-4 text-gray-400 opacity-20" />
          <p className="text-muted-foreground">No active applications</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {processes.map(process => {
          const propertyTitle = process.offer?.property?.title || `Property #${process.offer?.propertyId}`;
          const applicantName = process.offer?.buyerName || process.offer?.buyerEmail || 'Applicant';
          return (
            <Card key={process.id}>
              <CardContent className="pt-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{propertyTitle}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3" />
                      {typeof process.offer?.property?.location === 'string'
                        ? process.offer.property.location
                        : process.offer?.property?.location?.city || 'Unknown'}
                    </p>
                  </div>
                  {getStatusBadge(process.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Applicant</p>
                    <p className="font-medium">{applicantName}</p>
                    {process.offer?.buyerEmail && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="size-3" />
                        {process.offer.buyerEmail}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Process Type</p>
                    <p className="font-medium">{process.processType || 'Standard checks'}</p>
                    {process.assignedTo && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="size-3" />
                        Assigned to {process.assignedTo}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-medium">Started {formatDate(process.startedAt)}</p>
                    {process.completedAt && (
                      <p className="text-xs text-muted-foreground">Completed {formatDate(process.completedAt)}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Credit Check</p>
                    <p className="font-medium">{process.creditCheck ? 'Completed' : 'Pending'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deposit</p>
                    <p className="font-medium">{formatCurrency(process.depositAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p className="font-medium">{process.paymentReference || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderContracts = () => {
    if (loading) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="mx-auto mb-3 size-6 animate-spin" />
          Loading contracts...
        </div>
      );
    }

    if (completedContracts.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="size-12 mx-auto mb-4 text-gray-400 opacity-20" />
          <p className="text-muted-foreground">No completed contracts yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {completedContracts.map(contract => {
          const applicantName = contract.offer?.buyerName || contract.offer?.buyerEmail || 'Tenant';
          return (
            <Card key={contract.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{contract.offer?.property?.title || 'Property'}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3" />
                      {typeof contract.offer?.property?.location === 'string'
                        ? contract.offer.property.location
                        : contract.offer?.property?.location?.city || 'Unknown'}
                    </p>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tenant</p>
                    <p className="font-medium">{applicantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Started</p>
                    <p className="font-medium">{formatDate(contract.startedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium">{formatDate(contract.completedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deposit</p>
                    <p className="font-medium">{formatCurrency(contract.depositAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
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
                <p className="text-sm text-muted-foreground">
                  contract{stats.activeContracts !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="offers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="offers" className="gap-2">
            <DollarSign className="size-4" />
            Rental Offers
            {stats.pendingOffers > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.pendingOffers}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2">
            <Users className="size-4" />
            Applications
            {stats.pendingApplications > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.pendingApplications}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-2">
            <FileText className="size-4" />
            Contracts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <CardTitle>Rental Offers</CardTitle>
              <CardDescription>Review and respond to offers from prospective tenants</CardDescription>
            </CardHeader>
            <CardContent>{renderOffers()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Applications & Legal Checks</CardTitle>
              <CardDescription>Track referencing, deposits, and legal progress</CardDescription>
            </CardHeader>
            <CardContent>{renderApplications()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Completed Contracts</CardTitle>
              <CardDescription>Signed agreements and deposit confirmations</CardDescription>
            </CardHeader>
            <CardContent>{renderContracts()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
