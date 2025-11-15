import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../types/property';
import { Loader2 } from 'lucide-react';

interface NearbyPropertiesMapProps {
  properties: Property[];
  userLocation: { lat: number; lng: number };
  searchRadius: number;
}

export function NearbyPropertiesMap({ properties, userLocation, searchRadius }: NearbyPropertiesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (!mapRef.current) return;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      setIsLoading(true);
      
      // Create map centered on user's location
      const map = L.map(mapRef.current!, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add modern tile layer (using CartoDB Positron for a clean look)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Add scale control for distance reference
      L.control.scale({
        imperial: true,
        metric: true,
        position: 'bottomright'
      }).addTo(map);

      // Add user location marker with pulsing animation
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <!-- Pulsing circle -->
            <div style="
              position: absolute;
              width: 40px;
              height: 40px;
              background: rgba(59, 130, 246, 0.3);
              border-radius: 50%;
              animation: pulse 2s infinite;
            "></div>
            <!-- Inner circle -->
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 16px;
              height: 16px;
              background: #3b82f6;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% {
                transform: scale(0.8);
                opacity: 1;
              }
              50% {
                transform: scale(1.2);
                opacity: 0.6;
              }
              100% {
                transform: scale(0.8);
                opacity: 1;
              }
            }
          </style>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      userMarker.bindPopup(`
        <div style="text-align: center; padding: 4px;">
          <div style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border-radius: 50%;
            margin-bottom: 8px;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <p style="margin: 0; font-weight: 600; font-size: 14px; color: #1f2937;">Your Location</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Searching within ${searchRadius} miles</p>
        </div>
      `);

      // Add search radius circle
      L.circle([userLocation.lat, userLocation.lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: searchRadius * 1609.34, // Convert miles to meters
        weight: 2,
        dashArray: '5, 10',
      }).addTo(map);

      // Add markers for each property
      properties.forEach((property) => {
        // Create custom property marker
        const propertyIcon = L.divIcon({
          className: 'property-marker',
          html: `
            <div style="
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
            ">
              <!-- Price tag -->
              <div style="
                background: ${property.listingType === 'rent' ? '#10b981' : '#8b5cf6'};
                color: white;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 700;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                white-space: nowrap;
                border: 2px solid white;
                transition: all 0.2s;
              " 
              class="property-price-tag"
              onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.3)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.25)'"
              >
                £${property.price.toLocaleString()}${property.listingType === 'rent' ? '/mo' : ''}
              </div>
              <!-- Pointer -->
              <div style="
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid white;
                margin-top: -2px;
              "></div>
              <div style="
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 7px solid ${property.listingType === 'rent' ? '#10b981' : '#8b5cf6'};
                margin-top: -8px;
              "></div>
            </div>
          `,
          iconSize: [120, 45],
          iconAnchor: [60, 45],
        });

        const marker = L.marker([property.coordinates.lat, property.coordinates.lng], {
          icon: propertyIcon,
        }).addTo(map);

        // Enhanced popup with property details
        marker.bindPopup(`
          <div style="min-width: 280px; cursor: pointer;" class="property-popup" data-property-id="${property.id}">
            <div style="position: relative; margin: -16px -16px 12px -16px;">
              <img 
                src="${property.images[0]}" 
                alt="${property.title}"
                style="width: 100%; height: 140px; object-fit: cover;"
                onerror="this.src='https://via.placeholder.com/280x140?text=Property+Image'"
              />
              <div style="
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                backdrop-filter: blur(4px);
              ">
                ${property.distance?.toFixed(2)} mi away
              </div>
            </div>
            
            <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827;">${property.title}</h3>
            
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 4px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${property.location}
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
              <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 8px;">
                <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Beds</div>
                <div style="font-size: 15px; font-weight: 700; color: #111827;">${property.bedrooms}</div>
              </div>
              <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 8px;">
                <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">Baths</div>
                <div style="font-size: 15px; font-weight: 700; color: #111827;">${property.bathrooms}</div>
              </div>
              <div style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 8px;">
                <div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">sqft</div>
                <div style="font-size: 15px; font-weight: 700; color: #111827;">${property.sqft}</div>
              </div>
            </div>
            
            ${property.lifestyleTags && property.lifestyleTags.length > 0 ? `
              <div style="display: flex; flex-wrap: gap: 4px; margin-bottom: 12px;">
                ${property.lifestyleTags.slice(0, 3).map(tag => `
                  <span style="
                    font-size: 10px;
                    padding: 3px 8px;
                    background: #e0e7ff;
                    color: #4338ca;
                    border-radius: 10px;
                    font-weight: 600;
                  ">${tag}</span>
                `).join('')}
              </div>
            ` : ''}
            
            <div style="padding: 12px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-size: 13px; color: #6b7280;">Price</span>
                <div>
                  <span style="font-size: 24px; font-weight: 800; color: ${property.listingType === 'rent' ? '#10b981' : '#8b5cf6'};">
                    £${property.price.toLocaleString()}
                  </span>
                  ${property.listingType === 'rent' ? '<span style="font-size: 13px; color: #6b7280; font-weight: 400;">/month</span>' : ''}
                </div>
              </div>
            </div>
            
            <button 
              style="
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, ${property.listingType === 'rent' ? '#10b981' : '#8b5cf6'} 0%, ${property.listingType === 'rent' ? '#059669' : '#7c3aed'} 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                transition: transform 0.2s;
              "
              onmouseover="this.style.transform='translateY(-2px)'"
              onmouseout="this.style.transform='translateY(0)'"
            >
              View Property Details
            </button>
          </div>
        `, {
          maxWidth: 280,
          className: 'custom-popup'
        });

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

      // Fit map to show user location and all properties
      const allPoints: [number, number][] = [
        [userLocation.lat, userLocation.lng],
        ...properties.map(p => [p.coordinates.lat, p.coordinates.lng] as [number, number])
      ];
      
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        // Adjust maxZoom based on search radius
        let maxZoom = 14;
        if (searchRadius <= 5) maxZoom = 14;
        else if (searchRadius <= 25) maxZoom = 12;
        else if (searchRadius <= 50) maxZoom = 10;
        else if (searchRadius <= 100) maxZoom = 8;
        else maxZoom = 6;
        
        map.fitBounds(bounds, { padding: [60, 60], maxZoom });
      }

      // Hide loading state after map is ready
      setTimeout(() => setIsLoading(false), 500);
    }).catch(() => {
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [properties, userLocation, searchRadius, navigate]);

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="text-center">
            <Loader2 className="size-12 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-[600px] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg"
        style={{ background: '#f8f9fa' }}
      />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm mb-2 flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></span>
          <span className="font-medium">Your Location</span>
        </p>
        <p className="text-sm mb-2 flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></span>
          <span className="font-medium">Rentals</span>
        </p>
        <p className="text-sm flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow"></span>
          <span className="font-medium">For Sale</span>
        </p>
      </div>
      
      {/* Property count badge */}
      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm">
          <span className="font-bold text-lg text-blue-600">{properties.length}</span>
          <span className="text-gray-600 ml-1">
            {properties.length === 1 ? 'property' : 'properties'} nearby
          </span>
        </p>
      </div>

      {/* Search radius info */}
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100">
        <p className="text-xs text-gray-500">Search Radius</p>
        <p className="text-sm font-bold text-gray-900">{searchRadius} miles</p>
      </div>
    </div>
  );
}
