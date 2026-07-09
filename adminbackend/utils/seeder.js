import User from '../models/User.js';
import Gym from '../models/Gym.js';

const seedData = async () => {
  try {
    // 1. Seed Super Admin
    const superAdminExists = await User.findOne({ role: 'super_admin' });
    console.log('[SEEDER] superAdminExists:', superAdminExists ? `${superAdminExists.email} (${superAdminExists._id})` : 'none');
    if (!superAdminExists) {
      await User.create({
        name: 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@gym.com',
        password: process.env.SUPER_ADMIN_PASSWORD || 'superadmin123',
        role: 'super_admin',
        isActive: true
      });
      console.log('Super Admin seeded.');
    }

    // 2. Seed Admin Users
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@gym.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('Admin user seeded.');
    }

    // 3. Seed Sample Member Users with Known Passwords
    const memberEmails = ['member1@gym.com', 'member2@gym.com', 'member3@gym.com'];
    for (const email of memberEmails) {
      const memberExists = await User.findOne({ email });
      if (!memberExists) {
        const member = await User.create({
          name: email.split('@')[0],
          email,
          password: 'member123',
          role: 'member',
          isActive: true
        });

        // Also create a Member document for membership tracking
        const Member = (await import('../models/Member.js')).default;
        await Member.create({
          userId: member._id,
          membershipType: '1 Month',
          membershipStart: new Date(),
          membershipEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active',
          price: 50,
          paymentStatus: 'paid'
        });
        console.log(`Member seeded: ${email}`);
      }
    }

    // 4. Seed Default Gym configuration if no gym exists
    const gymExists = await Gym.findOne();
    if (!gymExists) {
      await Gym.create({
        name: 'Default Gym Location',
        location: {
          latitude: 0,
          longitude: 0 // To be updated by admin
        },
        radius: 100,
        address: '123 Main St, City, Country',
        phone: '1234567890',
        email: 'info@gym.com',
        membershipPlans: [
          { name: 'Monthly Standard', duration: '1 Month', price: 50 },
          { name: 'Quarterly Standard', duration: '3 Months', price: 130 },
          { name: 'Half-Yearly Standard', duration: '6 Months', price: 250 },
          { name: 'Yearly Premium', duration: '12 Months', price: 450 }
        ]
      });
      console.log('Default Gym seeded.');
    }
  } catch (error) {
    console.error(`Error with Seeder: ${error.message}`);
  }
};

export default seedData;
