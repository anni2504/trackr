import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
});

export async function sendOTPEmail(email: string, otp: string, name: string) {
  await transporter.sendMail({
    from: `"Trackr" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: 'Your Trackr verification code',
    html: `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px">
      <h2 style="color:#1a1a2e">Hi ${name},</h2>
      <p>Your verification code is:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#e8c547;padding:16px 0">${otp}</div>
      <p style="color:#666">Expires in 5 minutes.</p>
    </div>`,
  });
}
