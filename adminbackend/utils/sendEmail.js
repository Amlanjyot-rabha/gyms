import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create a transporter using SMTP placeholders. To be configured by user via .env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_EMAIL || 'test_user',
      pass: process.env.SMTP_PASSWORD || 'test_password',
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Gym Admin'} <${process.env.FROM_EMAIL || 'noreply@gym.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Support for HTML format content
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;
