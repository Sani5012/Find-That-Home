import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Navigation, MapPin } from 'lucide-react';
import { Card } from './ui/card';

// Declare global L for Leaflet loaded from CDN
declare global {
  interface Window {
    L: any;
  }
}

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export function LeafletMap({ latitude, longitude, onLocationChange }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet from CDN
  useEffect(() => {
    // Check if already loaded
    if (window.L) {
      setLeafletLoaded(true);
      setIsLoading(false);
      return;
    }

    // Add CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Add Script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    
    script.onload = () => {
      setLeafletLoaded(true);
      setIsLoading(false);
    };
    
    script.onerror = () => {
      setError('Failed to load map library');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapRef.current) return;

    try {
      const L = window.L;
      
      // Create map
      const map = L.map(mapContainerRef.current).setView([latitude, longitude], 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add marker
      const marker = L.marker([latitude, longitude], {
        draggable: true
      }).addTo(map);

      // Handle marker drag
      marker.on('dragend', function(e: any) {
        const position = e.target.getLatLng();
        onLocationChange(position.lat, position.lng);
      });

      // Handle map click
      map.on('click', function(e: any) {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onLocationChange(lat, lng);
      });

      mapRef.current = map;
      markerRef.current = marker;

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, [leafletLoaded]);

  // Update marker position when coordinates change
  useEffect(() => {
    if (!leafletLoaded || !markerRef.current) return;

    const L = window.L;
    const newLatLng = L.latLng(latitude, longitude);
    markerRef.current.setLatLng(newLatLng);
    
    if (mapRef.current) {
      mapRef.current.setView(newLatLng, mapRef.current.getZoom());
    }
  }, [latitude, longitude, leafletLoaded]);

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          onLocationChange(lat, lng);
          
          // Center map on new location
          if (mapRef.current) {
            const L = window.L;
            mapRef.current.setView(L.latLng(lat, lng), 13);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-center text-red-600">
          <MapPin className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900">Interactive Map</h4>
            <p className="text-xs text-blue-700 mt-1">
              Click anywhere on the map or drag the marker to set the property location. 
              You can also use the button below to use your current GPS location.
            </p>
          </div>
        </div>
      </Card>

      <div 
        ref={mapContainerRef} 
        className="w-full h-96 rounded-lg border-2 border-gray-300 shadow-md"
        style={{ zIndex: 0 }}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-xs text-gray-600 bg-white px-3 py-2 rounded border">
          <div className="flex items-center gap-1 font-medium text-red-600 mb-1">
            <MapPin className="h-3 w-3" />
            Current Location
          </div>
          <div>Latitude: {latitude.toFixed(6)}</div>
          <div>Longitude: {longitude.toFixed(6)}</div>
        </div>

        <Button
          type="button"
          variant="default"
          onClick={getCurrentLocation}
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          Use My Location
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Powered by OpenStreetMap • Click or drag to pin location
      </p>
    </div>
  );
}
