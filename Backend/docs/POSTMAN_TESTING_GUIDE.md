# DevAlign - Postman Testing Guide

This guide provides step-by-step instructions for testing the project management API endpoints using Postman.

## Setup

1. Import the Postman collection:
   - Open Postman
   - Go to File > Import
   - Select `DevAlign-HR-API.postman_collection.json` from the `docs` folder

2. Set up environment variables:
   - Create a new environment named "DevAlign Local"
   - Add these variables:
     - `baseUrl`: `http://localhost:5000`
     - `token`: (leave empty, will be filled after login)

## Authentication

First, you need to get a JWT token:

1. Login as Manager:
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "tonyoditanto@gmail.com",
  "password": "nejryy5u"
}
```

2. Login as HR:
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "hr@devalign.com",
  "password": "hrpassword123"
}
```

3. After successful login, copy the token from the response and set it in your environment variable `token`.

## Testing Flow

### 1. Create a New Project (as Manager)

1. Create Project with Staff:
```http
POST {{baseUrl}}/project/with-assignments
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Mobile App Development",
  "description": "Develop a cross-platform mobile application",
  "startDate": "2025-10-30",
  "deadline": "2025-12-31",
  "staffIds": [
    "69016bcc7157f337f7e2e4eb",  // John Developer (Senior)
    "69016bcc7157f337f7e2e4ec"   // Jane Designer
  ]
}
```

Expected response (201 Created):
```json
{
  "success": true,
  "data": {
    "project": {
      "_id": "6901b5caf7ed0f35753d38a3",
      "name": "Mobile App Development",
      "status": "active",
      ...
    },
    "assignments": [...]
  }
}
```

2. Save the project ID from the response for later use:
   - In Postman environment, add variable: `projectId`
   - Set its value to the `_id` from the response

### 2. View Project Details

1. Get Project Details:
```http
GET {{baseUrl}}/project/{{projectId}}/details
Authorization: Bearer {{token}}
```

Expected response (200 OK):
```json
{
  "success": true,
  "data": {
    "project": {...},
    "managerId": "69016bcc7157f337f7e2e4ea",
    "allStaffIds": [...],
    "techLeadStaffIds": [...],
    ...
  }
}
```

### 3. Test Task Management (DEV-79, DEV-80)

1. View Project Tasks:
```http
GET {{baseUrl}}/project/{{projectId}}/tasks
Authorization: Bearer {{token}}
```

2. Update Task Status (To Do → In Progress):
```http
PUT {{baseUrl}}/project/tasks/{{taskId}}/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "in_progress"
}
```

#### Task Status Transition Testing

Test each valid transition:

1. Todo → In Progress:
```json
{
  "status": "in_progress"
}
```

2. In Progress → Done:
```json
{
  "status": "done"
}
```

3. Done → In Progress (Reopening):
```json
{
  "status": "in_progress"
}
```

4. In Progress → Todo (Moving back):
```json
{
  "status": "todo"
}
```

Test invalid transitions to verify error handling:

1. Todo → Done (Invalid):
```json
{
  "status": "done"
}
```

Expected error (400 Bad Request):
```json
{
  "success": false,
  "error": "Invalid Status Transition",
  "message": "Cannot transition from todo to done",
  "allowedTransitions": ["in_progress"]
}
```

### 4. Role-Based Access Testing

1. Test as Manager (View Own Projects):
```http
GET {{baseUrl}}/project
Authorization: Bearer {{token}}
```

2. Test as HR (View All Projects):
```http
GET {{baseUrl}}/project/all
Authorization: Bearer {{token}}
```

3. Test as Staff (View Assigned Projects):
- Login as a staff member
- Try accessing projects

### 5. Error Case Testing

1. Try Updating Task with Invalid Status:
```http
PUT {{baseUrl}}/project/tasks/{{taskId}}/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "invalid_status"
}
```

2. Try Accessing Task Without Project Membership:
- Login as a different user not assigned to the project
- Try accessing tasks

3. Try Invalid Task ID:
```http
PUT {{baseUrl}}/project/tasks/invalid_id/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "in_progress"
}
```

## Common Issues & Solutions

1. Authentication Issues:
   - Check if token is expired
   - Ensure token is properly set in Postman environment
   - Verify user role has necessary permissions

2. 404 Not Found:
   - Verify project/task IDs exist
   - Check URL path is correct
   - Ensure you're using the correct environment variables

3. 403 Forbidden:
   - Verify user is assigned to project
   - Check user has correct role permissions
   - For tasks, verify user is either assigned to task or is tech lead

## Testing Checklist

### Project Management
- [ ] Create new project
- [ ] View project details
- [ ] Assign tech lead
- [ ] Update project details
- [ ] Delete project

### Task Management
- [ ] View project tasks
- [ ] Update task status: todo → in_progress
- [ ] Update task status: in_progress → done
- [ ] Update task status: done → in_progress
- [ ] Update task status: in_progress → todo
- [ ] Verify invalid transitions are blocked
- [ ] Verify non-assigned users cannot update tasks
- [ ] Verify tech leads can update any task

### Role-Based Access
- [ ] Manager can view own projects
- [ ] HR can view all projects
- [ ] Staff can view assigned projects
- [ ] Staff cannot view unassigned projects

## Troubleshooting

If you encounter issues:

1. Check Response Headers:
   - Look for specific error messages
   - Note any rate limiting headers

2. Verify Request Format:
   - Content-Type header is set correctly
   - Request body follows schema exactly
   - All required fields are included

3. Environment Setup:
   - Base URL is correct
   - Token is valid and properly formatted
   - Project/Task IDs are valid

4. Common Status Codes:
   - 400: Check request body format
   - 401: Re-authenticate to get new token
   - 403: Verify user permissions
   - 404: Check resource IDs
   - 500: Contact backend team

## Need Help?

If you encounter any issues not covered in this guide:
1. Check server logs for detailed error messages
2. Review API documentation at `/api-docs`
3. Contact the backend team with:
   - Request details (URL, method, body)
   - Response received
   - Environment details