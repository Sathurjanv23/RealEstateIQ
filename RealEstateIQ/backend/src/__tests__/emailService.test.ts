import { emailService } from '../services/emailService';

describe('EmailService', () => {
  it('should be instantiated properly', () => {
    expect(emailService).toBeDefined();
    expect(typeof emailService.sendInquiryNotification).toBe('function');
  });

  it('should send inquiry notification or fallback gracefully', async () => {
    const result = await emailService.sendInquiryNotification({
      propertyName: 'Ocean Breeze Villa Galle',
      propertyLocation: 'Galle Fort, Southern Province',
      inquirerName: 'Unit Test User',
      inquirerPhone: '+94 77 987 6543',
      inquirerEmail: 'testuser@example.com',
      preferredDate: '2026-10-15',
      message: 'Looking for beachfront villa schedule.',
    });

    expect(typeof result).toBe('boolean');
    expect(result).toBe(true);
  });
});
