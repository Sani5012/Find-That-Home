import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { LocationSearchDropdown } from './LocationSearchDropdown';
import { AffordabilityCalculator } from './AffordabilityCalculator';
import { getAllProperties } from '../utils/localStorage';
import { useUser } from '../contexts/UserContext';
import { ImageWithFallback } from './Fallback/ImageWithFallback';
import { 
  Home, TrendingUp, DollarSign, Eye, Heart, ShoppingCart, FileText,
  CheckCircle, Clock, MapPin, Calculator, Bell, AlertCircle, Search,
  Navigation, Building2, Sparkles, ArrowRight, Star, BarChart3
} from 'lucide-react';

export function BuyerDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [properties, setProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load properties
  useEffect(() => {
    const allProps = getAllProperties();
    const approvedProps = allProps.filter(p => p.status === 'approved' || !p.status);
    setProperties(approvedProps);
  }, []);

  // Mock data for buyer offers
  const [offers] = useState([
    {
      id: 'offer-1',
      propertyId: '7',
      property: properties[0],
      offeredPrice: 1200000,
      offerDate: '2025-10-26',
      status: 'pending',
      expiryDate: '2025-11-02',
    },
    {
      id: 'offer-2',
      propertyId: '8',
      property: properties[1],
      offeredPrice: 850000,
      offerDate: '2025-10-20',
      status: 'accepted',
      expiryDate: '2025-10-27',
      completionProgress: 45,
    },
  ]);

  const [viewedProperties] = useState(
    properties.filter(p => p.listingType === 'sale').slice(0, 4)
  );

  const [savedProperties] = useState(
    properties.filter(p => p.listingType === 'sale').slice(0, 3)
  );

  const stats = useMemo(() => ({
    pendingOffers: offers.filter(o => o.status === 'pending').length,
    acceptedOffers: offers.filter(o => o.status === 'accepted').length,
    savedProperties: savedProperties.length,
    viewedProperties: viewedProperties.length,
  }), [offers, savedProperties, viewedProperties]);

  const featuredProperties = properties
    .filter(p => p.listingType === 'sale')
    .slice(0, 3);

  const recentlyViewed = properties.slice(0, 4);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getLocationString = (property: any): string => {
    if (typeof property.location === 'string') {
      return property.location;
    }
    if (property.location && typeof property.location === 'object') {
      return `${property.location.address || ''}, ${property.location.city || ''}`.trim();
    }
    return 'Location not specified';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Home className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="mb-1">Welcome back, {user?.name}!</h1>
                  <p className="text-blue-100">
                    Ready to find your dream home? Let's get started!
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Sparkles className="h-24 w-24 text-white/20" />
            </div>
          </div>
        </div>

        {/* Quick Search Section */}
        <Card className="mb-8 shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Quick Property Search
            </CardTitle>
            <CardDescription>
              Find your perfect home with AI-powered search or GPS location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="text">
                  <Search className="h-4 w-4 mr-2" />
                  Text Search
                </TabsTrigger>
                <TabsTrigger value="location">
                  <Navigation className="h-4 w-4 mr-2" />
                  Location
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text">
                <div className="flex gap-3">
                  <Input
                    placeholder="Describe your ideal home..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="text-lg py-6"
                  />
                  <Button 
                    onClick={handleSearch} 
                    size="lg" 
                    className="px-8"
                    disabled={!searchQuery.trim()}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="location">
                <LocationSearchDropdown />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/search')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700">Pending Offers</p>
                  <p className="text-4xl mt-1 text-orange-900">{stats.pendingOffers}</p>
                  <p className="text-xs text-orange-600 mt-1">Awaiting response</p>
                </div>
                <Clock className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Accepted Offers</p>
                  <p className="text-4xl mt-1 text-green-900">{stats.acceptedOffers}</p>
                  <p className="text-xs text-green-600 mt-1">In progress</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Saved Properties</p>
                  <p className="text-4xl mt-1 text-red-900">{stats.savedProperties}</p>
                  <p className="text-xs text-red-600 mt-1">Your favorites</p>
                </div>
                <Heart className="h-12 w-12 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Viewed Recently</p>
                  <p className="text-4xl mt-1 text-blue-900">{stats.viewedProperties}</p>
                  <p className="text-xs text-blue-600 mt-1">This week</p>
                </div>
                <Eye className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate('/search')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2">Browse Properties</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Explore all available properties
                </p>
                <Button variant="outline" className="w-full group-hover:bg-blue-50">
                  Start Searching
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate('/nearby')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Navigation className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2">Nearby Properties</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Find homes near your location
                </p>
                <Button variant="outline" className="w-full group-hover:bg-green-50">
                  Use GPS Search
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate('/market-intelligence')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-2">Market Insights</h3>
                <p className="text-sm text-gray-600 mb-4">
                  View trends and analytics
                </p>
                <Button variant="outline" className="w-full group-hover:bg-purple-50">
                  View Intelligence
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="offers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="offers" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              My Offers
            </TabsTrigger>
            <TabsTrigger value="affordability" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Affordability
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          {/* My Offers Tab */}
          <TabsContent value="offers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Active Offers
                </CardTitle>
                <CardDescription>
                  Track the status of your property offers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {offers.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">You haven't made any offers yet</p>
                    <Button onClick={() => navigate('/search')}>
                      Browse Properties
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.map(offer => (
                      <Card key={offer.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="mb-1">{offer.property?.title || 'Property'}</h3>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {typeof offer.property?.location === 'string' 
                                  ? offer.property.location 
                                  : offer.property?.location?.city || 'Unknown'}
                              </p>
                            </div>
                            <Badge 
                              variant={offer.status === 'accepted' ? 'default' : 'secondary'}
                              className={offer.status === 'accepted' ? 'bg-green-500' : 'bg-orange-500'}
                            >
                              {offer.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Your Offer</p>
                              <p className="text-lg">£{offer.offeredPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Offer Date</p>
                              <p className="text-lg">{offer.offerDate}</p>
                            </div>
                          </div>

                          {offer.status === 'accepted' && offer.completionProgress !== undefined && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span>Completion Progress</span>
                                <span>{offer.completionProgress}%</span>
                              </div>
                              <Progress value={offer.completionProgress} className="h-2" />
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => navigate(`/property/${offer.propertyId}`)}
                            >
                              View Property
                            </Button>
                            {offer.status === 'accepted' && (
                              <Button 
                                className="flex-1"
                                onClick={() => navigate(`/purchase/${offer.propertyId}`)}
                              >
                                Continue Purchase
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Affordability Calculator Tab */}
          <TabsContent value="affordability" className="space-y-4">
            <AffordabilityCalculator />
          </TabsContent>

          {/* Featured Properties Tab */}
          <TabsContent value="featured" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Featured Properties
                </CardTitle>
                <CardDescription>
                  Handpicked properties just for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {featuredProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No featured properties available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredProperties.map(property => (
                      <Card 
                        key={property.id}
                        className="cursor-pointer hover:shadow-xl transition-shadow border-2 hover:border-blue-400"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                          {property.images && property.images[0] ? (
                            <ImageWithFallback
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                              <Home className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <CardContent className="pt-4">
                          <h4 className="mb-2 truncate">{property.title}</h4>
                          <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{getLocationString(property)}</span>
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl text-blue-600">
                                £{property.price.toLocaleString()}
                              </p>
                            </div>
                            <Badge>{property.bedrooms} bed</Badge>
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
          <TabsContent value="saved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Saved Properties
                </CardTitle>
                <CardDescription>
                  Properties you've bookmarked
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">You haven't saved any properties yet</p>
                    <Button onClick={() => navigate('/search')}>
                      <Search className="h-4 w-4 mr-2" />
                      Find Properties
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {savedProperties.map(property => (
                      <Card 
                        key={property.id}
                        className="cursor-pointer hover:shadow-xl transition-shadow"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden relative">
                          {property.images && property.images[0] ? (
                            <ImageWithFallback
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                              <Home className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Remove from saved
                            }}
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                        <CardContent className="pt-4">
                          <h4 className="mb-2 truncate">{property.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {getLocationString(property)}
                          </p>
                          <p className="text-xl text-blue-600">
                            £{property.price.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recently Viewed Tab */}
          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Recently Viewed
                </CardTitle>
                <CardDescription>
                  Properties you've checked out recently
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentlyViewed.length === 0 ? (
                  <div className="text-center py-12">
                    <Eye className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No recently viewed properties</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentlyViewed.map(property => (
                      <Card 
                        key={property.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        <div className="flex gap-4 p-4">
                          <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                            {property.images && property.images[0] ? (
                              <ImageWithFallback
                                src={property.images[0]}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                <Home className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="mb-1 truncate">{property.title}</h4>
                            <p className="text-sm text-gray-600 mb-2 truncate">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {getLocationString(property)}
                            </p>
                            <p className="text-lg text-blue-600">
                              £{property.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}