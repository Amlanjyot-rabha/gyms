import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { sendWhatsAppMessage, getWhatsAppStatus } from './whatsappService.js';

const getGymName = () => process.env.GYM_NAME || 'Gym Admin';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendGenericEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  const gName = getGymName();
  await transporter.sendMail({
    from: `"${gName}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendWelcomeNotification = async ({ email, name, plan, joinDate, expiryDate, amount, joiningFee = 0, totalPaid, gymName, phone, tempPassword }) => {
  try {
    const isWhatsApp = process.env.WHATSAPP_NOTIFICATION === 'true';
    const gName = gymName || getGymName();

    if (isWhatsApp) {
      if (phone && phone !== 'N/A') {
        const waMessage = `*Welcome to ${gName}!* 🎉\n\nHi ${name},\nThank you for joining. Your membership has been successfully created.\n\n*Plan:* ${plan}\n*Join Date:* ${new Date(joinDate).toLocaleDateString()}\n*Expiry Date:* ${new Date(expiryDate).toLocaleDateString()}\n*Plan Price:* ₹${amount}\n*Joining Fee:* ₹${joiningFee}\n*Total Paid:* ₹${totalPaid || amount}\n\n*Temporary Password:* ${tempPassword || 'Not Provided'}\n*(Please use this password to log into the Member Portal and change it immediately)*\n\nGet ready to achieve your fitness goals! If you have any questions, feel free to reach out to us.\n\nBest regards,\n*${gName} Team*`;
        await sendWhatsAppMessage(phone, waMessage);
        console.log(`[NOTIFICATION] Welcome WhatsApp sent to ${phone}`);
      } else {
        console.warn(`[NOTIFICATION] Cannot send Welcome WhatsApp: Missing phone for ${email}`);
      }
    } else {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333;">Welcome to ${gName}!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for joining. Your membership has been successfully created.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan}</p>
            <p style="margin: 5px 0;"><strong>Join Date:</strong> ${new Date(joinDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Plan Price:</strong> ₹${amount}</p>
            <p style="margin: 5px 0;"><strong>Joining Fee:</strong> ₹${joiningFee}</p>
            <p style="margin: 5px 0;"><strong>Total Paid:</strong> ₹${totalPaid || amount}</p>
          </div>
          <p><strong>Temporary Password:</strong> ${tempPassword || 'Not Provided'}</p>
          <p style="font-size: 0.9em; color: #666;"><em>(Please use this password to log into the Member Portal and change it immediately)</em></p>
          <p>Get ready to achieve your fitness goals! If you have any questions, feel free to reach out to us.</p>
          <p>Best regards,<br>${gName} Team</p>
        </div>
      `;
      await sendGenericEmail(email, `Welcome to ${gName} - Membership Confirmation`, html);
      console.log(`[NOTIFICATION] Welcome Email sent to ${email}`);
    }

    // Notify admins safely
    await notifyAdmins('New Member Admission', {
      name,
      email,
      phone: phone || 'N/A',
      plan,
      amount: totalPaid || amount,
      joinDate,
      expiryDate,
      paymentStatus: 'Paid',
      gymName: gName
    });

  } catch (error) {
    console.error(`[NOTIFICATION ERROR] sendWelcomeNotification failed for ${email}:`, error);
  }
};

export const sendRenewalNotification = async ({ email, name, plan, amount, expiryDate, gymName, phone, joinDate }) => {
  try {
    const isWhatsApp = process.env.WHATSAPP_NOTIFICATION === 'true';
    const gName = gymName || getGymName();

    if (isWhatsApp) {
      if (phone && phone !== 'N/A') {
        const waMessage = `*Membership Renewed!* ✅\n\nHi ${name},\nYour membership at ${gName} has been successfully renewed.\n\n*Renewed Plan:* ${plan}\n*New Expiry Date:* ${new Date(expiryDate).toLocaleDateString()}\n*Amount Paid:* ₹${amount}\n\nThank you for continuing your fitness journey with us!\n\nBest regards,\n*${gName} Team*`;
        await sendWhatsAppMessage(phone, waMessage);
        console.log(`[NOTIFICATION] Renewal WhatsApp sent to ${phone}`);
      } else {
        console.warn(`[NOTIFICATION] Cannot send Renewal WhatsApp: Missing phone for ${email}`);
      }
    } else {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333;">Membership Renewed!</h2>
          <p>Hi ${name},</p>
          <p>Your membership at ${gName} has been successfully renewed.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Renewed Plan:</strong> ${plan}</p>
            <p style="margin: 5px 0;"><strong>New Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${amount}</p>
          </div>
          <p>Thank you for continuing your fitness journey with us!</p>
          <p>Best regards,<br>${gName} Team</p>
        </div>
      `;
      await sendGenericEmail(email, `Membership Renewal Confirmation - ${gName}`, html);
      console.log(`[NOTIFICATION] Renewal Email sent to ${email}`);
    }

    // Notify admins safely
    await notifyAdmins('Membership Renewal', {
      name,
      email,
      phone: phone || 'N/A',
      plan,
      amount,
      joinDate: joinDate || new Date(),
      expiryDate,
      paymentStatus: 'Paid',
      gymName: gName
    });

  } catch (error) {
    console.error(`[NOTIFICATION ERROR] sendRenewalNotification failed for ${email}:`, error);
  }
};

export const sendReminderNotification = async ({ email, name, daysLeft, expiryDate, gymName, phone, joinDate, amount }) => {
  try {
    const isWhatsApp = process.env.WHATSAPP_NOTIFICATION === 'true';
    const gName = gymName || getGymName();
    const timeText = daysLeft === 0 ? 'today' : `in ${daysLeft} days`;

    if (isWhatsApp) {
      if (phone && phone !== 'N/A') {
        const waMessage = `*Membership Expiry Reminder* ⚠️\n\nHi ${name},\nThis is a quick reminder that your gym membership at ${gName} expires *${timeText}* (${new Date(expiryDate).toLocaleDateString()}).\n\nPlease renew your membership soon to ensure uninterrupted access to the gym facilities.\n\nBest regards,\n*${gName} Team*`;
        await sendWhatsAppMessage(phone, waMessage);
        console.log(`[NOTIFICATION] Reminder WhatsApp sent to ${phone} (Days left: ${daysLeft})`);
      } else {
        console.warn(`[NOTIFICATION] Cannot send Reminder WhatsApp: Missing phone for ${email}`);
      }
    } else {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #d32f2f;">Membership Expiry Reminder</h2>
          <p>Hi ${name},</p>
          <p>This is a quick reminder that your gym membership at ${gName} expires <strong>${timeText}</strong> (${new Date(expiryDate).toLocaleDateString()}).</p>
          <p>Please renew your membership soon to ensure uninterrupted access to the gym facilities.</p>
          <p>Best regards,<br>${gName} Team</p>
        </div>
      `;
      await sendGenericEmail(email, `Action Required: Membership Expires ${timeText} - ${gName}`, html);
      console.log(`[NOTIFICATION] Reminder Email sent to ${email} (Days left: ${daysLeft})`);
    }

    // Notify admins safely only if it's the 0-day reminder
    if (daysLeft === 0) {
      await notifyAdmins(`Membership Expiry Reminder (${timeText})`, {
        name,
        email,
        phone: phone || 'N/A',
        plan: 'N/A',
        amount: amount || 0,
        joinDate: joinDate || 'N/A',
        expiryDate,
        paymentStatus: 'Active',
        gymName: gName
      });
    }

  } catch (error) {
    console.error(`[NOTIFICATION ERROR] sendReminderNotification failed for ${email}:`, error);
  }
};

