import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
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
  Galle: [6.0535, 80.221],
  Negombo: [7.2008, 79.8737],
  Jaffna: [9.6615, 80.0255],
  Matara: [5.9549, 80.555],
  Kurunegala: [7.4863, 80.3623],
  Batticaloa: [7.717, 81.7001],
  Trincomalee: [8.5874, 81.2152],
  Anuradhapura: [8.3114, 80.4037],
  Badulla: [6.9934, 81.055],
  Gampaha: [7.0873, 79.9944],
  Kalutara: [6.5854, 79.9607],
  'Nuwara Eliya': [6.9497, 80.7891],
  Ratnapura: [6.7056, 80.3847],
};

function getPropertyCoordinates(property: Property, index: number): [number, number] {
  if (
    typeof property.latitude === 'number' &&
    typeof property.longitude === 'number' &&
    !isNaN(property.latitude) &&
    !isNaN(property.longitude)
  ) {
    return [property.latitude, property.longitude];
  }
  const locKey = property.location || property.district || 'Colombo';
  const base = CITY_COORDINATES[locKey] || CITY_COORDINATES['Colombo'];
  // Deterministic micro-offset so properties in same district don't stack on the exact same coordinate
  const hash = property._id ? property._id.charCodeAt(property._id.length - 1) : index;
  const latOffset = (((hash * 17) % 30) - 15) * 0.003;
  const lngOffset = (((hash * 23) % 30) - 15) * 0.003;
  return [base[0] + latOffset, base[1] + lngOffset];
}

export default function PropertyMap({
  properties,
  height = '550px',
  selectedProperty,
  centerCity,
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Dynamically load leaflet.markercluster plugin on client side
    if (typeof window !== 'undefined') {
      try {
        require('leaflet.markercluster');
      } catch (err) {
        console.warn('Leaflet markercluster require error:', err);
      }
    }

    // Destroy existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Determine initial center & zoom
    let initialCenter: [number, number] = [7.8731, 80.7718]; // Geographical Center of Sri Lanka
    let initialZoom = 8;

    if (selectedProperty) {
      initialCenter = getPropertyCoordinates(selectedProperty, 0);
      initialZoom = 13;
    } else if (centerCity && CITY_COORDINATES[centerCity]) {
      initialCenter = CITY_COORDINATES[centerCity];
      initialZoom = 12;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Add CartoDB Dark Matter / Voyager tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Custom Luxury Individual Property Marker Pin
    const createCustomIcon = (price: number | undefined) => {
      const formattedPrice = price
        ? `Rs. ${(price / 1000000).toFixed(1)}M`
        : 'Inquire';

      return L.divIcon({
        className: 'custom-property-marker',
        html: `
          <div style="
            background: #0A0D14;
            color: #FFFFFF;
            font-weight: 700;
            font-size: 11px;
            padding: 5px 9px;
            border-radius: 9999px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.45);
            border: 1.5px solid #DFBA73;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            backdrop-filter: blur(8px);
          ">
            <span style="display:inline-block; width:6px; height:6px; background:#DFBA73; border-radius:50%; box-shadow: 0 0 6px #DFBA73;"></span>
            ${formattedPrice}
          </div>
        `,
        iconSize: [72, 26],
        iconAnchor: [36, 13],
      });
    };

    // Initialize Leaflet Marker Cluster Group with Luxury styling
    let clusterGroup: any = null;
    if (typeof (L as any).markerClusterGroup === 'function') {
      clusterGroup = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 45,
        spiderfyOnMaxZoom: true,
        zoomToBoundsOnClick: true,
        animate: true,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `
              <div class="luxury-map-cluster">
                <div class="luxury-cluster-inner">
                  <span>${count}</span>
                </div>
              </div>
            `,
            className: 'custom-cluster-wrapper',
            iconSize: L.point(44, 44),
          });
        },
      });
    }

    const bounds = L.latLngBounds([]);

    // Iterate through properties and add to cluster
    properties.forEach((prop, idx) => {
      const coords = getPropertyCoordinates(prop, idx);
      bounds.extend(coords);

      const marker = L.marker(coords, {
        icon: createCustomIcon(prop.askingPrice),
      });

      const hasImg = prop.images && prop.images.length > 0 && prop.images[0];
      const imgHtml = hasImg
        ? `<div style="width: 100%; height: 95px; border-radius: 10px; overflow: hidden; margin-bottom: 8px; background: #000;">
            <img src="${prop.images[0]}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>`
        : '';

      // Dark Luxury Styled Popup
      const popupHtml = `
        <div style="min-width: 220px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 2px;">
          ${imgHtml}
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #DFBA73; background: rgba(223,186,115,0.12); padding: 2px 7px; border-radius: 9999px; border: 1px solid rgba(223,186,115,0.3);">
              ${prop.propertyType || 'Residential'}
            </span>
            <span style="font-size: 10px; color: #94A3B8;">${prop.location}</span>
          </div>

          <h4 style="font-weight: 700; font-size: 13px; color: #FFFFFF; margin: 0 0 4px 0; line-height: 1.3;">
            ${prop.title}
          </h4>

          <p style="font-size: 11px; color: #94A3B8; margin: 0 0 8px 0;">
            📍 ${prop.location}${prop.district && prop.district !== prop.location ? ', ' + prop.district : ''}
          </p>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 8px;">
            <span style="font-size: 11px; color: #CBD5E1;">${prop.area ? prop.area.toLocaleString() + ' sqft' : '—'}</span>
            <span style="font-size: 11px; color: #CBD5E1;">${prop.bedrooms || '—'} Bed · ${prop.bathrooms || '—'} Bath</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
            <strong style="color: #DFBA73; font-size: 13px;">
              ${prop.askingPrice ? 'Rs. ' + (prop.askingPrice / 1000000).toFixed(1) + 'M' : 'Price on Inquiry'}
            </strong>
            <a href="/properties/${prop._id}" style="color: #DFBA73; font-size: 11px; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 2px;">
              View Details →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (clusterGroup) {
        clusterGroup.addLayer(marker);
      } else {
        marker.addTo(map);
      }

      if (selectedProperty && prop._id === selectedProperty._id) {
        marker.openPopup();
      }
    });

    if (clusterGroup) {
      map.addLayer(clusterGroup);
    }

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
      className="rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl relative z-10"
    />
  );
}

