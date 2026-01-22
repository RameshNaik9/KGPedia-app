const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.zoho.in';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = SMTP_PORT === 465;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

const hasSmtpConfig = Boolean(SMTP_USER && SMTP_PASS);

const transporter = hasSmtpConfig
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    })
    : null;

const sendPasswordResetEmail = async ({ to, resetUrl, fullName }) => {
    if (!hasSmtpConfig || !transporter) {
        logger.warn('SMTP credentials missing. Skipping password reset email.', {
            hasUser: Boolean(SMTP_USER),
            hasPass: Boolean(SMTP_PASS),
        });
        return;
    }

    const displayName = fullName || 'there';
    const mailOptions = {
        from: `"KGPedia" <${SMTP_FROM}>`,
        to,
        subject: 'Reset your KGPedia password',
        html: `
            <div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:24px;">
              <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; border:1px solid #e6eaf2;">
                <h2 style="margin:0 0 8px; color:#1d4ed8;">KGPedia</h2>
                <p style="margin:0 0 16px; color:#111827;">Hi ${displayName},</p>
                <p style="margin:0 0 20px; color:#374151;">
                  You requested to reset your password. Click the button below to continue.
                </p>
                <a href="${resetUrl}"
                   style="display:inline-block; background:#3b82f6; color:#ffffff; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:600;">
                  Reset password
                </a>
                <p style="margin:16px 0 6px; color:#6b7280; font-size:12px;">
                  This link will expire in 15 minutes.
                </p>
                <p style="margin:0 0 12px; color:#6b7280; font-size:12px;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin:0; word-break:break-all; font-size:12px;">
                  <a href="${resetUrl}" style="color:#2563eb; text-decoration:none;">${resetUrl}</a>
                </p>
              </div>
              <p style="max-width:560px; margin:12px auto 0; color:#9ca3af; font-size:12px; text-align:center;">
                If you did not request this, you can safely ignore this email.
              </p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Password reset email sent.', { to });
};

module.exports = { sendPasswordResetEmail };

