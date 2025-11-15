import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { ImageWithFallback } from './Fallback/ImageWithFallback';
import { PropertiesMapView } from './PropertiesMapView';
import { ChatWindow } from './ChatWindow';
import { mockProperties } from '../data/mockProperties';
import { Property } from '../types/property';
import { useUser } from '../contexts/UserContext';
import { getAllProperties } from '../utils/localStorage';
import { 
  Bed, Bath, Maximize, MapPin, Grid, List, Map, X, ChevronDown, ChevronUp,
  Volume2, Navigation, Train, TrendingUp, Users, DollarSign, Filter, Calculator, MessageCircle,
  Loader2, Home
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function PropertySearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [allProperties, setAllProperties] = useState<Property[]>(mockProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('price-asc');
  const [showAffordability, setShowAffordability] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // GPS Location states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGPSSearch, setIsGPSSearch] = useState(false);
  
  // Basic Filter states
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedBedrooms, setSelectedBedrooms] = useState('any');
  const [selectedType, setSelectedType] = useState('any');
  const [selectedCity, setSelectedCity] = useState('any');
  const [sizeRange, setSizeRange] = useState([0, 3000]);
  
  // Lifestyle Filter states
  const [selectedLifestyleTags, setSelectedLifestyleTags] = useState<string[]>([]);
  const [maxNoiseLevel, setMaxNoiseLevel] = useState([100]);
  const [minWalkability, setMinWalkability] = useState([0]);
  const [minTransitScore, setMinTransitScore] = useState([0]);
  
  // Commute Filter states
  const [maxCommuteTime, setMaxCommuteTime] = useState(120);
  const [commuteDestination, setCommuteDestination] = useState('');
  
  // Demographic Filter states
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([]);
  
  // Affordability Calculator states
  const [monthlyDisposableIncome, setMonthlyDisposableIncome] = useState<number>(0);
  const [affordabilityMode, setAffordabilityMode] = useState<'rent' | 'buy'>('rent');
  
  // Collapsible filter sections
  const [openSections, setOpenSections] = useState<string[]>(['basic', 'lifestyle']);

  // Get available options dynamically from properties
  const availableLifestyleTags = Array.from(
    new Set(allProperties.flatMap(p => p.lifestyleTags || []))
  ).sort();
  
  const availableCities = Array.from(
    new Set(allProperties.map(p => {
      // Handle both property structures
      if (typeof p.location === 'string') {
        // Old structure: location is a string
        return p.city || p.location?.split(',')[1]?.trim() || 'Unknown';
      } else if (p.location && typeof p.location === 'object') {
        // New structure: location is an object with city field
        return p.location.city || 'Unknown';
      }
      return p.city || 'Unknown';
    }))
  ).sort();
  
  const availableDemographics = Array.from(
    new Set(allProperties.flatMap(p => 
      p.demographics && p.demographics.ethnicityBreakdown 
        ? Object.keys(p.demographics.ethnicityBreakdown) 
        : []
    ))
  ).sort();

  // Fetch properties from localStorage on mount
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const localProperties = getAllProperties();
        console.log('📥 localStorage properties count:', localProperties.length);
        console.log('📚 Mock properties count:', mockProperties.length);
        
        // Filter only approved properties from localStorage
        const approvedLocalProperties = localProperties.filter((p: Property) => 
          p.approvalStatus === 'approved'
        );
        console.log('✅ Approved localStorage properties:', approvedLocalProperties.length);
        
        // Combine mock properties with approved localStorage properties, removing duplicates by ID
        const allPropertiesById: Record<string, Property> = {};
        
        // Add mock properties first
        mockProperties.forEach(p => {
          if (p && p.id) {
            allPropertiesById[p.id] = p;
          }
        });
        
        // Add approved localStorage properties (will override mocks with same ID)
        approvedLocalProperties.forEach((p: Property) => {
          if (p && p.id) {
            allPropertiesById[p.id] = p;
          }
        });
        
        const combined = Object.values(allPropertiesById);
        console.log('✅ Combined unique properties:', combined.length);
        console.log('🔑 Unique IDs:', Object.keys(allPropertiesById));
        
        setAllProperties(combined);
        
        // Check for GPS search parameters
        const gpsParam = searchParams.get('gps');
        const latParam = searchParams.get('lat');
        const lngParam = searchParams.get('lng');
        
        if (gpsParam === 'true' && latParam && lngParam) {
          const lat = parseFloat(latParam);
          const lng = parseFloat(lngParam);
          setUserLocation({ lat, lng });
          setIsGPSSearch(true);
          setSortBy('distance'); // Sort by distance for GPS search
          toast.success('Showing properties near your location');
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        // Use mock properties as fallback
        setAllProperties(mockProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);

  useEffect(() => {
    // Apply all filters
    let filtered = [...allProperties];

    // Price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Bedrooms filter
    if (selectedBedrooms !== 'any') {
      filtered = filtered.filter(p => p.bedrooms >= parseInt(selectedBedrooms));
    }

    // Type filter
    if (selectedType !== 'any') {
      filtered = filtered.filter(p => p.type === selectedType);
    }

    // City filter
    if (selectedCity !== 'any') {
      filtered = filtered.filter(p => {
        let propertyCity = 'Unknown';
        
        // Handle both property structures
        if (typeof p.location === 'string') {
          // Old structure: location is a string
          propertyCity = p.city || p.location?.split(',')[1]?.trim() || 'Unknown';
        } else if (p.location && typeof p.location === 'object') {
          // New structure: location is an object with city field
          propertyCity = p.location.city || 'Unknown';
        } else {
          propertyCity = p.city || 'Unknown';
        }
        
        return propertyCity === selectedCity;
      });
    }

    // Size filter
    filtered = filtered.filter(p => !p.sqft || (p.sqft >= sizeRange[0] && p.sqft <= sizeRange[1]));

    // Lifestyle tags filter
    if (selectedLifestyleTags.length > 0) {
      filtered = filtered.filter(p => 
        p.lifestyleTags && selectedLifestyleTags.every(tag => p.lifestyleTags.includes(tag))
      );
    }

    // Noise level filter
    filtered = filtered.filter(p => !p.noiseLevel || p.noiseLevel <= maxNoiseLevel[0]);

    // Walkability filter
    filtered = filtered.filter(p => !p.walkability || p.walkability >= minWalkability[0]);

    // Transit score filter
    filtered = filtered.filter(p => !p.transitScore || p.transitScore >= minTransitScore[0]);

    // Commute time filter
    if (commuteDestination) {
      filtered = filtered.filter(p => {
        if (!p.commuteOptions) return false;
        const matchingCommute = p.commuteOptions.find(c => 
          c.destination.toLowerCase().includes(commuteDestination.toLowerCase())
        );
        return matchingCommute && matchingCommute.time <= maxCommuteTime;
      });
    }

    // Demographics filter
    if (selectedDemographics.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.demographics || !p.demographics.ethnicityBreakdown) return false;
        return selectedDemographics.some(demo => 
          p.demographics.ethnicityBreakdown[demo] && p.demographics.ethnicityBreakdown[demo] > 10
        );
      });
    }

    // Affordability filter
    if (monthlyDisposableIncome > 0) {
      filtered = filtered.filter(p => {
        if (affordabilityMode === 'rent' && p.listingType === 'rent') {
          // Rent should be max 30% of disposable income
          const maxAffordableRent = monthlyDisposableIncome * 0.3;
          return p.price <= maxAffordableRent;
        } else if (affordabilityMode === 'buy' && p.listingType === 'sale') {
          // Rough calculation: assuming 25 year mortgage at 5% interest
          // Monthly payment = property price / 180 (simplified)
          const estimatedMonthly = (p.price / 180) + p.propertyTax / 12 + p.utilities + p.insurance;
          const maxAffordablePayment = monthlyDisposableIncome * 0.3;
          return estimatedMonthly <= maxAffordablePayment;
        }
        return true;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'size-asc':
        filtered.sort((a, b) => (a.sqft || 0) - (b.sqft || 0));
        break;
      case 'size-desc':
        filtered.sort((a, b) => (b.sqft || 0) - (a.sqft || 0));
        break;
      case 'walkability':
        filtered.sort((a, b) => (b.walkability || 0) - (a.walkability || 0));
        break;
      case 'investment':
        filtered.sort((a, b) => (b.investmentScore || 0) - (a.investmentScore || 0));
        break;
      case 'distance':
        if (userLocation) {
          filtered = filtered
            .map(property => {
              const coords = getPropertyCoordinates(property);
              const distance = coords 
                ? calculateDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
                : Infinity;
              return { property, distance };
            })
            .sort((a, b) => a.distance - b.distance)
            .map(item => item.property);
        }
        break;
    }

    // Final deduplication by ID before setting
    // Filter out any null/undefined properties first
    const validFiltered = filtered.filter(p => p && p.id);
    
    // Deduplicate using a simple object-based approach
    const propertyMap: Record<string, Property> = {};
    validFiltered.forEach(p => {
      propertyMap[p.id] = p;
    });
    const uniqueFiltered = Object.values(propertyMap);
    
    setFilteredProperties(uniqueFiltered);
  }, [
    allProperties, priceRange, selectedBedrooms, selectedType, selectedCity, sizeRange,
    selectedLifestyleTags, maxNoiseLevel, minWalkability, minTransitScore,
    maxCommuteTime, commuteDestination, selectedDemographics,
    monthlyDisposableIncome, affordabilityMode, sortBy
  ]);

  const clearFilters = () => {
    setPriceRange([0, 2000000]);
    setSelectedBedrooms('any');
    setSelectedType('any');
    setSelectedCity('any');
    setSizeRange([0, 3000]);
    setSelectedLifestyleTags([]);
    setMaxNoiseLevel([100]);
    setMinWalkability([0]);
    setMinTransitScore([0]);
    setMaxCommuteTime(120);
    setCommuteDestination('');
    setSelectedDemographics([]);
    setMonthlyDisposableIncome(0);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const toggleLifestyleTag = (tag: string) => {
    setSelectedLifestyleTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleDemographic = (demo: string) => {
    setSelectedDemographics(prev =>
      prev.includes(demo) ? prev.filter(d => d !== demo) : [...prev, demo]
    );
  };

  const handleMessageLandlord = (property: Property, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    
    if (!isAuthenticated) {
      toast.error('Please sign in to message the landlord');
      navigate('/login');
      return;
    }

    setSelectedProperty(property);
    setShowChatDialog(true);
  };

  // Helper function to get location string from property
  const getLocationString = (property: Property): string => {
    if (typeof property.location === 'string') {
      return property.location;
    } else if (property.location && typeof property.location === 'object') {
      return `${property.location.address}, ${property.location.city}`;
    }
    return property.city || 'Location not specified';
  };
  
  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Get property coordinates
  const getPropertyCoordinates = (property: Property): { lat: number; lng: number } | null => {
    if (property.coordinates?.lat && property.coordinates?.lng) {
      return property.coordinates;
    }
    if (property.location && typeof property.location === 'object' && property.location.coordinates) {
      return property.location.coordinates;
    }
    return null;
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
      <div className="aspect-video relative">
        {property.images && property.images.length > 0 ? (
          <ImageWithFallback
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Home className="size-16 text-gray-400" />
          </div>
        )}
        <Badge className="absolute top-2 right-2">
          {(property.listingType || property.type) === 'rent' ? 'For Rent' : 'For Sale'}
        </Badge>
        {property.investmentScore && (
          <Badge className="absolute top-2 left-2 bg-green-600">
            Investment Score: {property.investmentScore}
          </Badge>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{property.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {getLocationString(property)}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xl">£{property.price.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{(property.listingType || property.type) === 'rent' ? '/month' : ''}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {property.bathrooms}
          </span>
          {(property.sqft || property.area) && (
            <span className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              {property.sqft || property.area} sqft
            </span>
          )}
        </div>
        
        {/* Lifestyle and Scores */}
        {property.lifestyleTags && Array.isArray(property.lifestyleTags) && property.lifestyleTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {property.lifestyleTags.slice(0, 3).map((tag, idx) => (
              <Badge key={`${property.id}-${tag}-${idx}`} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
        
        {/* Show neighborhood tags if lifestyleTags don't exist but neighborhoodVibe tags do */}
        {(!property.lifestyleTags || property.lifestyleTags.length === 0) && 
         property.neighborhoodVibe?.tags && property.neighborhoodVibe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {property.neighborhoodVibe.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={`${property.id}-${tag}-${idx}`} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
        
        {(property.noiseLevel !== undefined || 
          property.neighborhoodVibe?.noiseLevel !== undefined || 
          property.walkability !== undefined || 
          property.lifestyleScores?.walkScore !== undefined ||
          property.transitScore !== undefined ||
          property.lifestyleScores?.transitScore !== undefined) && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            {(property.noiseLevel !== undefined || property.neighborhoodVibe?.noiseLevel !== undefined) && (
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-gray-500">Noise</p>
                <p>
                  {property.neighborhoodVibe?.noiseLevel 
                    ? property.neighborhoodVibe.noiseLevel === 'quiet' ? 'Quiet' 
                      : property.neighborhoodVibe.noiseLevel === 'moderate' ? 'Moderate' 
                      : 'Noisy'
                    : `${property.noiseLevel}/100`}
                </p>
              </div>
            )}
            {(property.walkability !== undefined || property.lifestyleScores?.walkScore !== undefined) && (
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-gray-500">Walk</p>
                <p>{property.lifestyleScores?.walkScore || property.walkability}/100</p>
              </div>
            )}
            {(property.transitScore !== undefined || property.lifestyleScores?.transitScore !== undefined) && (
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-gray-500">Transit</p>
                <p>{property.lifestyleScores?.transitScore || property.transitScore}/100</p>
              </div>
            )}
          </div>
        )}

        {/* Show commute options from both structures */}
        {((property.commuteOptions && Array.isArray(property.commuteOptions) && property.commuteOptions.length > 0) ||
          (property.commuteOptions && typeof property.commuteOptions === 'object' && property.commuteOptions.trainStation)) && (
          <div className="text-xs text-gray-600">
            <p className="flex items-center gap-1">
              <Train className="h-3 w-3" />
              {Array.isArray(property.commuteOptions) 
                ? `${property.commuteOptions[0]?.destination}: ${property.commuteOptions[0]?.time} min`
                : property.commuteOptions.trainStation 
                  ? `${property.commuteOptions.trainStation.name} - ${property.commuteOptions.trainStation.walkTime}`
                  : 'Commute info available'}
            </p>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/property/${property.id}`);
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Advanced Filters Sidebar */}
          <aside className="lg:w-80 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <CardContent className="space-y-4">
                  
                  {/* Affordability Calculator */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between p-0 h-auto hover:bg-transparent"
                      onClick={() => setShowAffordability(!showAffordability)}
                    >
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-blue-600" />
                        <span>Affordability Filter</span>
                      </div>
                      {showAffordability ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    
                    {showAffordability && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <Label className="text-xs">Monthly Disposable Income (£)</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 3000"
                            value={monthlyDisposableIncome || ''}
                            onChange={(e) => setMonthlyDisposableIncome(Number(e.target.value))}
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            After all expenses (food, bills, savings)
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs">Looking to:</Label>
                          <Select value={affordabilityMode} onValueChange={(v: 'rent' | 'buy') => setAffordabilityMode(v)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rent">Rent</SelectItem>
                              <SelectItem value="buy">Buy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {monthlyDisposableIncome > 0 && (
                          <div className="text-xs p-2 bg-white rounded">
                            <p className="text-green-600">
                              Max affordable: £{Math.floor(monthlyDisposableIncome * 0.3).toLocaleString()}/mo
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Basic Filters */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto"
                      onClick={() => toggleSection('basic')}
                    >
                      <span>Basic Filters</span>
                      {openSections.includes('basic') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {openSections.includes('basic') && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label className="text-sm">City</Label>
                          <Select value={selectedCity} onValueChange={setSelectedCity}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any City</SelectItem>
                              {availableCities.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm">Property Type</Label>
                          <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any Type</SelectItem>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="condo">Condo</SelectItem>
                              <SelectItem value="townhouse">Townhouse</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm">Bedrooms</Label>
                          <Select value={selectedBedrooms} onValueChange={setSelectedBedrooms}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="1">1+</SelectItem>
                              <SelectItem value="2">2+</SelectItem>
                              <SelectItem value="3">3+</SelectItem>
                              <SelectItem value="4">4+</SelectItem>
                              <SelectItem value="5">5+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm">
                            Price Range: £{priceRange[0].toLocaleString()} - £{priceRange[1].toLocaleString()}
                          </Label>
                          <Slider
                            min={0}
                            max={2000000}
                            step={10000}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">
                            Size: {sizeRange[0]} - {sizeRange[1]} sqft
                          </Label>
                          <Slider
                            min={0}
                            max={3000}
                            step={50}
                            value={sizeRange}
                            onValueChange={setSizeRange}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Lifestyle Filters */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto"
                      onClick={() => toggleSection('lifestyle')}
                    >
                      <span>Lifestyle & Vibe</span>
                      {openSections.includes('lifestyle') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {openSections.includes('lifestyle') && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label className="text-sm mb-2 block">Neighborhood Vibe</Label>
                          <div className="flex flex-wrap gap-2">
                            {availableLifestyleTags.map(tag => (
                              <Badge
                                key={tag}
                                variant={selectedLifestyleTags.includes(tag) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleLifestyleTag(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm flex items-center gap-1">
                            <Volume2 className="h-3 w-3" />
                            Max Noise Level: {maxNoiseLevel[0]}/100
                          </Label>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={maxNoiseLevel}
                            onValueChange={setMaxNoiseLevel}
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            0 = Very quiet, 50 = Moderate, 100 = Very noisy
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            Min Walkability: {minWalkability[0]}/100
                          </Label>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={minWalkability}
                            onValueChange={setMinWalkability}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label className="text-sm flex items-center gap-1">
                            <Train className="h-3 w-3" />
                            Min Transit Score: {minTransitScore[0]}/100
                          </Label>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={minTransitScore}
                            onValueChange={setMinTransitScore}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Commute Filters */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto"
                      onClick={() => toggleSection('commute')}
                    >
                      <span>Commute Options</span>
                      {openSections.includes('commute') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {openSections.includes('commute') && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label className="text-sm">Destination</Label>
                          <Input
                            placeholder="e.g., City Centre"
                            value={commuteDestination}
                            onChange={(e) => setCommuteDestination(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            Max Commute Time: {maxCommuteTime} min
                          </Label>
                          <Slider
                            min={0}
                            max={120}
                            step={5}
                            value={[maxCommuteTime]}
                            onValueChange={([v]) => setMaxCommuteTime(v)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Demographics Filters */}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto"
                      onClick={() => toggleSection('demographics')}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Demographics</span>
                      </div>
                      {openSections.includes('demographics') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {openSections.includes('demographics') && (
                      <div className="mt-4">
                        <Label className="text-sm mb-2 block">Community Demographics</Label>
                        <div className="flex flex-wrap gap-2">
                          {availableDemographics.map(demo => (
                            <Badge
                              key={demo}
                              variant={selectedDemographics.includes(demo) ? "default" : "outline"}
                              className="cursor-pointer text-xs"
                              onClick={() => toggleDemographic(demo)}
                            >
                              {demo}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Shows areas where selected groups comprise 10%+ of population
                        </p>
                      </div>
                    )}
                  </div>

                </CardContent>
              </ScrollArea>
            </Card>
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl">{filteredProperties.length} Properties Found</h2>
                <p className="text-gray-600">
                  {selectedLifestyleTags.length > 0 && `${selectedLifestyleTags.join(', ')} • `}
                  {selectedCity !== 'any' && `${selectedCity} • `}
                  Matching your preferences
                </p>
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="size-asc">Size: Small to Large</SelectItem>
                    <SelectItem value="size-desc">Size: Large to Small</SelectItem>
                    <SelectItem value="walkability">Best Walkability</SelectItem>
                    <SelectItem value="investment">Best Investment</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Affordability Banner - Show if user hasn't set up profile */}
            {user && (!user.affordabilityResult || !user.income) && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Calculator className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2">💡 Set Up Your Affordability Profile</h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Get personalized property recommendations based on your budget. Our AI calculator helps you find homes within your financial comfort zone.
                      </p>
                      <Button 
                        onClick={() => navigate('/profile')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Affordability
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Show affordability status if profile is set */}
            {user && user.affordabilityResult && user.income && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm">
                          <strong>Your Budget:</strong> {user.preferredPropertyType === 'buy' ? (
                            <>Up to £{user.affordabilityResult.maxPropertyPrice?.toLocaleString()}</>
                          ) : (
                            <>Up to £{user.affordabilityResult.maxMonthlyRent?.toLocaleString()}/mo</>
                          )}
                        </p>
                        <p className="text-xs text-gray-600">
                          {filteredProperties.filter(p => {
                            if (user.preferredPropertyType === 'buy' && p.listingType === 'sale') {
                              return p.price <= (user.affordabilityResult?.maxPropertyPrice || 0);
                            } else if (user.preferredPropertyType === 'rent' && p.listingType === 'rent') {
                              return p.price <= (user.affordabilityResult?.maxMonthlyRent || 0);
                            }
                            return false;
                          }).length} affordable properties in this search
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/profile')}
                    >
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {viewMode === 'map' ? (
              <PropertiesMapView properties={filteredProperties} />
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-600 mb-4">No properties found matching your criteria</p>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your filters</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Chat Dialog */}
      {selectedProperty && (
        <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
          <DialogContent className="max-w-2xl h-[600px] p-0">
            <DialogTitle className="sr-only">
              Message {selectedProperty.listingType === 'rent' ? 'Landlord' : 'Property Owner'}
            </DialogTitle>
            <ChatWindow
              otherUserId={`landlord-${selectedProperty.id}`}
              otherUserName={selectedProperty.listingType === 'rent' ? 'Landlord' : 'Property Owner'}
              propertyId={selectedProperty.id}
              onClose={() => setShowChatDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}