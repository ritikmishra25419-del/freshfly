import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    await transporter.sendMail({
      from: `"FreshFly" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send error:', err);
  }
};

export const verificationEmailHTML = (name: string, token: string) => `
  <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
    <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin-bottom: 8px;">
      Welcome to FreshFly ✦
    </h1>
    <p style="color: #64748B; margin-bottom: 24px;">
      Hi ${name}, please verify your email to start your freelance journey.
    </p>
    <a href="${process.env.CLIENT_URL}/verify-email?token=${token}"
      style="display: inline-block; background: #5B5FFF; color: white; padding: 14px 28px;
      border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px;">
      Verify my email →
    </a>
    <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">
      This link expires in 24 hours. If you didn't sign up, ignore this email.
    </p>
  </div>
`;

export const resetPasswordEmailHTML = (name: string, token: string) => `
  <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
    <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin-bottom: 8px;">
      Reset your password
    </h1>
    <p style="color: #64748B; margin-bottom: 24px;">
      Hi ${name}, click the button below to reset your FreshFly password.
    </p>
    <a href="${process.env.CLIENT_URL}/reset-password?token=${token}"
      style="display: inline-block; background: #5B5FFF; color: white; padding: 14px 28px;
      border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px;">
      Reset my password →
    </a>
    <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">
      This link expires in 1 hour. If you didn't request this, ignore this email.
    </p>
  </div>
`;