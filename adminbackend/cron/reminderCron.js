import cron from 'node-cron';
import Member from '../models/Member.js';
import Gym from '../models/Gym.js';
import { sendReminderEmail } from '../services/emailService.js';

export const startReminderCron = () => {
  // Run once daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Starting membership expiry reminder check...');
    try {
      // Find a default gym to get the name
      const gym = await Gym.findOne();
      const gymName = gym ? gym.name : 'Our Gym';

      const activeMembers = await Member.find({ status: 'active' }).populate('userId', 'name email');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const member of activeMembers) {
        if (!member.userId || !member.userId.email) continue;

        const daysLeft = member.getRemainingDays();
        
        // We only send reminders for 7, 3, and 0 days
        if ([7, 3, 0].includes(daysLeft)) {
          
          // Check if we already sent a reminder today
          let alreadySentToday = false;
          if (member.lastReminderSent) {
            const lastSent = new Date(member.lastReminderSent);
            lastSent.setHours(0, 0, 0, 0);
            if (lastSent.getTime() === today.getTime()) {
              alreadySentToday = true;
            }
          }

          if (!alreadySentToday) {
            await sendReminderEmail({
              email: member.userId.email,
              name: member.userId.name,
              daysLeft: daysLeft,
              expiryDate: member.membershipEnd,
              gymName: gymName
            });

            // Update last reminder sent date to avoid spam
            member.lastReminderSent = new Date();
            await member.save();
          }
        }
      }
      console.log('[CRON] Membership expiry reminder check completed.');
    } catch (error) {
      console.error('[CRON ERROR] Failed to run reminder cron:', error);
    }
  });
};
