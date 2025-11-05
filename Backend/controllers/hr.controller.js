const userDto = require("../dto/user.dto");
const { User, Position, Skill, ProjectAssignment } = require("../models");
const { sendEmail } = require("../utils/email");
const { hashPassword, generatePassword } = require("../utils/password");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const pdfParse = require("pdf-parse");
const path = require("path");

// Helper to safely escape user input when building RegExp
const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const skillMatching = (skills, existingSkills) => {
  const clean = (arr) =>
    arr.map((skill) =>
      skill
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim()
    );
  console.log({ existingSkills });
  const cleanedSkills = clean(skills);
  console.log({ cleanedSkills });
  const cleanedExisting = clean(existingSkills);
  console.log({ existingSkills });
  console.log({ cleanedExisting });

  const matchedSkills = [];
  const newSkills = [];

  cleanedSkills.forEach((skill, i) => {
    const matchIndex = cleanedExisting.indexOf(skill);
    if (matchIndex !== -1) {
      // Match ditemukan → push versi DB
      matchedSkills.push(existingSkills[matchIndex]);
    } else {
      // Tidak ditemukan → push versi user
      newSkills.push(skills[i]);
    }
  });

  console.log({ matchedSkills, newSkills });

  return { matchedSkills, newSkills };
};

const createEmployee = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Duplicate Email",
        message: "User with this email already exists",
      });
    }

    const password = generatePassword();
    const hashedPassword = await hashPassword(password);

    const existingSkills = await Skill.find({});
    const existingSkillNames = existingSkills.map((skill) => skill.name);

    const { matchedSkills, newSkills } = skillMatching(
      req.body.skills,
      existingSkillNames
    );

    let insertedIds = [];
    if (newSkills.length > 0) {
      const skillDocs = newSkills.map((name) => ({ name }));
      const insertedSkills = await Skill.insertMany(skillDocs);
      insertedIds = insertedSkills.map((doc) => doc._id);
    }

    if (matchedSkills?.length > 0) {
      insertedIds = [
        ...insertedIds,
        ...existingSkills
          .filter((skill) => matchedSkills.includes(skill.name))
          .map((skill) => skill._id),
      ];
    }

    const user = new User({
      ...req.body,
      skills: insertedIds,
      password: hashedPassword,
    });

    const newUser = await user.save();

    const message = `Hello ${req.body.name}, Welcome onboard!!\nYour HR has created an account for you.\nEmail: ${email}\nPassword: ${password}\nPlease log in and change your password.`;

    // Attempt to send welcome email (non-blocking failure handled)
    try {
      await sendEmail({
        to: email,
        subject: "Account Created - DevAlign HRIS",
        text: message,
      });
    } catch (e) {
      // Log and continue — don't fail creation if email sending fails
      // eslint-disable-next-line no-console
      console.warn("Failed to send welcome email:", e.message || e);
    }

    return res.status(201).json({
      success: true,
      data: userDto.mapUserToUserResponse(newUser),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const listEmployees = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
  const search = req.query.search || "";
  const { role, position } = req.query;

  const filter = {};
  if (search) {
    const regex = new RegExp(escapeRegExp(search), "i");
    filter.$or = [{ name: regex }, { email: regex }];
  }
  if (role) filter.role = role;
  if (position && mongoose.Types.ObjectId.isValid(position))
    filter.position = position;

  // Default: tampilkan semua (active & inactive). Jika query active diberikan, filter sesuai.
  if (typeof req.query.active !== "undefined") {
    filter.active = req.query.active === "true";
  }

  try {
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate("position")
      .populate("skills", "name")
      .populate("managerId", "name email phoneNumber position")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Count projects per user for users in this page
    const userIds = users.map((u) => u._id);
    const projectCountsMap = new Map();
    if (userIds.length > 0) {
      const counts = await ProjectAssignment.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]).exec();
      counts.forEach((c) => projectCountsMap.set(String(c._id), c.count));
    }

    const mapped = users.map((u) => {
      const out = userDto.mapUserToUserResponse(u);
      out.projectCount = projectCountsMap.get(String(u._id)) || 0;
      return out;
    });

    return res.json({
      success: true,
      data: mapped,
      meta: { total, page, limit },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const getEmployee = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: "Invalid ID" });
  }

  try {
    // populate manager info to include name & email for frontend
    const user = await User.findById(id)
      .populate("position")
      .populate("skills", "name")
      .populate("managerId", "name email phoneNumber position")
      .lean();

    if (!user)
      return res.status(404).json({ success: false, error: "Not Found" });

    // Authorization: hr and manager can view any; others can view only their own record
    const requester = req.user || {};
    if (
      !["hr", "manager"].includes(requester.role) &&
      requester._id !== String(id) &&
      requester.id !== String(id)
    ) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    // If the user is inactive, only HR can view details
    if (user.active === false && requester.role !== "hr") {
      return res.status(404).json({ success: false, error: "Not Found" });
    }

    // map and return — DTO will include manager object when populated
    const response = userDto.mapUserToUserResponse(user);
    // attach project count for this employee
    try {
      const projCount = await ProjectAssignment.countDocuments({
        userId: user._id,
      });
      response.projectCount = projCount;
    } catch (e) {
      // non-fatal: if counting fails, default to 0
      response.projectCount = 0;
    }

    return res.json({ success: true, data: response });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: "Invalid ID" });
  }

  // Only HR can update via middleware in routes; still check existence
  try {
    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ success: false, error: "Not Found" });

    if (req.body.email && req.body.email !== user.email) {
      const exists = await User.findOne({ email: req.body.email });
      if (exists)
        return res
          .status(400)
          .json({ success: false, error: "Duplicate Email" });
    }

    const updatable = [
      "name",
      "email",
      "phoneNumber",
      "placeOfBirth",
      "dateOfBirth",
      "position",
      "managerId",
      "role",
    ];
    updatable.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body, k))
        user[k] = req.body[k];
    });

    // Handle skills update if skills array is provided
    if (Array.isArray(req.body.skills)) {
      // Find or create skills by name
      const skillIds = await Promise.all(
        req.body.skills.map(async (skillName) => {
          let skill = await Skill.findOne({
            name: new RegExp("^" + escapeRegExp(skillName) + "$", "i"),
          });
          if (!skill) {
            // Create new skill if it doesn't exist
            skill = await Skill.create({ name: skillName });
          }
          return skill._id;
        })
      );

      // Update user's skills
      user.skills = skillIds;
    }

    const updated = await user.save();

    // Fetch complete user data with populated fields
    const populatedUser = await User.findById(updated._id)
      .populate("skills", "name")
      .populate("position")
      .populate("managerId", "name email phoneNumber position");
    return res.json({
      success: true,
      data: userDto.mapUserToUserResponse(populatedUser),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: "Invalid ID" });
  }

  try {
    // Prioritize soft-delete. Allow hard delete when query ?hard=true is provided (HR only route already enforced in router).
    const hard = req.query.hard === "true";
    if (hard) {
      const deleted = await User.findByIdAndDelete(id);
      if (!deleted)
        return res.status(404).json({ success: false, error: "Not Found" });
      return res.json({ success: true, message: "Employee hard-deleted" });
    }

    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ success: false, error: "Not Found" });
    if (user.active === false)
      return res
        .status(400)
        .json({ success: false, error: "Already Deactivated" });

    user.active = false;
    await user.save();
    return res.json({ success: true, message: "Employee deactivated" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

const importEmployees = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  // Always proceed with import and send emails
  const dryRun = false;
  const sendEmails = true;

  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    // Pre-collect emails and managerEmails for batch DB queries
    const fileEmails = [];
    const managerEmailsSet = new Set();
    const positionNamesSet = new Set();
    const skillNamesSet = new Set();
    rows.forEach((row) => {
      const email = row.email || row.Email || null;
      const managerEmail = row.managerEmail || row.ManagerEmail || null;
      const positionVal = row.position || row.Position || null;
      const skillsVal = row.skills || row.Skills || "";

      if (email) fileEmails.push(String(email).toLowerCase());
      if (managerEmail)
        managerEmailsSet.add(String(managerEmail).toLowerCase());
      if (positionVal && typeof positionVal === "string")
        positionNamesSet.add(positionVal);

      // Handle skills (comma-separated string or array)
      if (skillsVal) {
        const skillNames =
          typeof skillsVal === "string"
            ? skillsVal
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : Array.isArray(skillsVal)
            ? skillsVal
            : [];
        skillNames.forEach((name) => skillNamesSet.add(name));
      }
    });

    // find existing users with those emails
    const existingUsers = await User.find({ email: { $in: fileEmails } })
      .select("email _id")
      .lean();
    const existingEmailSet = new Set(
      existingUsers.map((u) => String(u.email).toLowerCase())
    );

    // resolve managers
    const managers = await User.find({
      email: { $in: Array.from(managerEmailsSet) },
    })
      .select("email _id")
      .lean();
    const managerMap = new Map(
      managers.map((m) => [String(m.email).toLowerCase(), m._id])
    );

    // helper to escape user input for RegExp
    const escapeRegExp = (s) =>
      String(s).replace(/[.*+?^${}()|[\[\]\\]/g, "\\$&");

    // resolve positions by name (case-insensitive)
    const positions = await Position.find({
      $or: Array.from(positionNamesSet).map((n) => ({
        name: new RegExp("^" + escapeRegExp(n) + "$", "i"),
      })),
    })
      .select("name _id")
      .lean();
    // map using lowercase key for case-insensitive lookup
    const positionMap = new Map(
      positions.map((p) => [String(p.name).toLowerCase(), p._id])
    );

    // resolve skills by name (case-insensitive)
    const skills = await Skill.find({
      $or: Array.from(skillNamesSet).map((n) => ({
        name: new RegExp("^" + escapeRegExp(n) + "$", "i"),
      })),
    })
      .select("name _id")
      .lean();
    const skillMap = new Map(
      skills.map((s) => [String(s.name).toLowerCase(), s._id])
    );

    // Auto-create missing positions and skills so import doesn't fail on unknown names
    const missingPositionNames = Array.from(positionNamesSet).filter(
      (n) => !positionMap.has(String(n).toLowerCase())
    );
    if (missingPositionNames.length > 0) {
      // create positions (preserve provided casing)
      const createdPositions = await Position.insertMany(
        missingPositionNames.map((name) => ({ name }))
      );
      createdPositions.forEach((p) =>
        positionMap.set(String(p.name).toLowerCase(), p._id)
      );
    }

    const missingSkillNames = Array.from(skillNamesSet).filter(
      (n) => !skillMap.has(String(n).toLowerCase())
    );
    if (missingSkillNames.length > 0) {
      const createdSkills = await Skill.insertMany(
        missingSkillNames.map((name) => ({ name }))
      );
      createdSkills.forEach((s) =>
        skillMap.set(String(s.name).toLowerCase(), s._id)
      );
    }

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
      const managerEmail = managerEmailRaw
        ? String(managerEmailRaw).toLowerCase()
        : null;
      const role = row.role || row.Role || "staff";
      const skillsVal = row.skills || row.Skills || "";

      const rowResult = {
        row: rowIndex,
        errors: [],
        warnings: [],
        resolved: {},
      };

      if (!email || !name) {
        rowResult.errors.push("Missing name or email");
        results.push({ ...rowResult, success: false });
        continue;
      }

      // simple email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        rowResult.errors.push("Invalid email format");
      }

      // within-file duplicate
      if (seenInFile.has(email)) {
        rowResult.errors.push("Duplicate email in file");
      } else {
        seenInFile.add(email);
      }

      // existing DB duplicate
      if (existingEmailSet.has(email)) {
        rowResult.errors.push("Email already exists in system");
      }

      // resolve position
      let position = null;
      if (positionVal) {
        if (mongoose.Types.ObjectId.isValid(positionVal)) {
          position = positionVal;
          rowResult.resolved.position = position;
        } else if (positionMap.has(String(positionVal).toLowerCase())) {
          position = positionMap.get(String(positionVal).toLowerCase());
          rowResult.resolved.position = position;
        } else {
          // should not happen because we auto-create missing positions earlier, but keep warning as fallback
          rowResult.warnings.push("Position not found");
        }
      }

      // resolve manager
      let managerId = null;
      if (managerEmail) {
        if (managerMap.has(managerEmail)) {
          managerId = managerMap.get(managerEmail);
          rowResult.resolved.managerId = managerId;
        } else {
          rowResult.warnings.push("Manager email not found");
        }
      }

      // resolve skills
      let skills = [];
      if (skillsVal) {
        const skillNames =
          typeof skillsVal === "string"
            ? skillsVal
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : Array.isArray(skillsVal)
            ? skillsVal
            : [];

        skills = skillNames
          .map((name) => {
            if (mongoose.Types.ObjectId.isValid(name)) {
              return name; // If it's already an ID, use it directly
            }
            const key = String(name).toLowerCase();
            if (skillMap.has(key)) {
              return skillMap.get(key);
            }
            // fallback: skill not found (should be rare because we auto-create earlier)
            rowResult.warnings.push(`Skill not found: ${name}`);
            return null;
          })
          .filter(Boolean);

        if (skills.length > 0) {
          rowResult.resolved.skills = skills;
        }
      }

      // date parsing check
      if (dateOfBirth) {
        const dt = new Date(dateOfBirth);
        if (Number.isNaN(dt.getTime()))
          rowResult.warnings.push("Invalid dateOfBirth format");
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
          skills,
          role,
          password: hashedPassword,
        });

        const created = await user.save();

        // optionally send welcome email
        if (sendEmails) {
          try {
            await sendEmail({
              to: email,
              subject: "Account Created - DevAlign HRIS",
              text: `Hello ${name},\nYour account has been created.\nEmail: ${email}\nPassword: ${password}`,
            });
          } catch (e) {
            // email send failure should not roll back creation
            rowResult.warnings.push("Failed to send welcome email");
          }
        }

        results.push({ ...rowResult, success: true, id: created._id, email });
      } catch (errRow) {
        results.push({ ...rowResult, success: false, error: errRow.message });
      }
    }

    const created = results.filter((r) => r.success).length;
    const failed = results.length - created;
    return res.json({
      success: true,
      dryRun,
      sendEmails,
      created,
      failed,
      results,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to parse file",
      message: err.message,
    });
  }
};

