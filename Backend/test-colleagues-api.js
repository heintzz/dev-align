const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test credentials - update these with actual test users from your database
const TEST_USERS = [
  {
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager'
  },
  {
    email: 'staff@example.com',
    password: 'password123',
    role: 'staff'
  },
  {
    email: 'hr@example.com',
    password: 'password123',
    role: 'hr'
  }
];

async function testColleaguesAPI() {
  console.log('=== Testing Colleagues API ===\n');

  // Try to login with first available user
  let token = null;
  let userRole = null;

  for (const user of TEST_USERS) {
    try {
      console.log(`Attempting login with ${user.email}...`);
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });

      if (loginResponse.data.success) {
        token = loginResponse.data.data.token;
        userRole = loginResponse.data.data.role;
        console.log(`✓ Login successful! Role: ${userRole}`);
        console.log(`Token: ${token.substring(0, 20)}...\n`);
        break;
      }
    } catch (error) {
      console.log(`✗ Login failed for ${user.email}: ${error.response?.data?.message || error.message}`);
    }
  }

  if (!token) {
    console.log('\n❌ Could not login with any test user. Please create test users or update credentials.');
    console.log('You can create a test user via HR endpoint or directly in MongoDB.\n');
    return;
  }

  // Test GET /hr/colleagues
  try {
    console.log('Testing GET /hr/colleagues...');
    const colleaguesResponse = await axios.get(`${BASE_URL}/hr/colleagues`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✓ Colleagues API Success!\n');
    console.log('Response:');
    console.log(JSON.stringify(colleaguesResponse.data, null, 2));

    // Validate response structure
    const data = colleaguesResponse.data.data;
    console.log('\n=== Validation ===');
    console.log(`User Role: ${data.userRole}`);
    console.log(`Total Colleagues: ${data.totalColleagues}`);
    console.log(`Colleagues Count: ${data.colleagues.length}`);

    if (data.directManager) {
      console.log(`Direct Manager: ${data.directManager.name} (${data.directManager.email})`);
    } else {
      console.log('Direct Manager: None (user is likely a manager or top-level)');
    }

    // Display colleague details
    if (data.colleagues.length > 0) {
      console.log('\n=== Colleagues List ===');
      data.colleagues.forEach((colleague, index) => {
        console.log(`${index + 1}. ${colleague.name}`);
        console.log(`   Email: ${colleague.email}`);
        console.log(`   Role: ${colleague.role}`);
        console.log(`   Position: ${colleague.position?.name || 'N/A'}`);
        console.log(`   Skills: ${colleague.skills.length > 0 ? colleague.skills.map(s => s.name).join(', ') : 'None'}`);
      });
    } else {
      console.log('\n⚠ No colleagues found. This could mean:');
      if (userRole === 'manager') {
        console.log('  - This manager has no direct subordinates');
      } else {
        console.log('  - This user has no teammates (no other users with same managerId)');
      }
    }

    console.log('\n✅ Test Completed Successfully!');

  } catch (error) {
    console.log('\n❌ Colleagues API Error:');
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error: ${error.response?.data?.error || error.message}`);
    console.log(`Message: ${error.response?.data?.message || 'No additional message'}`);

    if (error.response?.status === 404) {
      console.log('\nThis might indicate that the current user was not found in the database.');
    }
  }
}

// Run the test
testColleaguesAPI().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
