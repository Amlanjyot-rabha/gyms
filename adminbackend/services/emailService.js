import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const getGymName = () => process.env.GYM_NAME || 'Gym Admin';

export const sendWelcomeEmail = async ({ email, name, plan, joinDate, expiryDate, amount, gymName }) => {
  try {
    const transporter = createTransporter();
    const gName = gymName || getGymName();
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">Welcome to ${gName}!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for joining. Your membership has been successfully created.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan}</p>
          <p style="margin: 5px 0;"><strong>Join Date:</strong> ${new Date(joinDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${amount}</p>
        </div>
        <p>Get ready to achieve your fitness goals! If you have any questions, feel free to reach out to us.</p>
        <p>Best regards,<br>${gName} Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${gName}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to ${gName} - Membership Confirmation`,
      html,
    });
    console.log(`[EMAIL] Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send welcome email to ${email}:`, error);
  }
};

export const sendRenewalEmail = async ({ email, name, plan, amount, expiryDate, gymName }) => {
  try {
    const transporter = createTransporter();
    const gName = gymName || getGymName();
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">Membership Renewed!</h2>
        <p>Hi ${name},</p>
        <p>Your membership at ${gName} has been successfully renewed.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Renewed Plan:</strong> ${plan}</p>
          <p style="margin: 5px 0;"><strong>New Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${amount}</p>
        </div>
        <p>Thank you for continuing your fitness journey with us!</p>
        <p>Best regards,<br>${gName} Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${gName}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Membership Renewal Confirmation - ${gName}`,
      html,
    });
    console.log(`[EMAIL] Renewal email sent to ${email}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send renewal email to ${email}:`, error);
  }
};

export const sendReminderEmail = async ({ email, name, daysLeft, expiryDate, gymName }) => {
  try {
    const transporter = createTransporter();
    const gName = gymName || getGymName();
    
    let timeText = daysLeft === 0 ? 'today' : `in ${daysLeft} days`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #d32f2f;">Membership Expiry Reminder</h2>
        <p>Hi ${name},</p>
        <p>This is a quick reminder that your gym membership at ${gName} expires <strong>${timeText}</strong> (${new Date(expiryDate).toLocaleDateString()}).</p>
        <p>Please renew your membership soon to ensure uninterrupted access to the gym facilities.</p>
        <p>Best regards,<br>${gName} Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${gName}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Action Required: Membership Expires ${timeText} - ${gName}`,
      html,
    });
    console.log(`[EMAIL] Reminder email sent to ${email} (Days left: ${daysLeft})`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send reminder email to ${email}:`, error);
  }
};