const getImportTemplate = async (req, res) => {
  try {
    const format = (req.query.format || "xlsx").toLowerCase();
    const xlsxPath = path.join(
      __dirname,
      "..",
      "scripts",
      "employee-import-template.xlsx"
    );
    const csvPath = path.join(
      __dirname,
      "..",
      "scripts",
      "employee-import-template.csv"
    );
    const fs = require("fs");
    if (format === "xlsx" && fs.existsSync(xlsxPath)) {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=employee-import-template.xlsx"
      );
      return res.sendFile(xlsxPath);
    }
    if (format === "csv" && fs.existsSync(csvPath)) {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=employee-import-template.csv"
      );
      return res.sendFile(csvPath);
    }
    // fallback: error if file not found
    return res
      .status(404)
      .json({ success: false, error: "Template file not found" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to get template",
      message: err.message,
    });
  }
};

const parseCv = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  const mime = req.file.mimetype || "";
  try {
    if (
      mime === "application/pdf" ||
      req.file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      const data = await pdfParse(req.file.buffer);
      const text = data.text || "";

      // extract emails and phones
      const emails = (
        text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
      ).slice(0, 10);
      const phones = (text.match(/\+?\d[\d \-()]{6,}\d/g) || []).slice(0, 10);

      return res.json({
        success: true,
        text: text.slice(0, 10000),
        emails,
        phones,
      });
    }

    return res.status(400).json({
      success: false,
      error:
        "Unsupported file type for CV parsing. Only PDF supported for now.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to parse CV",
      message: err.message,
    });
    return res.status(500).json({
      success: false,
      error: "Failed to parse CV",
      message: err.message,
    });
  }
};

