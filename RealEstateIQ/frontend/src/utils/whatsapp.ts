/**
 * WhatsApp 1-Click Direct Inquiry Utility
 * Pre-composes authentic Sri Lankan real estate inquiry messages
 * with direct redirection to WhatsApp API / Desktop / Mobile.
 */

const DEFAULT_AGENCY_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94771234567';

export interface PropertyInquiryParams {
  propertyTitle: string;
  location: string;
  price?: number | null;
  propertyId: string;
  bedrooms?: number;
  area?: number;
  agentPhone?: string;
}

export interface ValuationInquiryParams {
  certificateId: string;
  location: string;
  area: number;
  bedrooms: number;
  predictedPrice: number;
  agentPhone?: string;
}

/**
 * Clean phone number to WhatsApp international format (digits only, e.g. 94771234567)
 */
export function sanitizeWhatsAppPhone(phone?: string): string {
  if (!phone) return DEFAULT_AGENCY_PHONE;
  const digits = phone.replace(/[^0-9]/g, '');
  // If starts with 0 (e.g. 0771234567), replace with SL country code 94
  if (digits.startsWith('0') && digits.length === 10) {
    return '94' + digits.slice(1);
  }
  return digits || DEFAULT_AGENCY_PHONE;
}

/**
 * Generate 1-Click WhatsApp URL for Property Viewing & Broker Inquiry
 */
export function getPropertyWhatsAppUrl({
  propertyTitle,
  location,
  price,
  propertyId,
  bedrooms,
  area,
  agentPhone,
}: PropertyInquiryParams): string {
  const phone = sanitizeWhatsAppPhone(agentPhone);

  const priceText = price
    ? `Rs. ${price.toLocaleString()} LKR`
    : 'Price on Inquiry';

  const specsText = [
    area ? `${area.toLocaleString()} sqft` : null,
    bedrooms ? `${bedrooms} Beds` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  const text =
    `👋 *Hello RealEstateIQ Agent!*\n\n` +
    `I would like to inquire about this property listing on RealEstateIQ:\n\n` +
    `🏡 *Property:* ${propertyTitle}\n` +
    `📍 *Location:* ${location}\n` +
    (specsText ? `📐 *Specs:* ${specsText}\n` : '') +
    `💰 *Asking Price:* ${priceText}\n` +
    `🆔 *Property ID:* \`${propertyId}\`\n\n` +
    `Please share the viewing availability, deed title report status, and agent details. Thank you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate 1-Click WhatsApp URL for Valuation Certificate Consultation
 */
export function getValuationWhatsAppUrl({
  certificateId,
  location,
  area,
  bedrooms,
  predictedPrice,
  agentPhone,
}: ValuationInquiryParams): string {
  const phone = sanitizeWhatsAppPhone(agentPhone);

  const text =
    `👋 *Hello RealEstateIQ Valuation Advisory!*\n\n` +
    `I have just generated an official ML Valuation Certificate for my property:\n\n` +
    `📄 *Certificate ID:* \`${certificateId}\`\n` +
    `📍 *District / Location:* ${location}\n` +
    `📐 *Area:* ${area.toLocaleString()} sqft\n` +
    `🛏️ *Bedrooms:* ${bedrooms}\n` +
    `💎 *Estimated Fair Market Value:* *Rs. ${Math.round(predictedPrice).toLocaleString()} LKR*\n\n` +
    `I would like to consult with an accredited chartered valuation surveyor / broker regarding this appraisal. Thank you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
