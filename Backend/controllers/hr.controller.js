const userDto = require('../dto/user.dto');
const { User, Position } = require('../models');
const { sendEmail } = require('../utils/email');
const { hashPassword, generatePassword } = require('../utils/password');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const path = require('path');

const createEmployee = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate Email',
        message: 'User with this email already exists',
      });
    }

    const password = generatePassword();
    const hashedPassword = await hashPassword(password);

    const user = new User({
      ...req.body,
      password: hashedPassword,
    });

    const newUser = await user.save();

    const message = `Hello ${req.body.name}, Welcome onboard!!\nYour HR has created an account for you.\nEmail: ${email}\nPassword: ${password}\nPlease log in and change your password.`;

    // Attempt to send welcome email (non-blocking failure handled)
    try {
      await sendEmail({
        to: email,
        subject: 'Account Created - DevAlign HRIS',
        text: message,
      });
    } catch (e) {
      // Log and continue — don't fail creation if email sending fails
      // eslint-disable-next-line no-console
      console.warn('Failed to send welcome email:', e.message || e);
    }

    return res.status(201).json({
      success: true,
      data: userDto.mapUserToUserResponse(newUser),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const listEmployees = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
  const search = req.query.search || '';
  const { role, position } = req.query;

  const filter = {};
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }
  if (role) filter.role = role;
  if (position && mongoose.Types.ObjectId.isValid(position)) filter.position = position;

  // Default: tampilkan semua (active & inactive). Jika query active diberikan, filter sesuai.
  if (typeof req.query.active !== 'undefined') {
    filter.active = req.query.active === 'true';
  }

  try {
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate('position')
      .populate('managerId', 'name email phoneNumber position')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return res.json({
      success: true,
      data: users.map((u) => userDto.mapUserToUserResponse(u)),
      meta: { total, page, limit },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

const getEmployee = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID' });
  }

  try {
    // populate manager info to include name & email for frontend
    const user = await User.findById(id)
      .populate('position')
      .populate('managerId', 'name email phoneNumber position')
      .lean();

    if (!user) return res.status(404).json({ success: false, error: 'Not Found' });

    // Authorization: hr and manager can view any; others can view only their own record
    const requester = req.user || {};
    if (!['hr', 'manager'].includes(requester.role) && requester._id !== String(id) && requester.id !== String(id)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    // If the user is inactive, only HR can view details
    if (user.active === false && requester.role !== 'hr') {
      return res.status(404).json({ success: false, error: 'Not Found' });
    }

    // map and return — DTO will include manager object when populated
    const response = userDto.mapUserToUserResponse(user);
    return res.json({ success: true, data: response });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID' });
  }

  // Only HR can update via middleware in routes; still check existence
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'Not Found' });

    if (req.body.email && req.body.email !== user.email) {
      const exists = await User.findOne({ email: req.body.email });
      if (exists) return res.status(400).json({ success: false, error: 'Duplicate Email' });
    }

    const updatable = ['name', 'email', 'phoneNumber', 'placeOfBirth', 'dateOfBirth', 'position', 'managerId', 'role'];
    updatable.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) user[k] = req.body[k];
    });

    const updated = await user.save();
    return res.json({ success: true, data: userDto.mapUserToUserResponse(updated) });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID' });
  }

  try {
    // Prioritize soft-delete. Allow hard delete when query ?hard=true is provided (HR only route already enforced in router).
    const hard = req.query.hard === 'true';
    if (hard) {
      const deleted = await User.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Not Found' });
      return res.json({ success: true, message: 'Employee hard-deleted' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'Not Found' });
    if (user.active === false) return res.status(400).json({ success: false, error: 'Already Deactivated' });

    user.active = false;
    await user.save();
    return res.json({ success: true, message: 'Employee deactivated' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
  }
};

const importEmployees = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  // Defaults per agreement: dryRun = true by default, sendEmails = false by default
  const dryRun = req.query.dryRun === undefined ? true : !(req.query.dryRun === 'false');
  const sendEmails = req.query.sendEmails === 'true';

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    // Pre-collect emails and managerEmails for batch DB queries
    const fileEmails = [];
    const managerEmailsSet = new Set();
    const positionNamesSet = new Set();
    rows.forEach((row) => {
      const email = row.email || row.Email || null;
      const managerEmail = row.managerEmail || row.ManagerEmail || null;
      const positionVal = row.position || row.Position || null;
      if (email) fileEmails.push(String(email).toLowerCase());
      if (managerEmail) managerEmailsSet.add(String(managerEmail).toLowerCase());
      if (positionVal && typeof positionVal === 'string') positionNamesSet.add(positionVal);
    });

    // find existing users with those emails
    const existingUsers = await User.find({ email: { $in: fileEmails } }).select('email _id').lean();
    const existingEmailSet = new Set(existingUsers.map((u) => String(u.email).toLowerCase()));

    // resolve managers
    const managers = await User.find({ email: { $in: Array.from(managerEmailsSet) } }).select('email _id').lean();
    const managerMap = new Map(managers.map((m) => [String(m.email).toLowerCase(), m._id]));

    // resolve positions by name
    const positions = await Position.find({ name: { $in: Array.from(positionNamesSet) } }).select('name _id').lean();
    const positionMap = new Map(positions.map((p) => [p.name, p._id]));

    // detect within-file duplicates
    const seenInFile = new Set();

    const results = [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const rowIndex = i + 2; // considering header row at 1

      const name = row.name || row.Name || null;
      const emailRaw = row.email || row.Email || null;
      const email = emailRaw ? String(emailRaw).toLowerCase() : null;
      const phoneNumber = row.phoneNumber || row.Phone || row.phone || null;
      const placeOfBirth = row.placeOfBirth || row.PlaceOfBirth || null;
      const dateOfBirth = row.dateOfBirth || row.DateOfBirth || null;
      const positionVal = row.position || row.Position || null; // can be id or name
      const managerEmailRaw = row.managerEmail || row.ManagerEmail || null;
      const managerEmail = managerEmailRaw ? String(managerEmailRaw).toLowerCase() : null;
      const role = row.role || row.Role || 'staff';
      // Parse skills - dapat berupa string (comma-separated) atau array
      let skills = row.skills || row.Skills || [];
      if (typeof skills === 'string') {
        // Jika skills dalam format string, split by comma dan bersihkan whitespace
        skills = skills.split(',').map(s => s.trim()).filter(s => s);

      const rowResult = { row: rowIndex, errors: [], warnings: [], resolved: {} };

      if (!email || !name) {
        rowResult.errors.push('Missing name or email');
        results.push({ ...rowResult, success: false });
        continue;
      }

      // simple email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        rowResult.errors.push('Invalid email format');
      }

      // within-file duplicate
      if (seenInFile.has(email)) {
        rowResult.errors.push('Duplicate email in file');
      } else {
        seenInFile.add(email);
      }

      // existing DB duplicate
      if (existingEmailSet.has(email)) {
        rowResult.errors.push('Email already exists in system');
      }

      // resolve position
      let position = null;
      if (positionVal) {
        if (mongoose.Types.ObjectId.isValid(positionVal)) {
          position = positionVal;
          rowResult.resolved.position = position;
        } else if (positionMap.has(positionVal)) {
          position = positionMap.get(positionVal);
          rowResult.resolved.position = position;
        } else {
          rowResult.warnings.push('Position not found');
        }
      }

      // resolve manager
      let managerId = null;
      if (managerEmail) {
        if (managerMap.has(managerEmail)) {
          managerId = managerMap.get(managerEmail);
          rowResult.resolved.managerId = managerId;
        } else {
          rowResult.warnings.push('Manager email not found');
        }
      }

      // date parsing check
      if (dateOfBirth) {
        const dt = new Date(dateOfBirth);
        if (Number.isNaN(dt.getTime())) rowResult.warnings.push('Invalid dateOfBirth format');
      }

      const isRowOk = rowResult.errors.length === 0;

      if (dryRun) {
        results.push({ ...rowResult, success: isRowOk });
        continue;
      }

      // Non-dry run: create user if no errors
      if (!isRowOk) {
        results.push({ ...rowResult, success: false });
        continue;
      }

      try {
        const password = generatePassword();
        const hashedPassword = await hashPassword(password);

        const user = new User({
          name,
          email,
          phoneNumber,
          placeOfBirth,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          position,
          managerId,
          role,
          skills, // tambahkan skills ke object creation
          password: hashedPassword,
        });

        const created = await user.save();

        // optionally send welcome email
        if (sendEmails) {
          try {
            await sendEmail({
              to: email,
              subject: 'Account Created - DevAlign HRIS',
              text: `Hello ${name},\nYour account has been created.\nEmail: ${email}\nPassword: ${password}`,
            });
          } catch (e) {
            // email send failure should not roll back creation
            rowResult.warnings.push('Failed to send welcome email');
          }
        }

        results.push({ ...rowResult, success: true, id: created._id, email });
      } catch (errRow) {
        results.push({ ...rowResult, success: false, error: errRow.message });
      }
    }

    const created = results.filter((r) => r.success).length;
    const failed = results.length - created;
    return res.json({ success: true, dryRun, sendEmails, created, failed, results });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to parse file', message: err.message });
  }
};

