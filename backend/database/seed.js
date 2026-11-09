require('dotenv').config({ quiet: true });
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const products = [
  ['DRN-001', 'Aerial Scout X4', 'Compact quadcopter for aerial inspection.', 'Drone', 'unit', 6800000, 9400000],
  ['DRN-002', 'Aerial Survey Pro', 'Survey drone with precision positioning support.', 'Drone', 'unit', 18500000, 24900000],
  ['DRN-003', 'Field Mapper VTOL', 'Hybrid VTOL platform for mapping projects.', 'Drone', 'unit', 32500000, 41900000],
  ['DRN-004', 'AgriSpray 10L', 'Agricultural spraying drone, 10 litre tank.', 'Drone', 'unit', 27800000, 36500000],
  ['PKG-001', 'Starter Pack Explorer', 'Entry-level drone pack with controller and case.', 'Starter Pack', 'pack', 7500000, 10900000],
  ['PKG-002', 'Starter Pack Survey', 'Survey starter pack with GNSS accessory.', 'Starter Pack', 'pack', 20800000, 27900000],
  ['PKG-003', 'Starter Pack Agriculture', 'Agriculture pack with spare propellers.', 'Starter Pack', 'pack', 30200000, 39900000],
  ['BAT-001', 'Smart Battery 4S 5000mAh', 'Rechargeable smart flight battery.', 'Battery', 'unit', 950000, 1450000],
  ['BAT-002', 'Smart Battery 6S 10000mAh', 'High-capacity flight battery.', 'Battery', 'unit', 2350000, 3490000],
  ['ACC-001', 'Carbon Propeller Set', 'Replacement carbon propeller set.', 'Accessory', 'set', 420000, 690000],
  ['ACC-002', 'Landing Pad 75cm', 'Portable landing pad for field operations.', 'Accessory', 'unit', 180000, 320000],
  ['ACC-003', 'Controller Carry Case', 'Protective carry case for drone controller.', 'Accessory', 'unit', 360000, 590000],
  ['DRN-005', 'Aerial Scout X6', 'Six-rotor platform for stable inspection flights.', 'Drone', 'unit', 12400000, 16800000],
  ['DRN-006', 'Coastal Mapper R2', 'Mapping drone configured for coastal survey work.', 'Drone', 'unit', 38600000, 49500000],
  ['DRN-007', 'AgriSpray 16L', 'Agricultural spraying platform with a 16 litre tank.', 'Drone', 'unit', 34200000, 44900000],
  ['DRN-008', 'Indoor Inspect Nano', 'Compact protected drone for indoor visual inspection.', 'Drone', 'unit', 8900000, 12400000],
  ['PKG-004', 'Starter Pack Inspection', 'Inspection bundle with spare battery and hard case.', 'Starter Pack', 'pack', 15600000, 20900000],
  ['PKG-005', 'Starter Pack Mapping', 'Mapping bundle with GNSS accessory and field case.', 'Starter Pack', 'pack', 25900000, 33800000],
  ['BAT-003', 'Smart Battery 4S 8000mAh', 'Extended-capacity 4S battery for longer field sessions.', 'Battery', 'unit', 1450000, 2190000],
  ['BAT-004', 'Smart Battery 6S 16000mAh', 'High-capacity 6S battery for professional platforms.', 'Battery', 'unit', 3250000, 4690000],
  ['ACC-004', 'RTK GNSS Module', 'Positioning module for mapping and survey workflows.', 'Accessory', 'unit', 4800000, 6450000],
  ['ACC-005', 'Spare Propeller Pair', 'Matched replacement propellers for routine maintenance.', 'Accessory', 'pair', 260000, 420000],
  ['ACC-006', 'Dual Battery Charger', 'Compact charger for two compatible flight batteries.', 'Accessory', 'unit', 1120000, 1790000],
  ['ACC-007', 'Weatherproof Field Case', 'Protective equipment case for transport and storage.', 'Accessory', 'unit', 1350000, 1980000],
];

async function seedCatalog() {
  for (const product of products) {
    await db.execute(
      `INSERT IGNORE INTO products
         (sku, name, description, category, unit, buy_price, sell_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      product
    );
  }
  console.log(`Catalog seed completed: ${products.length} generic products.`);
}

async function seed() {
  const name = process.env.SUPERADMIN_NAME;
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!name || !email || !password) {
    throw new Error('Set SUPERADMIN_NAME, SUPERADMIN_EMAIL, and SUPERADMIN_PASSWORD before seeding.');
  }
  if (password.length < 12) throw new Error('SUPERADMIN_PASSWORD must be at least 12 characters.');

  const adminPasswordHash = await bcrypt.hash(password, 12);
  await db.execute(
    `INSERT INTO users (nama, email, password, role, is_active)
     VALUES (?, ?, ?, 'super_admin', 1)
     ON DUPLICATE KEY UPDATE nama = VALUES(nama), password = VALUES(password),
       role = 'super_admin', is_active = 1`,
    [name.trim(), email.trim().toLowerCase(), adminPasswordHash]
  );

  await db.execute(
    `INSERT IGNORE INTO company_settings
       (id, company_name, company_code, email, phone, address, tax_id)
     VALUES (1, 'DAMACO', 'DMC-PNY', NULL, NULL, NULL, NULL)`
  );

  const dealers = [
    ['DLR-001', 'Nusantara Aerial Supply', 'sales@nusantara-aerial.example', '+62-21-555-0101', 'Jakarta, Indonesia'],
    ['DLR-002', 'Archipelago Drone Systems', 'info@archipelago-drone.example', '+62-31-555-0102', 'Surabaya, Indonesia'],
    ['DLR-003', 'Skyline Robotics Trading', 'contact@skyline-robotics.example', '+62-22-555-0103', 'Bandung, Indonesia'],
  ];
  for (const dealer of dealers) {
    await db.execute(
      'INSERT IGNORE INTO dealers (code, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      dealer
    );
  }

  const unavailableCustomerPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
  const customers = [
    ['Demo Customer One', 'customer.one@example.invalid', '+62-811-0000-0001', 'Example Survey Company'],
    ['Demo Customer Two', 'customer.two@example.invalid', '+62-811-0000-0002', 'Example Aerial Services'],
  ];
  for (const [customerName, customerEmail, phone, companyName] of customers) {
    const [inserted] = await db.execute(
      `INSERT IGNORE INTO users (nama, email, telepon, password, role, is_active)
       VALUES (?, ?, ?, ?, 'customer', 0)`,
      [customerName, customerEmail, phone, unavailableCustomerPassword]
    );
    const [userRows] = await db.execute('SELECT id FROM users WHERE email = ?', [customerEmail]);
    await db.execute(
      `INSERT IGNORE INTO customer_profiles (user_id, company_name, phone)
       VALUES (?, ?, ?)`,
      [userRows[0].id, companyName, phone]
    );
  }

  await seedCatalog();
  console.log('Seed completed: configured super admin, settings, dealers, customers, and catalog.');
}

if (require.main === module) {
  const run = process.argv.includes('--catalog-only') ? seedCatalog : seed;
  run().then(() => db.end()).catch(async (error) => {
    console.error(`Seed failed: ${error.message}`);
    try {
      await db.end();
    } catch (closeError) {
      console.error(`Database pool cleanup failed: ${closeError.message}`);
    }
    process.exitCode = 1;
  });
}

module.exports = { seed, seedCatalog, products };
