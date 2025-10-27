#!/usr/bin/env node
// Simple bootstrap script to create a single HR user in the database.
// Usage (from Backend folder, .env present):
//   node scripts/bootstrap-hr.js --email=you@example.com --password=StrongPass123 --name="Your Name"

const mongoose = require('mongoose');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).options({
  email: { type: 'string', demandOption: true },
  password: { type: 'string', demandOption: true },
  name: { type: 'string', default: 'Bootstrap HR' },
}).argv;

(async () => {
  try {
    // load .env if present
    try { require('dotenv').config(); } catch (e) { /* ignore if dotenv not installed */ }

    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error('MONGO_URI not found in environment. Ensure .env exists or MONGO_URI is set.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    // require models and utils from project
    const { User } = require('../models');
    const { hashPassword } = require('../utils/password');

    const exists = await User.findOne({ email: argv.email });
    if (exists) {
      console.log('User already exists:', exists._id.toString(), exists.email);
      process.exit(0);
    }

    const hashed = await hashPassword(argv.password);
    const u = new User({
      name: argv.name,
      email: argv.email,
      role: 'hr',
      password: hashed,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await u.save();
    console.log('Created HR user:', saved._id.toString(), 'email:', saved.email);
    console.log('You can now login via POST /auth/login and get a token.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create HR user:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
