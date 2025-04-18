import  nodemailer from 'nodemailer';
import dotenv from 'dotenv';


dotenv.config();

// Create a nodemailer transporter using SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const msg = {
      to: options.to,
      from: process.env.FROM_EMAIL || 'info@hiranyajewellery.com',
      subject: options.subject,
      text: options.text,
      html: options.html || options.text
    };
    
    await transporter.sendMail(msg);
    console.log(`Email sent to ${options.to}`);

  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendWelcomeEmail = async (email: string, name: string, password: string): Promise<void> => {
  const subject = 'Welcome to Hiranya';
  const text = `Dear ${name},\n\nWelcome! We're excited to have you on board.\n\nYour account has been successfully created. You can now log in and start managing your jewelry schemes.\n\nBest regards,\nThe CJM Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Hiranya!</h2>
      <p>Dear ${name},</p>
      <p>Welcome! We're excited to have you on board.</p>
      <p>Your account has been successfully created. You can now log in and start managing your jewellery schemes.</p>
      <p>Your login credentials are:</p>
      <p>Email: ${email}</p>
      <p>Password: ${password}</p>
      <br>
      <p>Best regards,<br>The CJM Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    text,
    html
  });
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const text = `You have requested to reset your password. Click the following link to reset it: ${resetUrl}\n\nIf you didn't request this, please ignore this email.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password. Click the following link to reset it:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    text,
    html
  });
};