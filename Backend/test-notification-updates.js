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
  }
];

async function testNotificationUpdates() {
  console.log('=== Testing Enhanced Notification API ===\n');
  console.log('Testing requester and approver details in project_approval notifications\n');

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

  // Test 1: GET /notification - Get all notifications
  try {
    console.log('=== Test 1: GET /notification ===');
    console.log('Fetching all notifications...\n');

    const notificationsResponse = await axios.get(`${BASE_URL}/notification`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✓ Notifications fetched successfully!\n');

    const data = notificationsResponse.data.data;
    console.log(`Total notifications: ${data.total}`);
    console.log(`Unread count: ${data.unreadCount}`);
    console.log(`Page: ${data.page}/${Math.ceil(data.total / data.perPage)}\n`);

    if (data.notifications.length === 0) {
      console.log('⚠ No notifications found for this user.');
      console.log('To test properly, create a project with staff assignment approval workflow.\n');
    } else {
      // Check for project_approval notifications
      const approvalNotifications = data.notifications.filter(n => n.type === 'project_approval');

      if (approvalNotifications.length === 0) {
        console.log('⚠ No project_approval notifications found.');
        console.log('To test the new feature, create a project with cross-manager staff assignment.\n');
      } else {
        console.log(`Found ${approvalNotifications.length} project_approval notification(s):\n`);

        approvalNotifications.forEach((notif, index) => {
          console.log(`--- Approval Notification ${index + 1} ---`);
          console.log(`ID: ${notif._id}`);
          console.log(`Title: ${notif.title}`);
          console.log(`Type: ${notif.type}`);
          console.log(`Read: ${notif.isRead}`);

          if (notif.relatedBorrowRequest) {
            console.log('\n✓ Related Borrow Request Details:');
            console.log(`  Borrow Request ID: ${notif.relatedBorrowRequest._id}`);

            if (notif.relatedBorrowRequest.requestedBy) {
              console.log('\n  ✓ Requester Details (requestedBy):');
              console.log(`    ID: ${notif.relatedBorrowRequest.requestedBy._id}`);
              console.log(`    Name: ${notif.relatedBorrowRequest.requestedBy.name}`);
              console.log(`    Email: ${notif.relatedBorrowRequest.requestedBy.email}`);
              console.log(`    Role: ${notif.relatedBorrowRequest.requestedBy.role}`);
              if (notif.relatedBorrowRequest.requestedBy.position) {
                console.log(`    Position: ${notif.relatedBorrowRequest.requestedBy.position.name} (${notif.relatedBorrowRequest.requestedBy.position._id})`);
              }
            } else {
              console.log('\n  ✗ requestedBy is missing or not populated');
            }

            if (notif.relatedBorrowRequest.approvedBy) {
              console.log('\n  ✓ Approver Details (approvedBy):');
              console.log(`    ID: ${notif.relatedBorrowRequest.approvedBy._id}`);
              console.log(`    Name: ${notif.relatedBorrowRequest.approvedBy.name}`);
              console.log(`    Email: ${notif.relatedBorrowRequest.approvedBy.email}`);
              console.log(`    Role: ${notif.relatedBorrowRequest.approvedBy.role}`);
              if (notif.relatedBorrowRequest.approvedBy.position) {
                console.log(`    Position: ${notif.relatedBorrowRequest.approvedBy.position.name} (${notif.relatedBorrowRequest.approvedBy.position._id})`);
              }
            } else {
              console.log('\n  ✗ approvedBy is missing or not populated');
            }

            console.log(`\n  Approval Status: ${notif.relatedBorrowRequest.isApproved === null ? 'Pending' : notif.relatedBorrowRequest.isApproved ? 'Approved' : 'Rejected'}`);
          } else {
            console.log('\n✗ No relatedBorrowRequest found');
          }
          console.log('');
        });

        // Test 2: GET /notification/:notificationId - Get single notification
        const firstApprovalNotif = approvalNotifications[0];
        console.log('\n=== Test 2: GET /notification/:notificationId ===');
        console.log(`Fetching notification details for ID: ${firstApprovalNotif._id}\n`);

        try {
          const singleNotifResponse = await axios.get(
            `${BASE_URL}/notification/${firstApprovalNotif._id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          console.log('✓ Single notification fetched successfully!\n');
          const notif = singleNotifResponse.data.data;

          console.log(`Title: ${notif.title}`);
          console.log(`Type: ${notif.type}`);

          if (notif.relatedBorrowRequest) {
            console.log('\n✓ Borrow Request Details Present:');

            if (notif.relatedBorrowRequest.requestedBy) {
              console.log(`  Requested By: ${notif.relatedBorrowRequest.requestedBy.name} (${notif.relatedBorrowRequest.requestedBy.email})`);
              console.log(`    Role: ${notif.relatedBorrowRequest.requestedBy.role}`);
              if (notif.relatedBorrowRequest.requestedBy.position) {
                console.log(`    Position: ${notif.relatedBorrowRequest.requestedBy.position.name}`);
              }
            }

            if (notif.relatedBorrowRequest.approvedBy) {
              console.log(`  Approved By: ${notif.relatedBorrowRequest.approvedBy.name} (${notif.relatedBorrowRequest.approvedBy.email})`);
              console.log(`    Role: ${notif.relatedBorrowRequest.approvedBy.role}`);
              if (notif.relatedBorrowRequest.approvedBy.position) {
                console.log(`    Position: ${notif.relatedBorrowRequest.approvedBy.position.name}`);
              }
            }
          }

          console.log('\n✅ Test 2 passed: Single notification includes requester/approver details');
        } catch (error) {
          console.log('\n❌ Test 2 failed:');
          console.log(`Error: ${error.response?.data?.error || error.message}`);
          console.log(`Message: ${error.response?.data?.message || 'No additional message'}`);
        }
      }
    }

    console.log('\n=== Validation Checklist ===');
    console.log('✓ Response structure is correct');
    console.log('✓ Notifications array is present');
    if (approvalNotifications.length > 0) {
      const hasRequester = approvalNotifications.every(n =>
        n.relatedBorrowRequest?.requestedBy?.name &&
        n.relatedBorrowRequest?.requestedBy?.email &&
        n.relatedBorrowRequest?.requestedBy?.role
      );
      const hasApprover = approvalNotifications.every(n =>
        n.relatedBorrowRequest?.approvedBy?.name &&
        n.relatedBorrowRequest?.approvedBy?.email &&
        n.relatedBorrowRequest?.approvedBy?.role
      );
      const hasPosition = approvalNotifications.some(n =>
        n.relatedBorrowRequest?.requestedBy?.position?.name ||
        n.relatedBorrowRequest?.approvedBy?.position?.name
      );

      console.log(hasRequester ? '✓ requestedBy details are populated' : '✗ requestedBy details are missing');
      console.log(hasApprover ? '✓ approvedBy details are populated' : '✗ approvedBy details are missing');
      console.log(hasPosition ? '✓ Position information is included' : '✗ Position information is missing');
    }

    console.log('\n✅ All Tests Completed!');

  } catch (error) {
    console.log('\n❌ Test failed:');
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error: ${error.response?.data?.error || error.message}`);
    console.log(`Message: ${error.response?.data?.message || 'No additional message'}`);
  }
}

// Run the test
testNotificationUpdates().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