export const notifyAdmins = async (eventType, memberDetails) => {
  try {
    const admins = await User.find({ role: 'admin' });
    if (!admins || admins.length === 0) {
      console.log('[NOTIFICATION] No admin users found in database to notify.');
      return;
    }

    const isWhatsApp = process.env.WHATSAPP_NOTIFICATION === 'true';
    const gName = memberDetails.gymName || getGymName();

    if (isWhatsApp) {
      const waMessage = `*Admin Notification: ${eventType}* 🔔\n\n*Member Name:* ${memberDetails.name || 'N/A'}\n*Email:* ${memberDetails.email || 'N/A'}\n*Phone:* ${memberDetails.phone || 'N/A'}\n*Membership Plan:* ${memberDetails.plan || 'N/A'}\n*Amount:* ₹${memberDetails.amount ?? 'N/A'}\n*Joining Date:* ${memberDetails.joinDate && memberDetails.joinDate !== 'N/A' ? new Date(memberDetails.joinDate).toLocaleDateString() : 'N/A'}\n*Expiry Date:* ${memberDetails.expiryDate ? new Date(memberDetails.expiryDate).toLocaleDateString() : 'N/A'}\n*Payment Status:* ${memberDetails.paymentStatus || 'N/A'}\n\nBest regards,\n*${gName} Management*`;
      
      const sentNumbers = new Set();
      
      for (const admin of admins) {
        if (admin.phoneNumber && admin.phoneNumber !== 'N/A') {
          const cleanPhone = admin.phoneNumber.replace(/[^0-9]/g, '');
          if (cleanPhone) {
            await sendWhatsAppMessage(cleanPhone, waMessage).catch(err => console.error(`[NOTIFICATION ERROR] Failed WA to admin ${cleanPhone}:`, err.message));
            sentNumbers.add(cleanPhone);
          }
        }
      }

      const waStatus = getWhatsAppStatus();
      if (waStatus.status === 'connected' && waStatus.connectedNumber) {
        const cleanConnected = waStatus.connectedNumber.replace(/[^0-9]/g, '');
        if (cleanConnected && !sentNumbers.has(cleanConnected)) {
          await sendWhatsAppMessage(cleanConnected, waMessage).catch(err => console.error(`[NOTIFICATION ERROR] Failed WA to gym ${cleanConnected}:`, err.message));
        }
      }
      console.log(`[NOTIFICATION] Admin WhatsApp notifications processed for event: ${eventType}`);
    } else {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">Admin Notification: ${eventType}</h2>
          <p>This is an automated notification of a member event in the system.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <p style="margin: 5px 0;"><strong>Member Name:</strong> ${memberDetails.name || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${memberDetails.email || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${memberDetails.phone || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Membership Plan:</strong> ${memberDetails.plan || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${memberDetails.amount ?? 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Joining/Start Date:</strong> ${memberDetails.joinDate && memberDetails.joinDate !== 'N/A' ? new Date(memberDetails.joinDate).toLocaleDateString() : 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Expiry Date:</strong> ${memberDetails.expiryDate ? new Date(memberDetails.expiryDate).toLocaleDateString() : 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${memberDetails.paymentStatus || 'N/A'}</p>
          </div>
          <p>Best regards,<br>${gName} Management</p>
        </div>
      `;

      const adminEmails = admins.map(a => a.email);
      for (const adminEmail of adminEmails) {
        await sendGenericEmail(adminEmail, `[ADMIN ALERT] ${eventType} - ${memberDetails.name || 'Member'}`, html)
          .then(() => console.log(`[NOTIFICATION] Admin email sent to ${adminEmail} for event: ${eventType}`))
          .catch(err => console.error(`[NOTIFICATION ERROR] Failed to send admin email to ${adminEmail}:`, err));
      }
    }
  } catch (error) {
    console.error('[NOTIFICATION ERROR] notifyAdmins failed:', error);
  }
};
