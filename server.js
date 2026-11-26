/**
 * CAPETOWN HEIGHTS - Main Backend & Admin API Server
 * Built with Express.js & MySQL (database: captown)
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { pool, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware (with 25mb payload limit for image uploads)
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

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

// =========================================================================
// GALLERY CRUD API (Fetch, Add, Edit, Delete)
// =========================================================================

// Fetch Gallery Items (Public & Admin)
app.get(['/api/gallery', '/api/admin/gallery'], async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery ORDER BY createdAt DESC, id ASC');
    res.json({ success: true, count: rows.length, gallery: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add New Gallery Item
app.post('/api/admin/gallery', authenticateAdmin, async (req, res) => {
  try {
    const { title, category, project, image, caption } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Gallery title is required.' });
    }
    if (!image || !image.trim()) {
      return res.status(400).json({ success: false, message: 'Gallery image is required.' });
    }

    const id = req.body.id || `gal-${Date.now()}`;
    const cat = (category || 'Site').trim();
    const proj = (project || 'Capetown Heights').trim();
    const cap = (caption || '').trim();

    await pool.query(
      'INSERT INTO gallery (id, title, category, project, image, caption) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title.trim(), cat, proj, image.trim(), cap]
    );

    res.json({
      success: true,
      message: 'Gallery photo added successfully.',
      item: { id, title: title.trim(), category: cat, project: proj, image: image.trim(), caption: cap }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Gallery Item
app.put('/api/admin/gallery/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, category, project, image, caption } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Gallery title is required.' });
    }

    const cat = (category || 'Site').trim();
    const proj = (project || 'Capetown Heights').trim();
    const cap = (caption || '').trim();

    if (image && image.trim()) {
      await pool.query(
        'UPDATE gallery SET title = ?, category = ?, project = ?, image = ?, caption = ? WHERE id = ?',
        [title.trim(), cat, proj, image.trim(), cap, id]
      );
    } else {
      await pool.query(
        'UPDATE gallery SET title = ?, category = ?, project = ?, caption = ? WHERE id = ?',
        [title.trim(), cat, proj, cap, id]
      );
    }

    res.json({
      success: true,
      message: 'Gallery photo updated successfully.',
      item: { id, title: title.trim(), category: cat, project: proj, caption: cap }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Gallery Item
app.delete('/api/admin/gallery/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM gallery WHERE id = ?', [id]);
    res.json({ success: true, message: `Gallery item ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// CONTACT & OFFICE INFO CRUD API (Fetch, Add, Edit, Delete)
// =========================================================================

// Fetch Contact Offices (Public & Admin)
app.get(['/api/contact', '/api/contacts', '/api/admin/contact', '/api/admin/contacts'], async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contacts ORDER BY is_primary DESC, createdAt ASC');
    res.json({
      success: true,
      count: rows.length,
      contacts: rows,
      primaryContact: rows.length > 0 ? rows[0] : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add New Contact Office
app.post(['/api/admin/contact', '/api/admin/contacts'], authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      phone,
      phone_subtitle,
      email,
      address,
      plus_code,
      developer_name,
      developer_desc,
      google_rating,
      directions_url,
      reviews_url,
      instagram_url,
      facebook_url,
      is_primary
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Office / Contact Title is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Contact Phone Number is required.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, message: 'Site / Office Address is required.' });
    }

    const id = req.body.id || `contact-${Date.now()}`;
    const isPrimaryVal = is_primary ? 1 : 0;

    if (isPrimaryVal === 1) {
      await pool.query('UPDATE contacts SET is_primary = 0');
    }

    await pool.query(
      `INSERT INTO contacts (
        id, title, is_primary, phone, phone_subtitle, email, address, plus_code,
        developer_name, developer_desc, google_rating, directions_url, reviews_url, instagram_url, facebook_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title.trim(),
        isPrimaryVal,
        phone.trim(),
        (phone_subtitle || 'Available for direct inquiries & site visit coordination').trim(),
        (email || 'info@niraliinfra.com').trim(),
        address.trim(),
        (plus_code || '7XGW+V9, Silvassa').trim(),
        (developer_name || 'Nirali infra').trim(),
        (developer_desc || 'Real Estate Builders & Construction Company').trim(),
        (google_rating || '4.6 / 5 Rating (19 Customer Reviews)').trim(),
        (directions_url || '').trim(),
        (reviews_url || '').trim(),
        (instagram_url || '').trim(),
        (facebook_url || '').trim()
      ]
    );

    // Sync website_content
    try {
      const contentJson = JSON.stringify({
        phone: phone.trim(),
        email: (email || 'info@niraliinfra.com').trim(),
        address: address.trim(),
        developer: (developer_name || 'Nirali infra').trim()
      });
      await pool.query(
        'INSERT INTO website_content (id, section, content) VALUES ("contact-info", "contact", ?) ON DUPLICATE KEY UPDATE content = ?',
        [contentJson, contentJson]
      );
    } catch (scErr) {}

    res.json({
      success: true,
      message: 'Contact office added successfully.',
      item: { id, title: title.trim(), phone: phone.trim(), address: address.trim() }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Contact Office
app.put(['/api/admin/contact/:id', '/api/admin/contacts/:id'], authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      phone,
      phone_subtitle,
      email,
      address,
      plus_code,
      developer_name,
      developer_desc,
      google_rating,
      directions_url,
      reviews_url,
      instagram_url,
      facebook_url,
      is_primary
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Office / Contact Title is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Contact Phone Number is required.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, message: 'Site / Office Address is required.' });
    }

    if (is_primary) {
      await pool.query('UPDATE contacts SET is_primary = 0 WHERE id != ?', [id]);
    }

    await pool.query(
      `UPDATE contacts SET
        title = ?, is_primary = ?, phone = ?, phone_subtitle = ?, email = ?,
        address = ?, plus_code = ?, developer_name = ?, developer_desc = ?,
        google_rating = ?, directions_url = ?, reviews_url = ?, instagram_url = ?, facebook_url = ?
      WHERE id = ?`,
      [
        title.trim(),
        is_primary ? 1 : 0,
        phone.trim(),
        (phone_subtitle || '').trim(),
        (email || '').trim(),
        address.trim(),
        (plus_code || '').trim(),
        (developer_name || '').trim(),
        (developer_desc || '').trim(),
        (google_rating || '').trim(),
        (directions_url || '').trim(),
        (reviews_url || '').trim(),
        (instagram_url || '').trim(),
        (facebook_url || '').trim(),
        id
      ]
    );

    // Sync website_content if primary
    if (is_primary) {
      try {
        const contentJson = JSON.stringify({
          phone: phone.trim(),
          email: (email || 'info@niraliinfra.com').trim(),
          address: address.trim(),
          developer: (developer_name || 'Nirali infra').trim()
        });
        await pool.query(
          'INSERT INTO website_content (id, section, content) VALUES ("contact-info", "contact", ?) ON DUPLICATE KEY UPDATE content = ?',
          [contentJson, contentJson]
        );
      } catch (scErr) {}
    }

    res.json({
      success: true,
      message: 'Contact office updated successfully.',
      item: { id, title: title.trim(), phone: phone.trim(), address: address.trim() }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Contact Office
app.delete(['/api/admin/contact/:id', '/api/admin/contacts/:id'], authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM contacts');
    if (rows[0].count <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the only remaining contact office. At least one contact office must exist.'
      });
    }

    await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
    res.json({ success: true, message: `Contact office ${id} deleted successfully.` });
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
      'UPDATE amenities SET num = ?, title = ?, img = ?, description = ? WHERE num = ? OR CAST(num AS UNSIGNED) = CAST(? AS UNSIGNED)',
      [newNum, title.trim(), finalImg, finalDesc, oldNum, oldNum]
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
    await pool.query('DELETE FROM amenities WHERE num = ? OR CAST(num AS UNSIGNED) = CAST(? AS UNSIGNED)', [num, num]);
    res.json({ success: true, message: `Amenity #${num} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Upload Amenity Image (Base64 data or multipart)
app.post('/api/admin/upload-image', authenticateAdmin, async (req, res) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data is required.' });
    }

    // If it's a data URL, decode and write to disk
    if (image.startsWith('data:image/')) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        let ext = matches[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        if (ext.includes('+xml')) ext = 'svg';
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        const uploadsDir = path.join(__dirname, 'assets', 'images', 'amenities', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const safeName = (name || 'amenity').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
        const filename = `${safeName}_${Date.now()}.${ext}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, buffer);
        const relativeUrl = `assets/images/amenities/uploads/${filename}`;
        
        return res.json({
          success: true,
          url: relativeUrl,
          message: 'Image uploaded successfully.'
        });
      }
    }

    // Otherwise, return provided string URL
    res.json({
      success: true,
      url: image,
      message: 'Image URL registered.'
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ success: false, message: 'Image upload failed: ' + err.message });
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

// Serve Static Files from Root Directory & Aliased Paths
app.use('/admin/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
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
