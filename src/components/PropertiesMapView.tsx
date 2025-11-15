import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../types/property';

interface PropertiesMapViewProps {
  properties: Property[];
}

export function PropertiesMapView({ properties }: PropertiesMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (!mapRef.current || properties.length === 0) return;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      // Helper function to get property coordinates
      const getPropertyCoordinates = (property: Property): { lat: number; lng: number } | null => {
        if (property.coordinates?.lat && property.coordinates?.lng) {
          return property.coordinates;
        }
        if (property.location && typeof property.location === 'object' && property.location.coordinates) {
          return property.location.coordinates;
        }
        return null;
      };

      // Filter properties that have valid coordinates
      const propertiesWithCoords = properties
        .map(p => ({ property: p, coords: getPropertyCoordinates(p) }))
        .filter((item): item is { property: Property; coords: { lat: number; lng: number } } => item.coords !== null);

      if (propertiesWithCoords.length === 0) {
        // No properties with coordinates, use default center (London)
        const map = L.map(mapRef.current!, {
          center: [51.5074, -0.1278],
          zoom: 6,
          scrollWheelZoom: true,
        });

        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        return;
      }

      // Calculate center point from all properties with coordinates
      const avgLat = propertiesWithCoords.reduce((sum, item) => sum + item.coords.lat, 0) / propertiesWithCoords.length;
      const avgLng = propertiesWithCoords.reduce((sum, item) => sum + item.coords.lng, 0) / propertiesWithCoords.length;

      // Create map
      const map = L.map(mapRef.current!, {
        center: [avgLat, avgLng],
        zoom: 11,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add markers for each property with coordinates
      propertiesWithCoords.forEach(({ property, coords }) => {
        // Create price tag marker
        const priceTag = L.divIcon({
          className: 'property-price-marker',
          html: `
            <div style="
              background: ${property.listingType === 'rent' ? '#3b82f6' : '#10b981'};
              color: white;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              white-space: nowrap;
              border: 2px solid white;
              cursor: pointer;
              transition: transform 0.2s;
            " 
            onmouseover="this.style.transform='scale(1.1)'"
            onmouseout="this.style.transform='scale(1)'"
            >
              £${property.price.toLocaleString()}${property.listingType === 'rent' ? '/mo' : ''}
            </div>
          `,
          iconSize: [100, 32],
          iconAnchor: [50, 16],
        });

        const marker = L.marker([coords.lat, coords.lng], {
          icon: priceTag,
        }).addTo(map);

        // Add popup with property details
        marker.bindPopup(`
          <div style="min-width: 250px; cursor: pointer;" class="property-popup" data-property-id="${property.id}">
            <img 
              src="${property.images[0]}" 
              alt="${property.title}"
              style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;"
              onerror="this.src='https://via.placeholder.com/250x120?text=Property+Image'"
            />
            <h3 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600;">${property.title}</h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; display: flex; align-items: center; gap: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${property.location}
            </p>
            <div style="display: flex; gap: 12px; margin-bottom: 8px; font-size: 12px; color: #666;">
              <span>🛏️ ${property.bedrooms} bed</span>
              <span>🚿 ${property.bathrooms} bath</span>
              <span>📏 ${property.sqft} sqft</span>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${property.listingType === 'rent' ? '#3b82f6' : '#10b981'};">
                £${property.price.toLocaleString()}
                <span style="font-size: 12px; font-weight: 400; color: #666;">
                  ${property.listingType === 'rent' ? '/month' : ''}
                </span>
              </p>
            </div>
            <button 
              style="
                width: 100%;
                margin-top: 8px;
                padding: 8px;
                background: ${property.listingType === 'rent' ? '#3b82f6' : '#10b981'};
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
              "
              onmouseover="this.style.opacity='0.9'"
              onmouseout="this.style.opacity='1'"
            >
              View Details
            </button>
          </div>
        `);

        // Handle popup click to navigate to property details
        marker.on('popupopen', () => {
          setTimeout(() => {
            const popup = document.querySelector('.property-popup');
            if (popup) {
              popup.addEventListener('click', () => {
                navigate(`/property/${property.id}`);
              });
            }
          }, 100);
        });
      });

      // Fit map to show all markers
      if (propertiesWithCoords.length > 0) {
        const bounds = L.latLngBounds(
          propertiesWithCoords.map(item => [item.coords.lat, item.coords.lng] as [number, number])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [properties, navigate]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[calc(100vh-250px)] min-h-[500px] rounded-lg overflow-hidden border border-gray-200"
        style={{ background: '#f0f0f0' }}
      />
      <div className="absolute top-4 left-4 bg-white px-4 py-3 rounded-lg shadow-md">
        <p className="text-sm mb-2">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          Rental Properties
        </p>
        <p className="text-sm">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          For Sale
        </p>
      </div>
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md text-sm">
        <strong>{properties.length}</strong> properties shown
      </div>
    </div>
  );
}