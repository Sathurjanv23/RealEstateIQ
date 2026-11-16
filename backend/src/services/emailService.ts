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

  async sendOtpEmail(email: string, otp: string, userName?: string): Promise<boolean> {
    const htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0b0f19; color: #f8fafc; padding: 40px 20px; border-radius: 16px; max-width: 550px; margin: 0 auto; border: 1px solid rgba(99,102,241,0.25);">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 12px 20px; border-radius: 12px; margin-bottom: 12px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">RealEstateIQ</h1>
          </div>
          <p style="color: #94a3b8; font-size: 15px; margin: 4px 0 0;">Sri Lanka Real Estate Intelligence</p>
        </div>

        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 24px; text-align: center; border: 1px solid rgba(255,255,255,0.06);">
          <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 12px;">Verify Your Email Address</h2>
          <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">
            Hello${userName ? ` <strong>${userName}</strong>` : ''}, thank you for registering with RealEstateIQ! Use the verification code below to complete your account setup:
          </p>

          <div style="background: rgba(99,102,241,0.12); border: 2px dashed #6366f1; border-radius: 12px; padding: 18px 24px; display: inline-block; margin-bottom: 20px;">
            <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #818cf8;">${otp}</span>
          </div>

          <p style="color: #94a3b8; font-size: 13px; margin: 0;">
            This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <p style="font-size: 12px; color: #64748b; margin: 0;">
            If you did not request this registration, you can safely ignore this email.
          </p>
        </div>
      </div>
    `;

    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: `"RealEstateIQ Security" <${process.env.SMTP_USER}>`,
          to: email,
          subject: `${otp} is your RealEstateIQ Verification Code`,
          html: htmlBody,
        });
        logger.info(`EmailService: OTP verification email sent successfully to ${email}`);
        return true;
      } else {
        logger.info(`[EMAIL LOG TRANSPORT] OTP for ${email}: ${otp}`);
        return true;
      }
    } catch (err: any) {
      logger.error(`EmailService error sending OTP email: ${err.message}`);
      return false;
    }
  }
}

export const emailService = new EmailService();
