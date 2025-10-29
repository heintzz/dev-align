# API Documentation - feat/crud_project Branch

## Overview
This document provides comprehensive documentation for all API endpoints created in the `feat/crud_project` branch. This branch implements complete CRUD operations for Project Management and Project Assignment features.

**Base URL**: `http://localhost:5000`

**Swagger Documentation**: `http://localhost:5000/api-docs`

---

## Table of Contents
- [Authentication](#authentication)
- [Project Endpoints](#project-endpoints)
  - [Get Projects (Role-Based)](#1-get-projects-role-based)
  - [Get All Projects (HR Only)](#2-get-all-projects-hr-only)
  - [Get Project by ID](#3-get-project-by-id)
  - [Create Project](#4-create-project)
  - [Update Project](#5-update-project)
  - [Delete Project](#6-delete-project)
- [Project Assignment Endpoints](#project-assignment-endpoints)
  - [Get Project Assignments](#7-get-project-assignments)
  - [Get Assignment by ID](#8-get-assignment-by-id)
  - [Assign User to Project](#9-assign-user-to-project-auto-tech-lead)
  - [Update Assignment](#10-update-assignment)
  - [Remove Assignment](#11-remove-assignment)
- [Key Features](#key-features)
- [Error Codes](#error-codes)
- [Test Credentials](#test-credentials)

---

## Authentication

All endpoints (except authentication endpoints) require a Bearer token in the Authorization header.

**Header Format**:
```
Authorization: Bearer <your_jwt_token>
```

**How to get a token**:
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## Project Endpoints

Base path: `/project`

### 1. Get Projects (Role-Based)

Retrieves projects based on user role with automatic filtering.

**Endpoint**: `GET /project`

**Access**: All authenticated users

**Role Behavior**:
- **Manager**: Returns only projects they created
- **HR**: Returns all projects from all managers

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `perPage` | integer | No | 15 | Number of items per page |
| `status` | string | No | - | Filter by project status |
| `createdBy` | string | No | - | Filter by creator user ID (HR only) |

**Status Values**: `planning`, `active`, `on_hold`, `completed`, `cancelled`

**Request Example**:
```http
GET /project?page=1&perPage=10&status=active
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "page": 1,
    "perPage": 10,
    "total": 2,
    "projects": [
      {
        "_id": "6901bd4ef7ed0f35753d38b9",
        "name": "iOS Native App Development",
        "description": "Develop a native iOS app using SwiftUI",
        "status": "planning",
        "deadline": "2025-12-31T00:00:00.000Z",
        "teamMemberCount": 3,
        "createdBy": {
          "_id": "69016bcc7157f337f7e2e4ea",
          "name": "Tony Yoditanto",
          "email": "tonyoditanto@gmail.com",
          "role": "manager"
        },
        "createdAt": "2025-10-29T07:07:58.883Z",
        "updatedAt": "2025-10-29T07:07:58.883Z"
      },
      {
        "_id": "6901b5caf7ed0f35753d38a3",
        "name": "Mobile App Development",
        "description": "Develop a cross-platform mobile application",
        "status": "planning",
        "deadline": "2025-12-31T00:00:00.000Z",
        "teamMemberCount": 5,
        "createdBy": {
          "_id": "69016bcc7157f337f7e2e4ea",
          "name": "Tony Yoditanto",
          "email": "tonyoditanto@gmail.com",
          "role": "manager"
        },
        "createdAt": "2025-10-29T06:35:54.665Z",
        "updatedAt": "2025-10-29T06:35:54.665Z"
      }
    ]
  }
}
```

---

### 2. Get All Projects (HR Only)

HR-exclusive endpoint to view all projects from all managers without role-based filtering.

**Endpoint**: `GET /project/all`

**Access**: HR only

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `perPage` | integer | No | 15 | Number of items per page |
| `status` | string | No | - | Filter by project status |
| `createdBy` | string | No | - | Filter by creator user ID |

**Request Example**:
```http
GET /project/all?page=1&perPage=15
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "page": 1,
    "perPage": 15,
    "total": 5,
    "projects": [
      {
        "_id": "6901bd4ef7ed0f35753d38b9",
        "name": "iOS Native App Development",
        "description": "Develop a native iOS app using SwiftUI",
        "status": "planning",
        "deadline": "2025-12-31T00:00:00.000Z",
        "teamMemberCount": 3,
        "createdBy": {
          "_id": "69016bcc7157f337f7e2e4ea",
          "name": "Tony Yoditanto",
          "email": "tonyoditanto@gmail.com",
          "role": "manager"
        },
        "createdAt": "2025-10-29T07:07:58.883Z",
        "updatedAt": "2025-10-29T07:07:58.883Z"
      }
    ]
  }
}
```

**Error** (403 Forbidden):
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Access denied"
}
```

---

### 3. Get Project by ID

Retrieves detailed information about a specific project.

**Endpoint**: `GET /project/:projectId`

**Access**: All authenticated users

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | MongoDB ObjectId of the project |

**Request Example**:
```http
GET /project/6901b5caf7ed0f35753d38a3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "6901b5caf7ed0f35753d38a3",
    "name": "Mobile App Development",
    "description": "Develop a cross-platform mobile application for iOS and Android",
    "status": "planning",
    "deadline": "2025-12-31T00:00:00.000Z",
    "teamMemberCount": 5,
    "createdBy": {
      "_id": "69016bcc7157f337f7e2e4ea",
      "name": "Tony Yoditanto",
      "email": "tonyoditanto@gmail.com"
    },
    "createdAt": "2025-10-29T06:35:54.665Z",
    "updatedAt": "2025-10-29T06:35:54.665Z",
    "__v": 0
  }
}
```

**Error** (404 Not Found):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Project not found"
}
```

---

### 4. Create Project

Creates a new project. The `createdBy` field is automatically set from the authenticated user.

**Endpoint**: `POST /project`

**Access**: Manager or HR only

**Request Body**:

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | 100 | Project name |
| `description` | string | Yes | - | Project description |
| `status` | string | No | - | Project status (default: `planning`) |
| `deadline` | date | No | - | Project deadline (ISO 8601 format) |
| `teamMemberCount` | integer | No | - | Number of team members (default: 0) |

**Status Values**: `planning`, `active`, `on_hold`, `completed`, `cancelled`

**Request Example**:
```http
POST /project
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Mobile App Development",
  "description": "Develop a cross-platform mobile application for iOS and Android",
  "status": "planning",
  "deadline": "2025-12-31",
  "teamMemberCount": 5
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "name": "Mobile App Development",
    "description": "Develop a cross-platform mobile application for iOS and Android",
    "status": "planning",
    "deadline": "2025-12-31T00:00:00.000Z",
    "teamMemberCount": 5,
    "createdBy": "69016bcc7157f337f7e2e4ea",
    "_id": "6901b5caf7ed0f35753d38a3",
    "createdAt": "2025-10-29T06:35:54.665Z",
    "updatedAt": "2025-10-29T06:35:54.665Z",
    "__v": 0
  }
}
```

**Error** (400 Bad Request - Missing Name):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Project name must be specified"
}
```

**Error** (400 Bad Request - Missing Description):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Project description must be specified"
}
```

---

### 5. Update Project

Updates an existing project. Only provided fields will be updated.

**Endpoint**: `PUT /project/:projectId`

**Access**: Manager or HR only

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | MongoDB ObjectId of the project |

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Project name |
| `description` | string | No | Project description |
| `status` | string | No | Project status |
| `deadline` | date | No | Project deadline |
| `teamMemberCount` | integer | No | Number of team members |

**Request Example**:
```http
PUT /project/6901b5caf7ed0f35753d38a3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "active",
  "teamMemberCount": 8
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "6901b5caf7ed0f35753d38a3",
    "name": "Mobile App Development",
    "description": "Develop a cross-platform mobile application for iOS and Android",
    "status": "active",
    "deadline": "2025-12-31T00:00:00.000Z",
    "teamMemberCount": 8,
    "createdBy": "69016bcc7157f337f7e2e4ea",
    "createdAt": "2025-10-29T06:35:54.665Z",
    "updatedAt": "2025-10-29T08:15:32.442Z",
    "__v": 0
  }
}
```

**Error** (404 Not Found):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Project not found"
}
```

---

### 6. Delete Project

Permanently deletes a project from the database.

**Endpoint**: `DELETE /project/:projectId`

**Access**: Manager or HR only

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | MongoDB ObjectId of the project |

**Request Example**:
```http
DELETE /project/6901b5caf7ed0f35753d38a3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (204 No Content):
```
(Empty body - successful deletion)
```

**Error** (404 Not Found):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Project not found"
}
```

---

## Project Assignment Endpoints

Base path: `/project-assignment`

### 7. Get Project Assignments

Retrieves all project assignments with pagination and optional filtering.

**Endpoint**: `GET /project-assignment`

**Access**: All authenticated users

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `perPage` | integer | No | 15 | Number of items per page |
| `projectId` | string | No | - | Filter by project ID |
| `userId` | string | No | - | Filter by user ID |
| `isTechLead` | boolean | No | - | Filter by tech lead status |

**Request Example**:
```http
GET /project-assignment?projectId=6901b5caf7ed0f35753d38a3&page=1&perPage=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "page": 1,
    "perPage": 10,
    "total": 3,
    "assignments": [
      {
        "_id": "6901b5e8f7ed0f35753d38a9",
        "projectId": {
          "_id": "6901b5caf7ed0f35753d38a3",
          "name": "Mobile App Development",
          "description": "Develop a cross-platform mobile application",
          "status": "planning",
          "deadline": "2025-12-31T00:00:00.000Z"
        },
        "userId": {
          "_id": "69016bcc7157f337f7e2e4ea",
          "name": "Tony Yoditanto",
          "email": "tonyoditanto@gmail.com",
          "role": "manager",
          "position": null
        },
        "isTechLead": true,
        "__v": 0
      }
    ]
  }
}
```

---

### 8. Get Assignment by ID

Retrieves detailed information about a specific project assignment.

**Endpoint**: `GET /project-assignment/:assignmentId`

**Access**: All authenticated users

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `assignmentId` | string | Yes | MongoDB ObjectId of the assignment |

**Request Example**:
```http
GET /project-assignment/6901b5e8f7ed0f35753d38a9
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "6901b5e8f7ed0f35753d38a9",
    "projectId": {
      "_id": "6901b5caf7ed0f35753d38a3",
      "name": "Mobile App Development",
      "description": "Develop a cross-platform mobile application",
      "status": "planning",
      "deadline": "2025-12-31T00:00:00.000Z"
    },
    "userId": {
      "_id": "69016bcc7157f337f7e2e4ea",
      "name": "Tony Yoditanto",
      "email": "tonyoditanto@gmail.com",
      "role": "manager",
      "position": null
    },
    "isTechLead": true,
    "__v": 0
  }
}
```

**Error** (404 Not Found):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Assignment not found"
}
```

---

### 9. Assign User to Project (Auto Tech Lead)

Assigns a user to a project with automatic tech lead assignment for managers.

**Endpoint**: `POST /project-assignment`

**Access**: Manager or HR only

**⭐ Special Feature**: If the user's role is `manager`, the `isTechLead` field is **automatically set to `true`**, regardless of the value sent in the request.

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | string | Yes | MongoDB ObjectId of the project |
| `userId` | string | Yes | MongoDB ObjectId of the user to assign |
| `isTechLead` | boolean | No | Tech lead status (automatically `true` for managers) |

**Request Example**:
```http
POST /project-assignment
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "projectId": "6901b5caf7ed0f35753d38a3",
  "userId": "69016bcc7157f337f7e2e4ea",
  "isTechLead": false
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "6901b5e8f7ed0f35753d38a9",
    "projectId": {
      "_id": "6901b5caf7ed0f35753d38a3",
      "name": "Mobile App Development",
      "description": "Develop a cross-platform mobile application",
      "status": "planning"
    },
    "userId": {
      "_id": "69016bcc7157f337f7e2e4ea",
      "name": "Tony Yoditanto",
      "email": "tonyoditanto@gmail.com",
      "role": "manager"
    },
    "isTechLead": true,
    "__v": 0
  }
}
```

**Note**: Even though `isTechLead: false` was sent in the request, it was automatically set to `true` because the user's role is `manager`.

**Error** (400 Bad Request - Missing Fields):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Project ID and User ID must be specified"
}
```

**Error** (400 Bad Request - Already Assigned):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "User is already assigned to this project"
}
```

**Error** (404 Not Found - User Not Found):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "User not found"
}
```

---

### 10. Update Assignment

Updates a project assignment with automatic tech lead enforcement for managers.

**Endpoint**: `PUT /project-assignment/:assignmentId`

**Access**: Manager or HR only

**⭐ Special Feature**: Managers will always remain as tech leads regardless of the `isTechLead` value sent in the request.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `assignmentId` | string | Yes | MongoDB ObjectId of the assignment |

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isTechLead` | boolean | No | Tech lead status (automatically `true` for managers) |

**Request Example**:
```http
PUT /project-assignment/6901b5e8f7ed0f35753d38a9
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "isTechLead": false
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "6901b5e8f7ed0f35753d38a9",
    "projectId": {
      "_id": "6901b5caf7ed0f35753d38a3",
      "name": "Mobile App Development",
      "description": "Develop a cross-platform mobile application",
      "status": "planning"
    },
    "userId": {
      "_id": "69016bcc7157f337f7e2e4ea",
      "name": "Tony Yoditanto",
      "email": "tonyoditanto@gmail.com",
      "role": "manager"
    },
    "isTechLead": true,
    "__v": 0
  }
}
```

**Note**: The `isTechLead` remains `true` because the user is a manager and cannot be demoted from tech lead status.

**Error** (404 Not Found):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Assignment not found"
}
```

---

### 11. Remove Assignment

Removes a user's assignment from a project.

**Endpoint**: `DELETE /project-assignment/:assignmentId`

**Access**: Manager or HR only

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `assignmentId` | string | Yes | MongoDB ObjectId of the assignment |

**Request Example**:
```http
DELETE /project-assignment/6901b5e8f7ed0f35753d38a9
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (204 No Content):
```
(Empty body - successful deletion)
```

**Error** (404 Not Found):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Assignment not found"
}
```

---

## Summary Table

| # | Endpoint | Method | Access | Description |
|---|----------|--------|--------|-------------|
| 1 | `/project` | GET | All | Get projects (role-based filtering) |
| 2 | `/project/all` | GET | HR | Get all projects (HR only) |
| 3 | `/project/:projectId` | GET | All | Get project by ID |
| 4 | `/project` | POST | Manager/HR | Create new project |
| 5 | `/project/:projectId` | PUT | Manager/HR | Update existing project |
| 6 | `/project/:projectId` | DELETE | Manager/HR | Delete project |
| 7 | `/project-assignment` | GET | All | Get all assignments (with filters) |
| 8 | `/project-assignment/:assignmentId` | GET | All | Get assignment by ID |
| 9 | `/project-assignment` | POST | Manager/HR | Assign user to project (auto tech lead) |
| 10 | `/project-assignment/:assignmentId` | PUT | Manager/HR | Update assignment |
| 11 | `/project-assignment/:assignmentId` | DELETE | Manager/HR | Remove assignment |

---

## Key Features

### 1. Role-Based Access Control
- **Managers**: Can only view and manage their own projects
- **HR**: Has full access to all projects across all managers
- Automatic filtering based on JWT token role

### 2. Auto Tech Lead Assignment
- Users with `manager` role are **automatically assigned as tech leads**
- Cannot be demoted from tech lead status
- Enforced during both creation and update operations
- Provides consistent leadership hierarchy

### 3. Comprehensive Filtering
- Filter projects by status, creator, date
- Filter assignments by project, user, tech lead status
- Pagination support on all list endpoints
- Query parameters for flexible data retrieval

### 4. Full CRUD Operations
- Complete Create, Read, Update, Delete functionality
- Consistent response format across all endpoints
- Proper error handling with descriptive messages
- RESTful API design principles

### 5. Data Population
- Automatic population of related data (user details, project details)
- Reduced need for multiple API calls
- Complete information in single response

### 6. Swagger Documentation
- Interactive API documentation at `/api-docs`
- Try-it-out functionality for testing
- Complete request/response examples
- Schema definitions and validation rules

---

## Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 204 | No Content | Resource deleted successfully |
| 400 | Bad Request | Invalid request data or missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have permission for this action |
| 404 | Not Found | Requested resource doesn't exist |
| 500 | Internal Server Error | Server error occurred |

---

## Test Credentials

### Manager User
```
Email: tonyoditanto@gmail.com
Password: nejryy5u
Role: manager
```

### HR User
```
Email: hr@devalign.com
Password: hrpassword123
Role: hr
```

### Login Example
```http
POST /auth/login
Content-Type: application/json

{
  "email": "tonyoditanto@gmail.com",
  "password": "nejryy5u"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "69016bcc7157f337f7e2e4ea",
    "role": "manager",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Files Modified/Created

### Created Files
- `Backend/controllers/project.controller.js` - Project CRUD logic
- `Backend/controllers/project-assignment.controller.js` - Assignment CRUD logic with auto tech lead
- `Backend/routes/project.routes.js` - Project route definitions
- `Backend/routes/project-assignment.routes.js` - Assignment route definitions

### Modified Files
- `Backend/models/schemas/project.schema.js` - Updated project schema with new fields
- `Backend/models/schemas/project-assignments.schema.js` - Updated to match codebase pattern
- `Backend/models/index.js` - Added Project and ProjectAssignment exports
- `Backend/index.js` - Registered project and assignment routes

---

## Postman Collection

You can import these endpoints into Postman or use the Swagger UI at `http://localhost:5000/api-docs` for interactive testing.

### Example Postman Request Configuration

**Headers**:
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Body** (for POST/PUT requests):
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "planning",
  "deadline": "2025-12-31",
  "teamMemberCount": 5
}
```

---

## Support

For issues or questions:
1. Check the Swagger documentation at `/api-docs`
2. Review this documentation
3. Check server logs for detailed error messages
4. Verify authentication token is valid and not expired

---

**Last Updated**: 2025-10-29
**Branch**: feat/crud_project
**Version**: 1.0.0
