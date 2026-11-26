/**
 * CAPETOWN HEIGHTS - Main Backend & Admin API Server
 * Built with Express.js & MySQL (database: captown)
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { pool, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-Memory Session Token Storage (Active Admin Sessions)
const activeSessions = new Map();

// Helper: Clean expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
}, 60 * 60 * 1000);

// Auth Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : req.query.token || req.headers['x-admin-token'];

  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please login with your Admin ID and Password.'
    });
  }

  const session = activeSessions.get(token);
  if (session.expiresAt < Date.now()) {
    activeSessions.delete(token);
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please sign in again.'
    });
  }

  req.admin = session;
  next();
}

// =========================================================================
// 1. PUBLIC API ROUTES
// =========================================================================

// Health & Database Status
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({
      status: 'ok',
      mysql: true,
      database: process.env.DB_NAME || 'captown',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      mysql: false,
      message: err.message
    });
  }
});

// Submit Enquiry (Public Contact Form)
app.post('/api/enquiries', async (req, res) => {
  try {
    const { name, phone, email, projectName, interestType, message, note } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter a valid name (at least 2 characters).' });
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit contact number.' });
    }

    const leadMessage = (message || note || '').trim();
    const id = `enq-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const finalProject = (projectName || 'Capetown Heights').trim();
    const finalInterest = (interestType || 'Direct Website Inquiry').trim();

    await pool.query(
      `INSERT INTO enquiries (id, name, phone, email, projectName, interestType, message, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'New', NOW())`,
      [id, name.trim(), phone.trim(), email ? email.trim() : null, finalProject, finalInterest, leadMessage]
    );

    console.log(`[New Enquiry] Saved lead: ${name.trim()} (${phone.trim()}) - ID: ${id}`);
    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received and saved successfully.',
      id
    });
  } catch (err) {
    console.error('[Enquiry Error]', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while saving your enquiry. Please call us directly at 9081464545.'
    });
  }
});

// =========================================================================
// 2. ADMIN AUTHENTICATION ROUTES (ID & Password)
// =========================================================================

// Admin Login (Accepts ID / Username / Email + Password)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID and Password are required.'
      });
    }

    const inputId = id.toString().trim();
    const inputPassword = password.toString().trim();

    // Query admin by email, name/username, integer ID, or shorthand 'admin'
    const [admins] = await pool.query(
      `SELECT id, name, email, password, role FROM admins 
       WHERE email = ? 
          OR name = ? 
          OR id = ? 
          OR (? = 'admin' AND email = 'admin@capetownheights.com')
       LIMIT 1`,
      [inputId, inputId, isNaN(inputId) ? -1 : parseInt(inputId, 10), inputId.toLowerCase()]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin ID or Password.'
      });
    }

    const admin = admins[0];

    // Check password (supports plain text or bcrypt)
    let isMatch = false;
    if (admin.password === inputPassword) {
      isMatch = true;
    } else {
      try {
        const bcrypt = require('bcryptjs');
        isMatch = bcrypt.compareSync(inputPassword, admin.password);
      } catch (e) {
        isMatch = false;
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin ID or Password.'
      });
    }

    // Generate secure 7-day session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    const sessionData = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role || 'Super Administrator',
      expiresAt
    };

    activeSessions.set(token, sessionData);

    console.log(`[Admin Auth] Successful login for: ${admin.email} (${admin.name})`);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('[Admin Login Error]', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
});

// Admin Me / Verify Session
app.get('/api/admin/me', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin.id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role
    }
  });
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (token) {
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// =========================================================================
// 3. ADMIN DASHBOARD & ENQUIRIES MANAGEMENT
// =========================================================================

// Get Dashboard KPI Stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const [[totalRow]] = await pool.query('SELECT COUNT(*) AS total FROM enquiries');
    const [[newRow]] = await pool.query("SELECT COUNT(*) AS newLeads FROM enquiries WHERE status = 'New'");
    const [[contactedRow]] = await pool.query("SELECT COUNT(*) AS contacted FROM enquiries WHERE status = 'Contacted'");
    const [[completedRow]] = await pool.query("SELECT COUNT(*) AS completed FROM enquiries WHERE status = 'Completed'");
    const [[todayRow]] = await pool.query('SELECT COUNT(*) AS today FROM enquiries WHERE DATE(createdAt) = CURDATE()');

    // Optional project & gallery stats
    let totalProjects = 0;
    let totalGallery = 0;
    try {
      const [[projRow]] = await pool.query('SELECT COUNT(*) AS c FROM projects');
      totalProjects = projRow.c;
    } catch (e) {}
    try {
      const [[galRow]] = await pool.query('SELECT COUNT(*) AS c FROM gallery');
      totalGallery = galRow.c;
    } catch (e) {}

    res.json({
      success: true,
      stats: {
        total: totalRow.total || 0,
        newLeads: newRow.newLeads || 0,
        contacted: contactedRow.contacted || 0,
        completed: completedRow.completed || 0,
        today: todayRow.today || 0,
        totalProjects,
        totalGallery,
        dbStatus: 'Connected',
        database: process.env.DB_NAME || 'captown'
      }
    });
  } catch (err) {
    console.error('[Admin Stats Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Enquiries List (with Status Filter and Search)
app.get('/api/admin/enquiries', authenticateAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM enquiries WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR message LIKE ? OR notes LIKE ?)';
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY createdAt DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, enquiries: rows });
  } catch (err) {
    console.error('[Admin Enquiries Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Enquiry Status & Notes
app.patch('/api/admin/enquiries/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updates = [];
    const params = [];

    if (status && ['New', 'Contacted', 'Completed'].includes(status)) {
      updates.push('status = ?');
      params.push(status);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    params.push(id);
    const [result] = await pool.query(
      `UPDATE enquiries SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    res.json({ success: true, message: 'Enquiry updated successfully.' });
  } catch (err) {
    console.error('[Admin Update Enquiry Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Enquiry
app.delete('/api/admin/enquiries/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM enquiries WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    res.json({ success: true, message: 'Enquiry deleted successfully.' });
  } catch (err) {
    console.error('[Admin Delete Enquiry Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Manually Add Enquiry (Admin Lead Logging)
app.post('/api/admin/enquiries', authenticateAdmin, async (req, res) => {
  try {
    const { name, phone, email, projectName, interestType, message, status, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required.' });
    }

    const id = `enq-${Date.now()}`;
    await pool.query(
      `INSERT INTO enquiries (id, name, phone, email, projectName, interestType, message, status, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        name.trim(),
        phone.trim(),
        email ? email.trim() : null,
        projectName || 'Capetown Heights',
        interestType || 'Direct Enquiry',
        message || null,
        status || 'New',
        notes || null
      ]
    );

    res.status(201).json({ success: true, message: 'Lead added successfully.', id });
  } catch (err) {
    console.error('[Admin Create Enquiry Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Export Enquiries as CSV
app.get('/api/admin/export', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM enquiries ORDER BY createdAt DESC');

    const headers = ['ID', 'Date', 'Name', 'Phone', 'Email', 'Project', 'Interest Type', 'Status', 'Message', 'Notes'];
    const csvRows = [headers.join(',')];

    for (const r of rows) {
      const escape = (val) => `"${(val || '').toString().replace(/"/g, '""')}"`;
      csvRows.push([
        escape(r.id),
        escape(new Date(r.createdAt).toLocaleString('en-IN')),
        escape(r.name),
        escape(r.phone),
        escape(r.email),
        escape(r.projectName),
        escape(r.interestType),
        escape(r.status),
        escape(r.message),
        escape(r.notes)
      ].join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=capetown-leads-${Date.now()}.csv`);
    res.send(csvRows.join('\r\n'));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch Projects
app.get('/api/admin/projects', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY featured DESC, createdAt DESC');
    res.json({ success: true, count: rows.length, projects: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch Gallery Items
app.get('/api/admin/gallery', authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery ORDER BY createdAt DESC');
    res.json({ success: true, count: rows.length, gallery: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// AMENITIES CRUD API (Fetch, Add, Edit, Delete)
// =========================================================================

// Fetch All Amenities
app.get(['/api/amenities', '/api/admin/amenities'], async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT num, title, img, description AS `desc` FROM amenities ORDER BY CAST(num AS UNSIGNED) ASC, num ASC');
    res.json({ success: true, count: rows.length, amenities: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add New Amenity
app.post('/api/admin/amenities', authenticateAdmin, async (req, res) => {
  try {
    const { num, title, img, desc, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Amenity title is required.' });
    }

    let finalNum = (num || '').trim();
    if (!finalNum) {
      const [[maxRow]] = await pool.query('SELECT MAX(CAST(num AS UNSIGNED)) AS maxNum FROM amenities');
      finalNum = String((maxRow && maxRow.maxNum ? maxRow.maxNum : 40) + 1).padStart(2, '0');
    }

    const finalImg = (img || '').trim() || 'assets/images/amenities/multipurpose-hall.jpg';
    const finalDesc = (desc || description || '').trim();

    await pool.query(
      'INSERT INTO amenities (num, title, img, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), img=VALUES(img), description=VALUES(description)',
      [finalNum, title.trim(), finalImg, finalDesc]
    );

    res.json({
      success: true,
      message: 'Amenity added successfully.',
      amenity: { num: finalNum, title: title.trim(), img: finalImg, desc: finalDesc }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Edit Existing Amenity
app.put('/api/admin/amenities/:num', authenticateAdmin, async (req, res) => {
  try {
    const oldNum = req.params.num;
    const { num, title, img, desc, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Amenity title is required.' });
    }

    const newNum = (num || oldNum).trim();
    const finalImg = (img || '').trim();
    const finalDesc = (desc || description || '').trim();

    await pool.query(
      'UPDATE amenities SET num = ?, title = ?, img = ?, description = ? WHERE num = ?',
      [newNum, title.trim(), finalImg, finalDesc, oldNum]
    );

    res.json({
      success: true,
      message: `Amenity #${newNum} updated successfully.`,
      amenity: { num: newNum, title: title.trim(), img: finalImg, desc: finalDesc }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Amenity
app.delete('/api/admin/amenities/:num', authenticateAdmin, async (req, res) => {
  try {
    const num = req.params.num;
    await pool.query('DELETE FROM amenities WHERE num = ?', [num]);
    res.json({ success: true, message: `Amenity #${num} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch Database Diagnostics
app.get('/api/admin/database', authenticateAdmin, async (req, res) => {
  try {
    const dbName = process.env.DB_NAME || 'captown';
    const [tables] = await pool.query(
      `SELECT table_name, engine, table_rows, data_length, update_time 
       FROM information_schema.tables 
       WHERE table_schema = ?`,
      [dbName]
    );

    const [[versionRow]] = await pool.query('SELECT VERSION() AS version');

    res.json({
      success: true,
      database: dbName,
      serverVersion: versionRow.version,
      tables
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 4. STATIC ASSETS & ADMIN ROUTING
// =========================================================================

// Serve Static Files from Root Directory
app.use(express.static(path.join(__dirname)));

// Admin Portal Entry
app.get(['/admin', '/admin/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Start Server
async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` CAPETOWN HEIGHTS WEBSITE & ADMIN PORTAL RUNNING`);
    console.log(` Public Website : http://localhost:${PORT}/`);
    console.log(` Admin Portal   : http://localhost:${PORT}/admin`);
    console.log(` MySQL Database : ${process.env.DB_NAME || 'captown'} (localhost:3306)`);
    console.log(`====================================================`);
  });
}

start();
