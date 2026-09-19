/**
 * Complete list of Sri Lanka districts and cities for location selection.
 * The ML model internally maps these to trained hubs (Colombo / Kandy / Galle / Negombo).
 */

export interface SLLocation {
  value: string;          // Sent to backend/ML
  label: string;          // Shown to user
  province: string;       // Province grouping
  mlHub: string;          // Internal ML training hub
}

export const SL_LOCATIONS: SLLocation[] = [
  // Western Province
  { value: 'Colombo', label: 'Colombo', province: 'Western', mlHub: 'Colombo' },
  { value: 'Gampaha', label: 'Gampaha', province: 'Western', mlHub: 'Negombo' },
  { value: 'Kalutara', label: 'Kalutara', province: 'Western', mlHub: 'Colombo' },

  // Central Province
  { value: 'Kandy', label: 'Kandy', province: 'Central', mlHub: 'Kandy' },
  { value: 'Matale', label: 'Matale', province: 'Central', mlHub: 'Kandy' },
  { value: 'Nuwara Eliya', label: 'Nuwara Eliya', province: 'Central', mlHub: 'Kandy' },

  // Southern Province
  { value: 'Galle', label: 'Galle', province: 'Southern', mlHub: 'Galle' },
  { value: 'Matara', label: 'Matara', province: 'Southern', mlHub: 'Galle' },
  { value: 'Hambantota', label: 'Hambantota', province: 'Southern', mlHub: 'Galle' },

  // Northern Province
  { value: 'Jaffna', label: 'Jaffna', province: 'Northern', mlHub: 'Colombo' },
  { value: 'Kilinochchi', label: 'Kilinochchi', province: 'Northern', mlHub: 'Colombo' },
  { value: 'Mannar', label: 'Mannar', province: 'Northern', mlHub: 'Colombo' },
  { value: 'Vavuniya', label: 'Vavuniya', province: 'Northern', mlHub: 'Colombo' },
  { value: 'Mullaitivu', label: 'Mullaitivu', province: 'Northern', mlHub: 'Colombo' },

  // Eastern Province
  { value: 'Trincomalee', label: 'Trincomalee', province: 'Eastern', mlHub: 'Colombo' },
  { value: 'Batticaloa', label: 'Batticaloa', province: 'Eastern', mlHub: 'Colombo' },
  { value: 'Ampara', label: 'Ampara', province: 'Eastern', mlHub: 'Colombo' },

  // North Western Province
  { value: 'Kurunegala', label: 'Kurunegala', province: 'North Western', mlHub: 'Negombo' },
  { value: 'Puttalam', label: 'Puttalam', province: 'North Western', mlHub: 'Negombo' },

  // North Central Province
  { value: 'Anuradhapura', label: 'Anuradhapura', province: 'North Central', mlHub: 'Kandy' },
  { value: 'Polonnaruwa', label: 'Polonnaruwa', province: 'North Central', mlHub: 'Kandy' },

  // Uva Province
  { value: 'Badulla', label: 'Badulla', province: 'Uva', mlHub: 'Kandy' },
  { value: 'Monaragala', label: 'Monaragala', province: 'Uva', mlHub: 'Kandy' },

  // Sabaragamuwa Province
  { value: 'Ratnapura', label: 'Ratnapura', province: 'Sabaragamuwa', mlHub: 'Galle' },
  { value: 'Kegalle', label: 'Kegalle', province: 'Sabaragamuwa', mlHub: 'Kandy' },
];

/** Flat list of location values (for select options) */
export const SL_LOCATION_VALUES = SL_LOCATIONS.map(l => l.value);

/** Grouped by province for optgroup rendering */
export const SL_LOCATIONS_GROUPED = SL_LOCATIONS.reduce<Record<string, SLLocation[]>>(
  (acc, loc) => {
    if (!acc[loc.province]) acc[loc.province] = [];
    acc[loc.province].push(loc);
    return acc;
  },
  {}
);

/** Map any SL district → ML hub (Colombo / Kandy / Galle / Negombo) */
export const mapToMlHub = (location: string): string => {
  const found = SL_LOCATIONS.find(l => l.value === location);
  return found ? found.mlHub : 'Colombo'; // default fallback
};
