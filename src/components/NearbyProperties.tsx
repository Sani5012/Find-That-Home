import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ImageWithFallback } from './Fallback/ImageWithFallback';
import { PropertiesMapView } from './PropertiesMapView';
import { NearbyPropertiesMap } from './NearbyPropertiesMap';
import { ChatWindow } from './ChatWindow';
import { useGPSLocation } from '../hooks/useGPSLocation';
import { mockProperties } from '../data/mockProperties';
import { Property } from '../types/property';
import { useUser } from '../contexts/UserContext';
import { getAllProperties } from '../utils/localStorage';
import { 
  MapPin, Navigation, Bed, Bath, Maximize, DollarSign, Grid, Map,
  Info, Bell, BellOff, Volume2, Train, TrendingUp, Users, MessageCircle,
  Target, Loader2, Sparkles, AlertCircle, ChevronDown, List, Home, Car, Radius
} from 'lucide-react';
import { toast } from 'sonner';

interface UserPreferences {
  propertyType?: string[];
  priceRange?: { min: number; max: number };
  locations?: string[];
  bedrooms?: number;
}

export function NearbyProperties() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const { location, loading, error, requestLocation, findNearbyProperties } = useGPSLocation();
  const [searchRadius, setSearchRadius] = useState([5]); // miles
  const [customRadius, setCustomRadius] = useState('5'); // for input field
  const [showAdvancedRadius, setShowAdvancedRadius] = useState(false);
  const [showRadiusGuide, setShowRadiusGuide] = useState(() => {
    return !localStorage.getItem('hasSeenRadiusGuide');
  });
  const [gpsAlertsEnabled, setGpsAlertsEnabled] = useState(() => {
    return localStorage.getItem('gpsAlertsEnabled') === 'true';
  });
  const [notifiedProperties, setNotifiedProperties] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('notifiedProperties');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');

  // Get user preferences from localStorage
  const userPreferences = useMemo((): UserPreferences | null => {
    const stored = localStorage.getItem('userPreferences');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const [allProperties, setAllProperties] = useState<Property[]>(mockProperties);

  // Fetch all properties on mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const localProperties = getAllProperties();
        // Combine mock and localStorage properties
        setAllProperties([...mockProperties, ...localProperties]);
      } catch (error) {
        console.error('Error fetching properties:', error);
        // Use mock as fallback
        setAllProperties(mockProperties);
      }
    };

    fetchProperties();
  }, []);

  // Find nearby properties
  const nearbyProperties = useMemo(() => {
    if (!location) return [];
    
    let nearby = findNearbyProperties(allProperties, searchRadius[0]);

    // Apply user preferences for AI-powered filtering
    if (userPreferences) {
      nearby = nearby.filter(property => {
        // Price range filter
        if (userPreferences.priceRange) {
          const [minPrice, maxPrice] = userPreferences.priceRange;
          if (property.price < minPrice || property.price > maxPrice) {
            return false;
          }
        }

        // Bedroom filter
        if (userPreferences.bedrooms && userPreferences.bedrooms.length > 0) {
          if (!userPreferences.bedrooms.includes(property.bedrooms)) {
            return false;
          }
        }

        // Property type filter
        if (userPreferences.propertyTypes && userPreferences.propertyTypes.length > 0) {
          if (!userPreferences.propertyTypes.includes(property.type)) {
            return false;
          }
        }

        // Lifestyle filters
        if (userPreferences.lifestyle) {
          const { maxNoiseLevel, minWalkability, preferredVibes } = userPreferences.lifestyle;
          
          if (maxNoiseLevel !== undefined && property.noiseLevel > maxNoiseLevel) {
            return false;
          }
          
          if (minWalkability !== undefined && property.walkability < minWalkability) {
            return false;
          }
          
          if (preferredVibes && preferredVibes.length > 0) {
            const hasMatchingVibe = property.lifestyleTags.some(tag => 
              preferredVibes.includes(tag)
            );
            if (!hasMatchingVibe) {
              return false;
            }
          }
        }

        return true;
      });
    }

    return nearby;
  }, [location, findNearbyProperties, searchRadius, userPreferences, allProperties]);

  // GPS Alerts - notify user when near a property
  useEffect(() => {
    if (!gpsAlertsEnabled || !location || nearbyProperties.length === 0) return;

    const veryNearby = nearbyProperties.filter(p => p.distance <= 0.5); // Within 0.5 miles

    veryNearby.forEach(property => {
      if (!notifiedProperties.has(property.id)) {
        toast.success(`You're near a property!`, {
          description: `${property.title} is ${property.distance.toFixed(2)} miles away`,
          action: {
            label: 'View',
            onClick: () => navigate(`/property/${property.id}`),
          },
          duration: 8000,
        });

        setNotifiedProperties(prev => {
          const updated = new Set(prev);
          updated.add(property.id);
          localStorage.setItem('notifiedProperties', JSON.stringify([...updated]));
          return updated;
        });
      }
    });
  }, [nearbyProperties, gpsAlertsEnabled, location, notifiedProperties, navigate]);

  // Toggle GPS alerts
  const toggleGPSAlerts = (enabled: boolean) => {
    setGpsAlertsEnabled(enabled);
    localStorage.setItem('gpsAlertsEnabled', enabled.toString());
    
    if (enabled) {
      requestLocation();
      toast.success('GPS alerts enabled');
    } else {
      toast.info('GPS alerts disabled');
    }
  };

  // Handle custom radius input
  const handleCustomRadiusChange = (value: string) => {
    setCustomRadius(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 500) {
      setSearchRadius([numValue]);
    }
  };

  // Set preset radius
  const setPresetRadius = (miles: number) => {
    setSearchRadius([miles]);
    setCustomRadius(miles.toString());
    if (showRadiusGuide) {
      setShowRadiusGuide(false);
      localStorage.setItem('hasSeenRadiusGuide', 'true');
    }
  };

  // Sync slider changes to input
  const handleSliderChange = (value: number[]) => {
    setSearchRadius(value);
    setCustomRadius(value[0].toString());
  };

  // Get distance context
  const getDistanceContext = (miles: number): string => {
    if (miles <= 1) return "Walking/cycling distance - your immediate neighborhood";
    if (miles <= 5) return "Short drive or bike ride - local area";
    if (miles <= 10) return "Quick commute - same town/city";
    if (miles <= 25) return "Reasonable commute - nearby towns";
    if (miles <= 50) return "Regional search - neighboring cities";
    if (miles <= 100) return "Wide area - covers multiple cities";
    return "State/regional level search - very large area";
  };

  // AI Recommendation Score
  const getRecommendationScore = (property: Property): number => {
    if (!userPreferences) return 50;

    let score = 0;
    let factors = 0;

    // Distance factor (closer is better)
    if (property.distance <= 1) score += 25;
    else if (property.distance <= 3) score += 15;
    else if (property.distance <= 5) score += 5;
    factors++;

    // Lifestyle match
    if (userPreferences.lifestyle?.preferredVibes) {
      const matchingVibes = property.lifestyleTags.filter(tag =>
        userPreferences.lifestyle.preferredVibes?.includes(tag)
      ).length;
      score += (matchingVibes / userPreferences.lifestyle.preferredVibes.length) * 25;
      factors++;
    }

    // Walkability/Transit
    if (userPreferences.lifestyle?.minWalkability) {
      const walkabilityMatch = (property.walkability / 100) * 20;
      score += walkabilityMatch;
      factors++;
    }

    // Price value
    if (userPreferences.priceRange) {
      const [minPrice, maxPrice] = userPreferences.priceRange;
      const midPoint = (minPrice + maxPrice) / 2;
      const priceDiff = Math.abs(property.price - midPoint);
      const priceScore = Math.max(0, 15 - (priceDiff / midPoint) * 15);
      score += priceScore;
      factors++;
    }

    // Investment potential
    if (property.investmentScore) {
      score += (property.investmentScore / 100) * 15;
      factors++;
    }

    return Math.round(score);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="size-8 text-blue-600" />
          <h1>AI-Powered Nearby Properties</h1>
        </div>
        <p className="text-muted-foreground">
          Discover properties near you based on your location and preferences
        </p>
      </div>

      {/* GPS Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="size-5" />
                Location Settings
              </CardTitle>
              <CardDescription>
                Enable GPS to find properties near you
              </CardDescription>
            </div>
            <Button 
              onClick={requestLocation} 
              disabled={loading}
              variant="outline"
            >
              <MapPin className="size-4 mr-2" />
              {loading ? 'Getting Location...' : 'Update Location'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {location && (
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <MapPin className="size-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm">Location Found</p>
                <p className="text-xs text-muted-foreground">
                  Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                  {location.accuracy && ` (±${Math.round(location.accuracy)}m)`}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Radius className="size-4" />
                  Search Radius
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Set how far you want to search for properties. You can enter any distance from 0.5 to 500 miles, or use the quick preset buttons below.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={customRadius}
                    onChange={(e) => handleCustomRadiusChange(e.target.value)}
                    min="0.5"
                    max="500"
                    step="0.5"
                    className="w-24 h-8 text-center"
                    placeholder="Miles"
                  />
                  <span className="text-sm text-muted-foreground">miles</span>
                </div>
              </div>

              {/* First-time user guide */}
              {showRadiusGuide && (
                <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
                  <Sparkles className="size-4 text-blue-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold text-blue-900">🎯 Choose Your Search Distance</p>
                      <p className="text-sm text-blue-800">
                        Search from 0.5 to 500 miles! Use quick presets below or enter a custom distance. The map will auto-adjust to show your coverage area.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          setShowRadiusGuide(false);
                          localStorage.setItem('hasSeenRadiusGuide', 'true');
                        }}
                      >
                        Got it!
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Distance Category Helper */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                  <div className="font-semibold text-green-700">Local</div>
                  <div className="text-green-600">1-10 mi</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="font-semibold text-blue-700">Regional</div>
                  <div className="text-blue-600">10-50 mi</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded border border-purple-200">
                  <div className="font-semibold text-purple-700">Wide Area</div>
                  <div className="text-purple-600">50+ mi</div>
                </div>
              </div>

              {/* Preset Distance Buttons */}
              <div className="flex flex-wrap gap-2">
                {[1, 5, 10, 25, 50, 100].map((distance) => (
                  <Button
                    key={distance}
                    variant={searchRadius[0] === distance ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPresetRadius(distance)}
                    className="flex-1 min-w-[60px]"
                  >
                    {distance}mi
                  </Button>
                ))}
              </div>

              {/* Slider for quick adjustments */}
              <div>
                <Slider
                  value={searchRadius}
                  onValueChange={handleSliderChange}
                  min={0.5}
                  max={100}
                  step={0.5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.5mi</span>
                  <span>50mi</span>
                  <span>100mi</span>
                </div>
              </div>

              {/* Distance Context Info */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="size-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-blue-900">
                      {searchRadius[0]} mile radius
                    </div>
                    <div className="text-xs text-blue-700 mt-0.5">
                      {getDistanceContext(searchRadius[0])}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Coverage: ~{(Math.PI * Math.pow(searchRadius[0], 2)).toFixed(0)} sq mi
                    </div>
                  </div>
                </div>
                {location && (
                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                    <span className="text-sm text-blue-900">
                      <strong>{nearbyProperties.length}</strong> {nearbyProperties.length === 1 ? 'property' : 'properties'} found
                    </span>
                    {nearbyProperties.length > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                        {(nearbyProperties.length / searchRadius[0]).toFixed(1)} per mile
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Distance info */}
              {searchRadius[0] > 50 && (
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    Searching over long distances may include many properties. Consider refining your preferences for better results.
                  </AlertDescription>
                </Alert>
              )}

              {/* Advanced Distance Options */}
              <Collapsible open={showAdvancedRadius} onOpenChange={setShowAdvancedRadius}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    <span className="text-sm">Advanced Distance Options</span>
                    <ChevronDown className={`size-4 transition-transform ${showAdvancedRadius ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[150, 200, 250, 300, 400, 500].map((distance) => (
                        <Button
                          key={distance}
                          variant={searchRadius[0] === distance ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPresetRadius(distance)}
                        >
                          {distance} miles
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Custom Distance (up to 500 miles)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={customRadius}
                          onChange={(e) => handleCustomRadiusChange(e.target.value)}
                          min="0.5"
                          max="500"
                          step="1"
                          className="flex-1"
                          placeholder="Enter custom distance"
                        />
                        <Button
                          variant="secondary"
                          onClick={() => {
                            const numValue = parseFloat(customRadius);
                            if (!isNaN(numValue) && numValue > 0 && numValue <= 500) {
                              setSearchRadius([numValue]);
                              toast.success(`Search radius set to ${numValue} miles`);
                            } else {
                              toast.error('Please enter a valid distance between 0.5 and 500 miles');
                            }
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="size-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 text-xs">
                        Very long distances (100+ miles) are useful for regional searches but may return many results. Use filters to narrow down.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  {gpsAlertsEnabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}
                  GPS Proximity Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when you're near a property (within 0.5 miles)
                </p>
              </div>
              <Switch
                checked={gpsAlertsEnabled}
                onCheckedChange={toggleGPSAlerts}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Properties List/Map */}
      {location && nearbyProperties.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2>Found {nearbyProperties.length} {nearbyProperties.length === 1 ? 'Property' : 'Properties'} Nearby</h2>
              {userPreferences && (
                <Badge variant="secondary" className="flex items-center gap-1 mt-2">
                  <Sparkles className="size-3" />
                  AI Matched to Your Preferences
                </Badge>
              )}
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="flex items-center gap-2"
              >
                <Map className="size-4" />
                Map
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="size-4" />
                List
              </Button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <NearbyPropertiesMap
              properties={nearbyProperties}
              userLocation={location}
              searchRadius={searchRadius[0]}
            />
          ) : (
            <div className="grid gap-4">
            {nearbyProperties.map((property) => {
              const aiScore = getRecommendationScore(property);
              
              return (
                <Card 
                  key={property.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/property/${property.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="relative w-48 h-32 flex-shrink-0">
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Badge className="absolute top-2 left-2 bg-blue-600">
                          {property.distance.toFixed(2)} mi
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="mb-1">{property.title}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="size-3" />
                                {property.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl text-blue-600">
                                £{property.price.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {property.listingType === 'rent' ? 'per month' : 'purchase'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Bed className="size-4 text-muted-foreground" />
                            <span>{property.bedrooms} bed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="size-4 text-muted-foreground" />
                            <span>{property.type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Car className="size-4 text-muted-foreground" />
                            <span>{property.walkability}/100 walkability</span>
                          </div>
                        </div>

                        {/* AI Score & Tags */}
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={aiScore >= 70 ? 'default' : 'secondary'}
                            className="flex items-center gap-1"
                          >
                            <Sparkles className="size-3" />
                            AI Match: {aiScore}%
                          </Badge>
                          {property.investmentScore && property.investmentScore >= 75 && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <TrendingUp className="size-3" />
                              High Investment Potential
                            </Badge>
                          )}
                          {property.lifestyleTags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/property/${property.id}`);
                            }}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open directions in maps
                              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${property.coordinates.lat},${property.coordinates.lng}`;
                              window.open(mapsUrl, '_blank');
                            }}
                          >
                            <Navigation className="size-4 mr-1" />
                            Directions
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isAuthenticated) {
                                toast.error('Please sign in to message the landlord');
                                navigate('/login');
                                return;
                              }
                              setSelectedProperty(property);
                              setShowChatDialog(true);
                            }}
                          >
                            <MessageCircle className="size-4 mr-1" />
                            Message
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
        </div>
      ) : location && nearbyProperties.length === 0 ? (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            No properties found within {searchRadius[0]} miles. Try increasing the search radius.
          </AlertDescription>
        </Alert>
      ) : !location ? (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            Click "Update Location" to find nearby properties
          </AlertDescription>
        </Alert>
      ) : null}

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