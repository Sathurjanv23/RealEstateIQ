/**
 * Sri Lankan 25 districts mapping to trained ML hubs (Colombo, Kandy, Galle, Negombo).
 */
export const SL_DISTRICT_TO_HUB: Record<string, 'Colombo' | 'Kandy' | 'Galle' | 'Negombo'> = {
  Colombo: 'Colombo',
  Gampaha: 'Negombo',
  Kalutara: 'Colombo',
  Kandy: 'Kandy',
  Matale: 'Kandy',
  'Nuwara Eliya': 'Kandy',
  Galle: 'Galle',
  Matara: 'Galle',
  Hambantota: 'Galle',
  Jaffna: 'Colombo',
  Kilinochchi: 'Colombo',
  Mannar: 'Colombo',
  Vavuniya: 'Colombo',
  Mullaitivu: 'Colombo',
  Trincomalee: 'Colombo',
  Batticaloa: 'Colombo',
  Ampara: 'Colombo',
  Kurunegala: 'Negombo',
  Puttalam: 'Negombo',
  Anuradhapura: 'Kandy',
  Polonnaruwa: 'Kandy',
  Badulla: 'Kandy',
  Monaragala: 'Kandy',
  Ratnapura: 'Galle',
  Kegalle: 'Kandy',
};

export const ALL_SL_LOCATIONS = Object.keys(SL_DISTRICT_TO_HUB);

export function mapToMlHub(location: string): 'Colombo' | 'Kandy' | 'Galle' | 'Negombo' {
  if (['Colombo', 'Kandy', 'Galle', 'Negombo'].includes(location)) {
    return location as 'Colombo' | 'Kandy' | 'Galle' | 'Negombo';
  }
  return SL_DISTRICT_TO_HUB[location] || 'Colombo';
}