const getColleagues = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;
    const currentUser = await User.findById(currentUserId)
      .select("role managerId")
      .lean();

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Current user not found",
      });
    }

    let colleagues = [];
    let directManager = null;

    if (currentUser.role === "manager") {
      // If user is manager, get all direct subordinates (members with managerId = currentUser._id)
      colleagues = await User.find({
        managerId: currentUserId,
        active: true,
        _id: { $ne: currentUserId }, // Exclude self
      })
        .populate("position", "name")
        .populate("skills", "name")
        .select("_id name email role position skills")
        .sort({ name: 1 })
        .lean();
    } else {
      // If user is staff or HR, get teammates (colleagues with same manager) and include direct manager
      if (currentUser.managerId) {
        // Get direct manager details
        directManager = await User.findById(currentUser.managerId)
          .populate("position", "name")
          .select("_id name email role position")
          .lean();

        // Get all teammates with the same manager (excluding self)
        const teammates = await User.find({
          managerId: currentUser.managerId,
          active: true,
          _id: { $ne: currentUserId }, // Exclude self
        })
          .populate("position", "name")
          .populate("skills", "name")
          .select("_id name email role position skills")
          .sort({ name: 1 })
          .lean();

        colleagues = teammates;
      }
    }

    // Format response
    const formattedColleagues = colleagues.map((colleague) => ({
      id: colleague._id,
      name: colleague.name,
      email: colleague.email,
      role: colleague.role,
      position: colleague.position
        ? {
            id: colleague.position._id,
            name: colleague.position.name,
          }
        : null,
      skills: colleague.skills
        ? colleague.skills.map((skill) => ({
            id: skill._id,
            name: skill.name,
          }))
        : [],
    }));

    const response = {
      success: true,
      data: {
        userRole: currentUser.role,
        colleagues: formattedColleagues,
        totalColleagues: formattedColleagues.length,
      },
    };

    // Include manager info if it exists
    if (directManager) {
      response.data.directManager = {
        id: directManager._id,
        name: directManager.name,
        email: directManager.email,
        role: directManager.role,
        position: directManager.position
          ? {
              id: directManager.position._id,
              name: directManager.position.name,
            }
          : null,
      };
    }

    return res.json(response);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
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
  getColleagues,
};
