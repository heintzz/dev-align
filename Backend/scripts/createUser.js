const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const userSchema = require('../models/schemas/user.schema');
const User = mongoose.model('User', userSchema);

async function createUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Data user yang mau dibuat
    const userData = {
      name: 'akunhr',
      email: 'akunhr@gmail.com',
      password: 'hr123',
      role: 'hr',
    };

    // Cek apakah email sudah ada
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log('❌ User with this email already exists!');
      mongoose.disconnect();
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Buat user
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
    });

    console.log('✅ USER CREATED SUCCESSFULLY!\n');
    console.log('========================================');
    console.log('📋 LOGIN CREDENTIALS (SIMPAN INI!):');
    console.log('========================================');
    console.log('Email    :', user.email);
    console.log('Password :', userData.password);
    console.log('Role     :', user.role);
    console.log('========================================\n');

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
    process.exit(1);
  }
}

createUser();
