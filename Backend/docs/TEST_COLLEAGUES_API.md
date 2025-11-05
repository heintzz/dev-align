# Testing the Colleagues API Endpoint

This document provides instructions for testing the new **GET /hr/colleagues** endpoint.

## Endpoint Overview

**Endpoint**: `GET /hr/colleagues`
**Authentication**: Required (Bearer Token)
**Access**: All authenticated users

## Prerequisites

1. Backend server running on `http://localhost:5000`
2. Valid user account with one of these roles:
   - `staff` - will see teammates with same manager + direct manager
   - `manager` - will see direct subordinates
   - `hr` - will see teammates with same manager + direct manager

## Test Scenarios

### Scenario 1: Test as Staff Member

**Expected Behavior**:
- Returns teammates who have the same `managerId` as the current user
- Excludes the current user from the list
- Includes the direct manager information

**Test Steps**:

1. Login as a staff member:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "staff@example.com", "password": "yourpassword"}'
```

2. Copy the token from the response

3. Get colleagues list:
```bash
curl -X GET http://localhost:5000/hr/colleagues \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "userRole": "staff",
    "colleagues": [
      {
        "id": "...",
        "name": "Teammate Name",
        "email": "teammate@example.com",
        "role": "staff",
        "position": {
          "id": "...",
          "name": "Position Name"
        },
        "skills": [
          {
            "id": "...",
            "name": "Skill Name"
          }
        ]
      }
    ],
    "directManager": {
      "id": "...",
      "name": "Manager Name",
      "email": "manager@example.com",
      "role": "manager",
      "position": {
        "id": "...",
        "name": "Manager Position"
      }
    },
    "totalColleagues": 2
  }
}
```

---

### Scenario 2: Test as Manager

**Expected Behavior**:
- Returns all direct subordinates (users where `managerId` equals the manager's ID)
- Excludes the current user from the list
- Does NOT include directManager field (managers don't have this)

**Test Steps**:

1. Login as a manager:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@example.com", "password": "yourpassword"}'
```

2. Copy the token from the response

3. Get colleagues list (subordinates):
```bash
curl -X GET http://localhost:5000/hr/colleagues \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "userRole": "manager",
    "colleagues": [
      {
        "id": "...",
        "name": "Subordinate 1",
        "email": "staff1@example.com",
        "role": "staff",
        "position": {
          "id": "...",
          "name": "Developer"
        },
        "skills": [...]
      },
      {
        "id": "...",
        "name": "Subordinate 2",
        "email": "staff2@example.com",
        "role": "staff",
        "position": {
          "id": "...",
          "name": "Designer"
        },
        "skills": [...]
      }
    ],
    "totalColleagues": 2
  }
}
```

---

### Scenario 3: Test with User Who Has No Manager

**Expected Behavior**:
- Returns empty colleagues list
- No directManager field

**Test Steps**:

1. Login as a user without managerId (top-level or orphaned user)
2. Get colleagues list
3. Should receive empty colleagues array and no directManager

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "userRole": "staff",
    "colleagues": [],
    "totalColleagues": 0
  }
}
```

---

## Testing with Postman

### 1. Import Collection
Import the DevAlign Postman collection from `Backend/docs/`

### 2. Add New Request

**Request Name**: Get Colleagues List
**Method**: GET
**URL**: `{{baseUrl}}/hr/colleagues`
**Headers**:
- `Authorization`: `Bearer {{token}}`

### 3. Pre-request Script
Ensure you have a valid token by running the login request first.

---

## Testing with Swagger UI

1. Navigate to: `http://localhost:5000/api-docs`
2. Find the **HR** section
3. Locate **GET /hr/colleagues**
4. Click "Try it out"
5. Click "Execute"
6. View the response

---

## Automated Test Script

Run the provided test script:

```bash
cd Backend
node test-colleagues-api.js
```

**Note**: Update the TEST_USERS array in the script with valid credentials from your database.

---

## Validation Checklist

After running tests, verify:

- ✅ Response has correct structure (success, data)
- ✅ userRole matches the authenticated user's role
- ✅ colleagues array contains correct users
- ✅ Current user is NOT in colleagues list
- ✅ Only active users are returned
- ✅ Colleagues are sorted by name
- ✅ Position and skills are populated correctly
- ✅ For staff/HR: directManager is included
- ✅ For manager: directManager is NOT included
- ✅ totalColleagues matches array length

---

## Common Issues

### Issue 1: Empty Colleagues List

**Possible Causes**:
- User has no manager (managerId is null)
- Manager has no subordinates
- All colleagues are inactive
- Database has no other users

**Solution**:
- Check user's managerId in database
- Create test users with proper managerId relationships

### Issue 2: 404 User Not Found

**Possible Causes**:
- Token is invalid or expired
- User account was deleted

**Solution**:
- Login again to get fresh token
- Verify user exists in database

### Issue 3: directManager is null

**Possible Causes**:
- User is a manager
- User's managerId is null
- Manager account doesn't exist

**Solution**:
- This is expected for managers
- For staff, verify managerId field is set

---

## Database Setup for Testing

### Create Test Manager:
```javascript
// In MongoDB or via HR API
{
  "name": "Test Manager",
  "email": "testmanager@example.com",
  "password": "hashed_password",
  "role": "manager",
  "managerId": null,
  "active": true
}
```

### Create Test Staff (under manager):
```javascript
// In MongoDB or via HR API
{
  "name": "Test Staff 1",
  "email": "teststaff1@example.com",
  "password": "hashed_password",
  "role": "staff",
  "managerId": "<manager_id_from_above>",
  "active": true
}

{
  "name": "Test Staff 2",
  "email": "teststaff2@example.com",
  "password": "hashed_password",
  "role": "staff",
  "managerId": "<manager_id_from_above>",
  "active": true
}
```

---

## Success Criteria

The endpoint is working correctly if:

1. **Staff user can see**:
   - All teammates with same managerId
   - Their direct manager information
   - Not themselves in the list

2. **Manager can see**:
   - All direct subordinates
   - No directManager field
   - Not themselves in the list

3. **All responses**:
   - Include position and skills data
   - Are sorted alphabetically by name
   - Only include active users
   - Have correct totalColleagues count

---

## Next Steps

After successful testing:

1. ✅ Create Postman request for this endpoint
2. ✅ Add to integration test suite
3. ✅ Document in API documentation
4. ✅ Update Swagger definitions
5. ✅ Add to frontend integration guide
