import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Property } from '../../types';

interface PropertyMapProps {
  properties: Property[];
  height?: string;
  selectedProperty?: Property;
  centerCity?: string;
  zoom?: number;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  Colombo: [6.9271, 79.8612],
  Kandy: [7.2906, 80.6337],
  Galle: [6.0535, 80.2210],
  Negombo: [7.2008, 79.8737],
};

function getPropertyCoordinates(property: Property, index: number): [number, number] {
  const base = CITY_COORDINATES[property.location] || [6.9271, 79.8612];
  // Deterministic micro-offset so properties in same city don't stack exactly on top of each other
  const hash = property._id ? property._id.charCodeAt(property._id.length - 1) : index;
  const latOffset = (((hash * 17) % 30) - 15) * 0.003;
  const lngOffset = (((hash * 23) % 30) - 15) * 0.003;
  return [base[0] + latOffset, base[1] + lngOffset];
}

export default function PropertyMap({ properties, height = '550px', selectedProperty, centerCity }: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Determine initial center
    let initialCenter: [number, number] = [7.2, 80.2]; // Center of Sri Lanka
    let initialZoom = 8;

    if (selectedProperty) {
      initialCenter = getPropertyCoordinates(selectedProperty, 0);
      initialZoom = 13;
    } else if (centerCity && CITY_COORDINATES[centerCity]) {
      initialCenter = CITY_COORDINATES[centerCity];
      initialZoom = 12;
    }

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Add CartoDB Dark Matter tile layer for stunning dark UI
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Custom Marker Icon
    const createCustomIcon = (price: number | undefined) => {
      const formattedPrice = price
        ? `Rs. ${(price / 1000).toFixed(0)}k`
        : 'Property';

      return L.divIcon({
        className: 'custom-property-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #ffffff;
            font-weight: 700;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
            border: 2px solid #ffffff;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
          ">
            <span style="display:inline-block; width:6px; height:6px; background:#10b981; border-radius:50%;"></span>
            ${formattedPrice}
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });
    };

    // Add markers
    const bounds = L.latLngBounds([]);

    properties.forEach((prop, idx) => {
      const coords = getPropertyCoordinates(prop, idx);
      bounds.extend(coords);

      const marker = L.marker(coords, {
        icon: createCustomIcon(prop.askingPrice),
      }).addTo(map);

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 200px; color: #1e1e38; padding: 2px;">
          <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #6366f1; margin-bottom: 2px;">
            ${prop.propertyType} · ${prop.location}
          </div>
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 4px; line-height: 1.2;">
            ${prop.title}
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #4f46e5; margin-bottom: 6px;">
            ${prop.askingPrice ? `Rs. ${prop.askingPrice.toLocaleString()}` : 'Price on request'}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${prop.area.toLocaleString()} sqft · ${prop.bedrooms} Beds · ${prop.bathrooms} Baths
          </div>
          <a href="/properties/${prop._id}" style="
            display: block;
            text-align: center;
            background: #6366f1;
            color: #ffffff;
            text-decoration: none;
            font-size: 11px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 8px;
          ">
            View Property →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        autoPan: true,
      });

      if (selectedProperty && selectedProperty._id === prop._id) {
        marker.openPopup();
      }
    });

    if (properties.length > 1 && !selectedProperty && !centerCity) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [properties, selectedProperty, centerCity]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%', borderRadius: '16px', overflow: 'hidden' }}
      className="border border-white/10 shadow-xl"
    />
  );
}
