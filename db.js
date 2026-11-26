/**
 * CAPETOWN HEIGHTS - MySQL Database Connection Module
 * Connects to XAMPP MySQL database 'captown'
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'captown',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

let pool = mysql.createPool(dbConfig);

async function initDatabase() {
  try {
    // 1. Ensure database exists on MySQL server
    const rootConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    const conn = await pool.getConnection();
    console.log(`[MySQL] Connected successfully to database: ${dbConfig.database}`);

    // Ensure admins table exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(100) DEFAULT 'Super Administrator',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Verify or seed default admin
    const [existingAdmins] = await conn.query('SELECT id, name, email, role FROM admins LIMIT 1');
    if (existingAdmins.length === 0) {
      await conn.query(`
        INSERT INTO admins (name, email, password, role)
        VALUES ('Capetown Admin', 'admin@capetownheights.com', 'admin123', 'Super Administrator')
      `);
      console.log('[MySQL] Seeded default admin account: admin@capetownheights.com / admin123');
    } else {
      console.log(`[MySQL] Found existing admin account: ${existingAdmins[0].email} (${existingAdmins[0].name})`);
    }

    // Ensure enquiries table exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NULL,
        projectName VARCHAR(255) DEFAULT 'Capetown Heights',
        interestType VARCHAR(100) DEFAULT 'Direct Enquiry',
        message TEXT NULL,
        status ENUM('New', 'Contacted', 'Completed') DEFAULT 'New',
        notes TEXT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure amenities table exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS amenities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        num VARCHAR(20) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        img MEDIUMTEXT NOT NULL,
        description TEXT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed amenities if table is empty
    const [amenityCount] = await conn.query('SELECT COUNT(*) AS count FROM amenities');
    if (amenityCount[0].count === 0) {
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(__dirname, 'scratch', 'amenities_data.json');
      if (fs.existsSync(dataPath)) {
        try {
          const initialAmenities = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
          for (const am of initialAmenities) {
            await conn.query(
              'INSERT INTO amenities (num, title, img, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), img=VALUES(img), description=VALUES(description)',
              [am.num, am.title, am.img, am.desc || '']
            );
          }
          console.log(`[MySQL] Seeded ${initialAmenities.length} default amenities into 'amenities' table`);
        } catch (e) {
          console.error('[MySQL] Error seeding amenities:', e.message);
        }
      }
    }

    // Ensure contacts table exists
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        is_primary TINYINT(1) DEFAULT 1,
        phone VARCHAR(50) NOT NULL,
        phone_subtitle VARCHAR(255) DEFAULT 'Available for direct inquiries & site visit coordination',
        email VARCHAR(255) DEFAULT 'info@niraliinfra.com',
        address TEXT NOT NULL,
        plus_code VARCHAR(100) DEFAULT '7XGW+V9, Silvassa',
        developer_name VARCHAR(255) DEFAULT 'Nirali infra',
        developer_desc VARCHAR(255) DEFAULT 'Real Estate Builders & Construction Company',
        google_rating VARCHAR(100) DEFAULT '4.6 / 5 Rating (19 Customer Reviews)',
        directions_url TEXT,
        reviews_url TEXT,
        instagram_url TEXT,
        facebook_url TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [contactCount] = await conn.query('SELECT COUNT(*) AS count FROM contacts');
    if (contactCount[0].count === 0) {
      await conn.query(`
        INSERT INTO contacts (id, title, is_primary, phone, phone_subtitle, email, address, plus_code, developer_name, developer_desc, google_rating, directions_url, reviews_url, instagram_url, facebook_url)
        VALUES (
          'contact-01',
          'Capetown Heights Project Office',
          1,
          '9081464545',
          'Available for direct inquiries & site visit coordination',
          'info@niraliinfra.com',
          'Ultan Faliya Road, Police Line Road, Silvassa, Dadra and Nagar Haveli and Daman and Diu – 396230.',
          '7XGW+V9, Silvassa',
          'Nirali infra',
          'Real Estate Builders & Construction Company',
          '4.6 / 5 Rating (19 Customer Reviews)',
          'https://maps.app.goo.gl/NA9WehdJfaJx9NKr7?g_st=ac',
          'https://g.page/r/CZH57F8d6TNIEAE/review',
          'https://www.instagram.com/niraliinfrasilvassa?utm_source=ig_web_button_share_sheet&lqvp=ZDNlZDc0MzIxNw%3D%3D',
          'https://www.facebook.com/niraliinfrasilvassa'
        )
      `);
      console.log('[MySQL] Seeded default project office into contacts table');
    }

    conn.release();
    return true;
  } catch (err) {
    console.error('[MySQL Error] Could not connect to MySQL server:', err.message);
    return false;
  }
}

module.exports = { pool, initDatabase };
