import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../utils/logger';

interface InquiryEmailData {
  propertyName: string;
  propertyLocation?: string;
  inquirerName: string;
  inquirerPhone: string;
  inquirerEmail?: string;
  preferredDate?: string;
  message?: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for SSL (465), false for TLS (587)
        auth: { user, pass },
        tls: { rejectUnauthorized: false }, // allow self-signed in dev
      });
      const provider = host.includes('sendgrid') ? 'SendGrid' : 'Gmail/SMTP';
      logger.info(`EmailService: Configured via ${provider} (${host}:${port})`);
    } else {
      logger.warn('EmailService: SMTP credentials not set in .env. Falling back to log transport mode.');
    }
  }

  async sendInquiryNotification(data: InquiryEmailData): Promise<boolean> {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background: #0b0f19; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(99,102,241,0.2);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #818cf8; margin: 0; font-size: 24px; font-weight: 800;">RealEstateIQ</h1>
          <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">New Property Viewing Inquiry Received</p>
        </div>

        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">Property Details</h2>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Property:</strong> ${data.propertyName}</p>
          ${data.propertyLocation ? `<p style="margin: 6px 0; color: #cbd5e1;"><strong>Location:</strong> ${data.propertyLocation}</p>` : ''}
        </div>

        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">Client Information</h2>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Name:</strong> ${data.inquirerName}</p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Phone:</strong> <a href="tel:${data.inquirerPhone}" style="color: #818cf8;">${data.inquirerPhone}</a></p>
          ${data.inquirerEmail ? `<p style="margin: 6px 0; color: #cbd5e1;"><strong>Email:</strong> <a href="mailto:${data.inquirerEmail}" style="color: #818cf8;">${data.inquirerEmail}</a></p>` : ''}
          ${data.preferredDate ? `<p style="margin: 6px 0; color: #cbd5e1;"><strong>Preferred Date:</strong> ${data.preferredDate}</p>` : ''}
          ${data.message ? `<p style="margin: 12px 0 6px; color: #cbd5e1;"><strong>Message:</strong></p><p style="margin: 0; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px; color: #94a3b8; font-style: italic;">"${data.message}"</p>` : ''}
        </div>

        <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">
          This message was dispatched by RealEstateIQ Sri Lanka Automated Notifications.
        </p>
      </div>
    `;

    try {
      if (this.transporter) {
        const adminEmail = process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER;
        await this.transporter.sendMail({
          from: `"RealEstateIQ Notifications" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          subject: `[New Inquiry] ${data.inquirerName} for ${data.propertyName}`,
          html: htmlBody,
        });

        // Send copy to inquirer if email is provided
        if (data.inquirerEmail) {
          await this.transporter.sendMail({
            from: `"RealEstateIQ Support" <${process.env.SMTP_USER}>`,
            to: data.inquirerEmail,
            subject: `Viewing Confirmation Request: ${data.propertyName}`,
            html: `
              <div style="font-family: Arial, sans-serif; background: #0b0f19; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 550px; margin: 0 auto;">
                <h2 style="color: #818cf8;">Thank You, ${data.inquirerName}!</h2>
                <p style="color: #cbd5e1;">We have received your viewing request for <strong>${data.propertyName}</strong>.</p>
                <p style="color: #94a3b8; font-size: 14px;">An estate advisor will contact you at <strong>${data.inquirerPhone}</strong> to confirm your appointment.</p>
              </div>
            `,
          });
        }
        logger.info(`EmailService: Inquiry email sent successfully for property: ${data.propertyName}`);
        return true;
      } else {
        // Fallback: log notification details
        logger.info(`[EMAIL LOG TRANSPORT] New Inquiry for "${data.propertyName}" from ${data.inquirerName} (${data.inquirerPhone}).`);
        return true;
      }
    } catch (err: any) {
      logger.error(`EmailService error sending notification: ${err.message}`);
      return false;
    }
  }
}

export const emailService = new EmailService();
