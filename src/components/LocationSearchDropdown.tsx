import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Property } from '../types/property';
import { propertyStore } from '../services/platformData';
import { useNavigate } from 'react-router-dom';

interface LocationSearchDropdownProps {
  onPropertySelect?: (property: Property) => void;
}

export function LocationSearchDropdown({ onPropertySelect }: LocationSearchDropdownProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load all properties
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const properties = await propertyStore.getApproved();
        if (isMounted) {
          setAllProperties(properties);
        }
      } catch (error) {
        console.error('Failed to load properties', error);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Get property location string
  const getLocationString = (property: Property): string => {
    if (typeof property.location === 'string') {
      return property.location;
    }
    if (property.location && typeof property.location === 'object') {
      return `${property.location.address || ''}, ${property.location.city || ''}`.trim();
    }
    return 'Location not specified';
  };

  // Filter properties based on input
  useEffect(() => {
    if (!locationInput.trim()) {
      setFilteredProperties([]);
      setIsOpen(false);
      return;
    }

    const searchTerm = locationInput.toLowerCase();
    let filtered = allProperties.filter(property => {
      const locationStr = getLocationString(property).toLowerCase();
      const title = property.title.toLowerCase();
      const city = typeof property.location === 'object' ? property.location.city?.toLowerCase() : '';
      const postcode = typeof property.location === 'object' ? property.location.postcode?.toLowerCase() : '';
      
      return locationStr.includes(searchTerm) || 
             title.includes(searchTerm) ||
             city?.includes(searchTerm) ||
             postcode?.includes(searchTerm);
    });

    // If user has a location, sort by distance
    if (userLocation && filtered.length > 0) {
      filtered = filtered
        .map(property => {
          const coords = getPropertyCoordinates(property);
          const distance = coords 
            ? calculateDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
            : Infinity;
          return { property, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10) // Show top 10 nearest
        .map(item => item.property);
    } else {
      filtered = filtered.slice(0, 10);
    }

    setFilteredProperties(filtered);
    setIsOpen(filtered.length > 0);
  }, [locationInput, allProperties, userLocation]);

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      setLoadingGPS(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Redirect to search page with GPS coordinates
          navigate(`/search?gps=true&lat=${latitude}&lng=${longitude}`);
          setLoadingGPS(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check browser permissions.');
          setLoadingGPS(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handlePropertyClick = (property: Property) => {
    setIsOpen(false);
    setLocationInput('');
    if (onPropertySelect) {
      onPropertySelect(property);
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onFocus={() => {
              if (filteredProperties.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder="Search by location, city, or postcode..."
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
          />
          {locationInput && (
            <button
              onClick={() => {
                setLocationInput('');
                setFilteredProperties([]);
                setIsOpen(false);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        
        <Button
          onClick={handleUseMyLocation}
          disabled={loadingGPS}
          size="lg"
          variant="outline"
          className="px-6 rounded-xl border-2"
        >
          {loadingGPS ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Finding...
            </>
          ) : (
            <>
              <Navigation className="h-5 w-5 mr-2" />
              Near Me
            </>
          )}
        </Button>
      </div>

      {/* Dropdown */}
      {isOpen && filteredProperties.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-[500px] overflow-y-auto z-50 shadow-2xl border-2">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2 flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              {userLocation ? 'Sorted by distance from your location' : `${filteredProperties.length} properties found`}
            </div>
            
            <div className="space-y-1">
              {filteredProperties.map((property) => {
                const coords = getPropertyCoordinates(property);
                const distance = userLocation && coords
                  ? calculateDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
                  : null;

                return (
                  <button
                    key={property.id}
                    onClick={() => handlePropertyClick(property)}
                    className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                        {property.images && property.images[0] ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <MapPin className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {property.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{getLocationString(property)}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={property.listingType === 'sale' ? 'default' : 'secondary'} className="text-xs">
                            {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                          </Badge>
                          <span className="text-sm font-semibold text-blue-600">
                            £{property.price.toLocaleString()}
                            {property.listingType === 'rent' && <span className="text-xs text-gray-500">/mo</span>}
                          </span>
                          {distance !== null && (
                            <span className="text-xs text-gray-500 ml-auto">
                              {distance < 1 ? `${(distance * 5280).toFixed(0)} ft` : `${distance.toFixed(1)} mi`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {isOpen && locationInput && filteredProperties.length === 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
          <div className="p-6 text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No properties found in this location</p>
            <p className="text-sm mt-1">Try searching for a different area</p>
          </div>
        </Card>
      )}
    </div>
  );
}