const getImportTemplate = async (req, res) => {
  try {
    const format = (req.query.format || 'xlsx').toLowerCase();
    const xlsxPath = path.join(__dirname, '..', 'scripts', 'employee-import-template.xlsx');
    const csvPath = path.join(__dirname, '..', 'scripts', 'employee-import-template.csv');
    const fs = require('fs');
    if (format === 'xlsx' && fs.existsSync(xlsxPath)) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=employee-import-template.xlsx');
      return res.sendFile(xlsxPath);
    }
    if (format === 'csv' && fs.existsSync(csvPath)) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=employee-import-template.csv');
      return res.sendFile(csvPath);
    }
    // fallback: error if file not found
    return res.status(404).json({ success: false, error: 'Template file not found' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to get template', message: err.message });
  }
};

const parseCv = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const mime = req.file.mimetype || '';
  try {
    if (mime === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
      const data = await pdfParse(req.file.buffer);
      const text = data.text || '';

      // extract emails and phones
      const emails = (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).slice(0, 10);
      const phones = (text.match(/\+?\d[\d \-()]{6,}\d/g) || []).slice(0, 10);

      return res.json({ success: true, text: text.slice(0, 10000), emails, phones });
    }

    return res.status(400).json({ success: false, error: 'Unsupported file type for CV parsing. Only PDF supported for now.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to parse CV', message: err.message });
  }
};

module.exports = {
  createEmployee,
  listEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployees,
  parseCv,
  getImportTemplate,
};
