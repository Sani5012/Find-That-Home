import { useState, useEffect, useCallback } from 'react';
import { GPSLocation, Property } from '../types/property';
import { toast } from 'sonner@2.0.3';

interface UseGPSLocationResult {
  location: GPSLocation | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
  watchLocation: () => void;
  stopWatching: () => void;
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
  findNearbyProperties: (properties: Property[], radiusMiles: number) => Array<Property & { distance: number }>;
}

// Calculate distance between two coordinates using Haversine formula
const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export function useGPSLocation(): UseGPSLocationResult {
  const [location, setLocation] = useState<GPSLocation | null>(() => {
    // Try to load cached location from localStorage
    const cached = localStorage.getItem('userLocation');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const newLocation: GPSLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
    setLocation(newLocation);
    setError(null);
    setLoading(false);
    
    // Cache location in localStorage
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Unable to retrieve location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location services.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
    }
    
    setError(errorMessage);
    setLoading(false);
    toast.error(errorMessage);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes cache
    });
  }, [handleSuccess, handleError]);

  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser';
      setError(msg);
      return;
    }

    if (watchId !== null) {
      return; // Already watching
    }

    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute cache
    });

    setWatchId(id);
  }, [watchId, handleSuccess, handleError]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    return haversineDistance(lat1, lng1, lat2, lng2);
  }, []);

  const findNearbyProperties = useCallback((properties: Property[], radiusMiles: number = 5): Array<Property & { distance: number }> => {
    if (!location) return [];

    return properties
      .map(property => ({
        ...property,
        distance: haversineDistance(
          location.lat,
          location.lng,
          property.coordinates.lat,
          property.coordinates.lng
        ),
      }))
      .filter(property => property.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);
  }, [location]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    error,
    loading,
    requestLocation,
    watchLocation,
    stopWatching,
    calculateDistance,
    findNearbyProperties,
  };
}
