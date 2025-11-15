import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  title: string;
  address: string;
}

export function PropertyMap({ lat, lng, title, address }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only initialize if we haven't already
    if (mapInstanceRef.current || !mapRef.current) return;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      // Create map
      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom: 14,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position: relative;">
            <div style="
              background: #3b82f6;
              width: 40px;
              height: 40px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
            <div style="
              position: absolute;
              top: 8px;
              left: 8px;
              width: 24px;
              height: 24px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      // Add marker with popup
      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${title}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
          </div>
        `);

      // Add circle to show approximate area (200m radius)
      L.circle([lat, lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: 200,
      }).addTo(map);
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, title, address]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200"
        style={{ background: '#f0f0f0' }}
      />
      <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm flex items-center gap-2">
        <MapPin className="h-4 w-4 text-blue-600" />
        <span className="text-gray-600">Approximate location</span>
      </div>
    </div>
  );
}
