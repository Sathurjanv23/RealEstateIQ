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

    // Add CartoDB Voyager tile layer for crisp light cartography
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Custom Marker Icon: Deep Forest Green (#123B2A) with Luxury Gold dot (#C9A227)
    const createCustomIcon = (price: number | undefined) => {
      const formattedPrice = price
        ? `Rs. ${(price / 1000000).toFixed(1)}M`
        : 'Property';

      return L.divIcon({
        className: 'custom-property-marker',
        html: `
          <div style="
            background: #123B2A;
            color: #FFFFFF;
            font-weight: 700;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(18, 59, 42, 0.3);
            border: 2px solid #FFFFFF;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
          ">
            <span style="display:inline-block; width:6px; height:6px; background:#C9A227; border-radius:50%;"></span>
            ${formattedPrice}
          </div>
        `,
        iconSize: [68, 24],
        iconAnchor: [34, 12],
      });
    };

    // Render Markers
    const bounds = L.latLngBounds([]);

    properties.forEach((prop, idx) => {
      const coords = getPropertyCoordinates(prop, idx);
      bounds.extend(coords);

      const marker = L.marker(coords, {
        icon: createCustomIcon(prop.askingPrice),
      }).addTo(map);

      // Clean Light Popup Content
      const popupHtml = `
        <div style="min-width: 190px; font-family: system-ui, sans-serif; padding: 2px;">
          <h4 style="font-weight: 700; font-size: 13px; color: #17231C; margin: 0 0 4px 0;">${prop.title}</h4>
          <p style="font-size: 11px; color: #718078; margin: 0 0 6px 0;">${prop.location}${prop.district ? ', ' + prop.district : ''}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; color: #718078;">${prop.area.toLocaleString()} sqft</span>
            <span style="font-size: 11px; color: #718078;">${prop.bedrooms} Bed · ${prop.bathrooms} Bath</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E7E3DA; padding-top: 6px;">
            <strong style="color: #123B2A; font-size: 13px;">${prop.askingPrice ? 'Rs. ' + prop.askingPrice.toLocaleString() : 'Price on Inquiry'}</strong>
            <a href="/properties/${prop._id}" style="color: #2F6B4F; font-size: 11px; text-decoration: none; font-weight: 600;">View →</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (selectedProperty && prop._id === selectedProperty._id) {
        marker.openPopup();
      }
    });

    if (properties.length > 1 && !selectedProperty) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    return () => {
      map.remove();
    };
  }, [properties, selectedProperty, centerCity]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="rounded-2xl border border-[#E7E3DA] overflow-hidden shadow-soft-sm"
    />
  );
}
