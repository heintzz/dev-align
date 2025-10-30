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
  - [Create Project with Staff Assignments](#5-create-project-with-staff-assignments-combined)
  - [Update Project](#6-update-project)
  - [Delete Project](#7-delete-project)
- [Project Assignment Endpoints](#project-assignment-endpoints)
  - [Get Project Assignments](#8-get-project-assignments)
  - [Get Assignment by ID](#9-get-assignment-by-id)
  - [Assign User to Project](#10-assign-user-to-project-auto-tech-lead)
  - [Update Assignment](#11-update-assignment)
  - [Remove Assignment](#12-remove-assignment)
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

**Status Values**: `active`, `completed`

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
        "status": "active",
        "startDate": "2025-10-29T00:00:00.000Z",
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
        "status": "active",
        "startDate": "2025-10-29T00:00:00.000Z",
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
        "status": "active",
        "startDate": "2025-10-29T00:00:00.000Z",
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
    "status": "active",
    "startDate": "2025-10-29T00:00:00.000Z",
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

### 3a. Get Comprehensive Project Details

Retrieves complete project information including manager, all staff, and tech leads in a single request.

**Endpoint**: `GET /project/:projectId/details`

**Access**: All authenticated users

**⭐ Special Features**:
- Returns all information in a single API call
- Includes manager ID, all staff IDs, and tech lead staff IDs
- Provides detailed information about all team members
- Excludes manager from tech lead staff IDs (manager is always tech lead by default)

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | MongoDB ObjectId of the project |

**Request Example**:
```http
GET /project/6901b5caf7ed0f35753d38a3/details
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "project": {
      "_id": "6901b5caf7ed0f35753d38a3",
      "name": "Mobile App Development",
      "description": "Develop a cross-platform mobile application",
      "status": "active",
      "startDate": "2025-10-30T00:00:00.000Z",
      "deadline": "2025-12-31T00:00:00.000Z",
      "teamMemberCount": 5,
      "createdAt": "2025-10-29T06:35:54.665Z",
      "updatedAt": "2025-10-29T06:35:54.665Z"
    },
    "managerId": "69016bcc7157f337f7e2e4ea",
    "allStaffIds": [
      "69016bcc7157f337f7e2e4ea",
      "69016bcc7157f337f7e2e4eb",
      "69016bcc7157f337f7e2e4ec",
      "69016bcc7157f337f7e2e4ed"
    ],
    "techLeadStaffIds": [
      "69016bcc7157f337f7e2e4eb"
    ],
    "managerDetails": {
      "_id": "69016bcc7157f337f7e2e4ea",
      "name": "Tony Yoditanto",
      "email": "tonyoditanto@gmail.com",
      "role": "manager"
    },
    "staffDetails": [
      {
        "_id": "69016bcc7157f337f7e2e4ea",
        "name": "Tony Yoditanto",
        "email": "tonyoditanto@gmail.com",
        "role": "manager",
        "position": "507f1f77bcf86cd799439011",
        "isTechLead": true
      },
      {
        "_id": "69016bcc7157f337f7e2e4eb",
        "name": "John Developer",
        "email": "john@example.com",
        "role": "staff",
        "position": "507f1f77bcf86cd799439012",
        "isTechLead": true
      },
      {
        "_id": "69016bcc7157f337f7e2e4ec",
        "name": "Jane Designer",
        "email": "jane@example.com",
        "role": "staff",
        "position": "507f1f77bcf86cd799439013",
        "isTechLead": false
      },
      {
        "_id": "69016bcc7157f337f7e2e4ed",
        "name": "Bob Tester",
        "email": "bob@example.com",
        "role": "staff",
        "position": "507f1f77bcf86cd799439014",
        "isTechLead": false
      }
    ]
  }
}
```

**Response Explanation**:
- `managerId`: The user ID of the manager who created the project
- `allStaffIds`: Array of all user IDs assigned to the project (includes manager)
- `techLeadStaffIds`: Array of staff user IDs who are tech leads (excludes manager, only staff with isTechLead=true)
- `managerDetails`: Detailed information about the manager
- `staffDetails`: Array with detailed information about all team members (includes their tech lead status)

**Error** (404 Not Found):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Project not found"
}
```

---

### 3b. Assign Tech Lead

Assigns or removes tech lead status for a staff member in a project.

**Endpoint**: `PUT /project/:projectId/assign-tech-lead`

**Access**: Manager or HR only

**⭐ Tech Lead Rules**:
- **Manager is automatically a tech lead** when creating a project (cannot be changed)
- **Minimum**: 1 tech lead per project (the manager)
- **Maximum**: 2 tech leads per project (manager + 1 staff)
- Manager can assign any staff member as tech lead
- Manager can change which staff member is tech lead
- Manager can remove tech lead status from staff (set isTechLead to false)
- Only 1 staff can be tech lead at a time

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | MongoDB ObjectId of the project |

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `staffId` | string | Yes | User ID of the staff member |
| `isTechLead` | boolean | Yes | true to assign as tech lead, false to remove |

**Request Example 1 - Assign Staff as Tech Lead**:
```http
PUT /project/6901b5caf7ed0f35753d38a3/assign-tech-lead
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "staffId": "69016bcc7157f337f7e2e4eb",
  "isTechLead": true
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
      "status": "active"
    },
    "userId": {
      "_id": "69016bcc7157f337f7e2e4eb",
      "name": "John Developer",
      "email": "john@example.com",
      "role": "staff",
      "position": "507f1f77bcf86cd799439012"
    },
    "isTechLead": true,
    "__v": 0
  },
  "message": "Staff successfully assigned as tech lead"
}
```

**Request Example 2 - Remove Tech Lead Status**:
```http
PUT /project/6901b5caf7ed0f35753d38a3/assign-tech-lead
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "staffId": "69016bcc7157f337f7e2e4eb",
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
      "status": "active"
    },
    "userId": {
      "_id": "69016bcc7157f337f7e2e4eb",
      "name": "John Developer",
      "email": "john@example.com",
      "role": "staff",
      "position": "507f1f77bcf86cd799439012"
    },
    "isTechLead": false,
    "__v": 0
  },
  "message": "Tech lead status removed from staff"
}
```

**Error** (400 Bad Request - Missing Fields):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Staff ID must be specified"
}
```

**Error** (400 Bad Request - Manager Tech Lead):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Cannot change tech lead status of a manager. Managers are always tech leads."
}
```

**Error** (400 Bad Request - Tech Lead Limit Reached):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Maximum tech lead limit reached. A project can have maximum 2 tech leads (1 manager + 1 staff). Please remove existing staff tech lead first."
}
```

**Error** (404 Not Found - Staff Not in Project):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Staff is not assigned to this project"
}
```

---

### 4. Create Project

Creates a new project. The `createdBy` field is automatically set from the authenticated user. **The status is automatically set to 'active'**.

**Endpoint**: `POST /project`

**Access**: Manager or HR only

**⭐ Special Features**:
- Status is **automatically set to 'active'** (cannot be changed during creation)
- startDate is automatically set to current date
- teamMemberCount defaults to 1 (to include manager)

**Request Body**:

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | 100 | Project name |
| `description` | string | Yes | - | Project description |
| `startDate` | date | No | - | Project start date (defaults to current date if not provided) |
| `deadline` | date | No | - | Project deadline (ISO 8601 format) |
| `teamMemberCount` | integer | No | - | Number of team members (default: 1) |

**Request Example**:
```http
POST /project
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Mobile App Development",
  "description": "Develop a cross-platform mobile application for iOS and Android",
  "startDate": "2025-10-30",
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
    "status": "active",
    "startDate": "2025-10-30T00:00:00.000Z",
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

### 5. Create Project with Staff Assignments (Combined)

Creates a new project and automatically assigns staff members in a single API call. This is the **recommended endpoint for managers** when creating projects through the UI.

**Endpoint**: `POST /project/with-assignments`

**Access**: Manager only

**⭐ Special Features**:
- Creates project and assigns staff in one transaction
- **Status is automatically set to 'active'** (cannot be changed during creation)
- **Automatically sets `teamMemberCount` to staffIds.length + 1** (includes manager)
- startDate is automatically set to current date
- Manager roles are automatically assigned as tech leads
- Returns both project and assignment data

**Request Body**:

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | 100 | Project name |
| `description` | string | Yes | - | Project description |
| `staffIds` | array | Yes | - | Array of user IDs to assign to the project |
| `startDate` | date | No | - | Project start date (defaults to current date if not provided) |
| `deadline` | date | No | - | Project deadline (ISO 8601 format) |

**Request Example**:
```http
POST /project/with-assignments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "E-Commerce Platform Development",
  "description": "Build a full-featured e-commerce platform with payment gateway integration",
  "startDate": "2025-10-30",
  "deadline": "2025-12-31",
  "staffIds": [
    "69016bcc7157f337f7e2e4ea",
    "69016bcc7157f337f7e2e4eb",
    "69016bcc7157f337f7e2e4ec"
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "project": {
      "_id": "6901b5caf7ed0f35753d38a3",
      "name": "E-Commerce Platform Development",
      "description": "Build a full-featured e-commerce platform with payment gateway integration",
      "status": "active",
      "startDate": "2025-10-30T00:00:00.000Z",
      "deadline": "2025-12-31T00:00:00.000Z",
      "teamMemberCount": 4,
      "createdBy": {
        "_id": "69016bcc7157f337f7e2e4ea",
        "name": "Tony Yoditanto",
        "email": "tonyoditanto@gmail.com",
        "role": "manager"
      },
      "createdAt": "2025-10-29T06:35:54.665Z",
      "updatedAt": "2025-10-29T06:35:54.665Z",
      "__v": 0
    },
    "assignments": [
      {
        "_id": "6901b5e8f7ed0f35753d38a9",
        "projectId": {
          "_id": "6901b5caf7ed0f35753d38a3",
          "name": "E-Commerce Platform Development",
          "description": "Build a full-featured e-commerce platform",
          "status": "active"
        },
        "userId": {
          "_id": "69016bcc7157f337f7e2e4ea",
          "name": "Tony Yoditanto",
          "email": "tonyoditanto@gmail.com",
          "role": "manager",
          "position": "507f1f77bcf86cd799439011"
        },
        "isTechLead": true,
        "__v": 0
      },
      {
        "_id": "6901b5e8f7ed0f35753d38aa",
        "projectId": {
          "_id": "6901b5caf7ed0f35753d38a3",
          "name": "E-Commerce Platform Development",
          "description": "Build a full-featured e-commerce platform",
          "status": "active"
        },
        "userId": {
          "_id": "69016bcc7157f337f7e2e4eb",
          "name": "John Developer",
          "email": "john@example.com",
          "role": "staff",
          "position": "507f1f77bcf86cd799439012"
        },
        "isTechLead": false,
        "__v": 0
      },
      {
        "_id": "6901b5e8f7ed0f35753d38ab",
        "projectId": {
          "_id": "6901b5caf7ed0f35753d38a3",
          "name": "E-Commerce Platform Development",
          "description": "Build a full-featured e-commerce platform",
          "status": "active"
        },
        "userId": {
          "_id": "69016bcc7157f337f7e2e4ec",
          "name": "Jane Designer",
          "email": "jane@example.com",
          "role": "staff",
          "position": "507f1f77bcf86cd799439013"
        },
        "isTechLead": false,
        "__v": 0
      }
    ],
    "message": "Project created successfully with 3 staff members assigned"
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

**Error** (400 Bad Request - Missing or Empty Staff Array):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "At least one staff member must be assigned to the project"
}
```

**Error** (404 Not Found - Invalid Staff IDs):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "One or more staff members not found"
}
```

---

### 6. Update Project (Comprehensive Staff Management & Skill Transfer)

Updates an existing project with advanced staff management capabilities. This endpoint can handle complex scenarios including adding/removing staff, replacing all staff, and automatic skill transfer when completing projects.

**Endpoint**: `PUT /project/:projectId`

**Access**: Manager or HR only

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | MongoDB ObjectId of the project |

**⭐ Special Features**:
- **Add Staff**: Add individual staff members to the project
- **Remove Staff**: Remove staff from project AND all task assignments
- **Replace All Staff**: Complete staff replacement in one operation
- **Skill Transfer on Completion**: When status changes to 'completed', transfers all task skills to assigned users
- **Auto teamMemberCount Update**: Automatically recalculates based on staff changes
- **Prevents Duplicates**: Skills are not duplicated in user_skills array

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Project name |
| `description` | string | No | Project description |
| `status` | string | No | Project status (`active` or `completed`) |
| `deadline` | date | No | Project deadline |
| `addStaffIds` | array | No | User IDs to add to the project |
| `removeStaffIds` | array | No | User IDs to remove from project and tasks |
| `replaceStaffIds` | array | No | Replace all staff with new set |

**Status Values**: `active`, `completed`

**⚠️ Important Notes**:
- When using `replaceStaffIds`, do NOT use `addStaffIds` or `removeStaffIds` in the same request
- When status changes from 'active' to 'completed', all task skills are transferred to users who completed those tasks
- Removing staff also removes them from all task assignments

**Request Example 1 - Add Staff**:
```http
PUT /project/6901b5caf7ed0f35753d38a3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "addStaffIds": ["69016bcc7157f337f7e2e4ed", "69016bcc7157f337f7e2e4ee"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "6901b5caf7ed0f35753d38a3",
    "name": "Mobile App Development",
    "description": "Develop a cross-platform mobile application",
    "status": "active",
    "startDate": "2025-10-30T00:00:00.000Z",
    "deadline": "2025-12-31T00:00:00.000Z",
    "teamMemberCount": 6,
    "createdBy": {
      "_id": "69016bcc7157f337f7e2e4ea",
      "name": "Tony Yoditanto",
      "email": "tonyoditanto@gmail.com",
      "role": "manager"
    },
    "createdAt": "2025-10-29T06:35:54.665Z",
    "updatedAt": "2025-10-30T08:15:32.442Z",
    "__v": 0
  },
  "message": "Added 2 new staff members"
}
```

**Request Example 2 - Remove Staff**:
```http
PUT /project/6901b5caf7ed0f35753d38a3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "removeStaffIds": ["69016bcc7157f337f7e2e4eb"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "6901b5caf7ed0f35753d38a3",
    "name": "Mobile App Development",
    "teamMemberCount": 5,
    "updatedAt": "2025-10-30T08:20:15.123Z"
  },
  "message": "Removed 1 staff members from project and tasks"
}
```

**Request Example 3 - Replace All Staff**:
```http
PUT /project/6901b5caf7ed0f35753d38a3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "replaceStaffIds": [
    "69016bcc7157f337f7e2e4ef",
    "69016bcc7157f337f7e2e4f0",
    "69016bcc7157f337f7e2e4f1"
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "6901b5caf7ed0f35753d38a3",
    "name": "Mobile App Development",
    "teamMemberCount": 4,
    "updatedAt": "2025-10-30T08:25:42.789Z"
  },
  "message": "All staff replaced with 3 new members"
}
```

**Request Example 4 - Complete Project (with Skill Transfer)**:
```http
PUT /project/6901b5caf7ed0f35753d38a3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "completed"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "6901b5caf7ed0f35753d38a3",
    "name": "Mobile App Development",
    "status": "completed",
    "teamMemberCount": 4,
    "updatedAt": "2025-10-30T09:00:00.000Z"
  },
  "message": "Project completed. Transferred skills to 4 users"
}
```

**Request Example 5 - Combined Update**:
```http
PUT /project/6901b5caf7ed0f35753d38a3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Mobile App Development (Updated)",
  "deadline": "2026-06-30",
  "addStaffIds": ["69016bcc7157f337f7e2e4f2"],
  "removeStaffIds": ["69016bcc7157f337f7e2e4eb"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "6901b5caf7ed0f35753d38a3",
    "name": "Mobile App Development (Updated)",
    "deadline": "2026-06-30T00:00:00.000Z",
    "teamMemberCount": 4,
    "updatedAt": "2025-10-30T09:15:00.000Z"
  },
  "message": "Added 1 new staff members. Removed 1 staff members from project and tasks"
}
```

**Error** (404 Not Found - Project):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Project not found"
}
```

**Error** (404 Not Found - Staff):
```json
{
  "success": false,
  "error": "Not Found",
  "message": "One or more staff members to add not found"
}
```

---

### 7. Delete Project (Cascading Deletes)

Permanently deletes a project and all related data from the database in a cascading manner.

**Endpoint**: `DELETE /project/:projectId`

**Access**: Manager or HR only

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | MongoDB ObjectId of the project |

**⭐ Special Features - Cascading Deletes**:
This endpoint automatically deletes all related data in the following order:
1. **Task Assignments** - All task assignments for tasks in this project
2. **Tasks** - All tasks belonging to this project
3. **Project Assignments** - All user assignments to this project
4. **Project** - The project itself

**Request Example**:
```http
DELETE /project/6901b5caf7ed0f35753d38a3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (204 No Content):
```
(Empty body - successful deletion of project and all related data)
```

**What Gets Deleted**:
```
Project: Mobile App Development
├── Task Assignments (15 deleted)
├── Tasks (8 deleted)
├── Project Assignments (5 deleted)
└── Project (1 deleted)
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

### 8. Get Project Assignments

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
          "status": "active",
          "startDate": "2025-10-29T00:00:00.000Z",
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

### 9. Get Assignment by ID

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
      "status": "active",
      "startDate": "2025-10-29T00:00:00.000Z",
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

### 10. Assign User to Project (Auto Tech Lead)

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
      "status": "active"
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

### 11. Update Assignment

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
      "status": "active"
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

### 12. Remove Assignment

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

## Position CRUD Endpoints

Base path: `/position`

### 13. Create Multiple Positions (Batch)

Creates multiple positions in a single API call with case-insensitive duplicate checking and detailed reporting.

**Endpoint**: `POST /position/batch`

**Access**: HR only

**⭐ Special Features**:
- **Batch Creation**: Create multiple positions at once
- **Case-Insensitive Duplicate Detection**: Prevents duplicates like "Developer" and "developer"
- **Detailed Reporting**: Returns created, skipped, and error details for each position
- **Atomic Validation**: Each position is validated individually

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `positions` | array | Yes | Array of position names (strings) |

**Request Example**:
```http
POST /position/batch
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "positions": [
    "Senior Developer",
    "Junior Developer",
    "Product Manager",
    "UI/UX Designer",
    "Developer"
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "created": [
      {
        "_id": "6901c5f7ed0f35753d38c1",
        "name": "Senior Developer",
        "createdAt": "2025-10-30T10:00:00.000Z"
      },
      {
        "_id": "6901c5f7ed0f35753d38c2",
        "name": "Junior Developer",
        "createdAt": "2025-10-30T10:00:00.123Z"
      },
      {
        "_id": "6901c5f7ed0f35753d38c3",
        "name": "Product Manager",
        "createdAt": "2025-10-30T10:00:00.456Z"
      },
      {
        "_id": "6901c5f7ed0f35753d38c4",
        "name": "UI/UX Designer",
        "createdAt": "2025-10-30T10:00:00.789Z"
      }
    ],
    "skipped": [
      {
        "name": "Developer",
        "reason": "Position already exists (case-insensitive match)"
      }
    ],
    "errors": [],
    "summary": {
      "total": 5,
      "created": 4,
      "skipped": 1,
      "errors": 0
    }
  }
}
```

**Error** (400 Bad Request - Missing positions array):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Positions array is required"
}
```

**Error** (400 Bad Request - Empty array):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Positions array cannot be empty"
}
```

---

### 14. Delete Multiple Positions (Batch)

Deletes multiple positions in a single API call with detailed reporting.

**Endpoint**: `DELETE /position/batch`

**Access**: HR only

**⭐ Special Features**:
- **Batch Deletion**: Delete multiple positions at once
- **Detailed Reporting**: Returns count of deleted, not found, and errors
- **Atomic Operations**: Each deletion is processed individually

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `positionIds` | array | Yes | Array of position IDs (ObjectIds) |

**Request Example**:
```http
DELETE /position/batch
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "positionIds": [
    "6901c5f7ed0f35753d38c1",
    "6901c5f7ed0f35753d38c2",
    "6901c5f7ed0f35753d38c3",
    "invalidid123"
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "deleted": [
      {
        "_id": "6901c5f7ed0f35753d38c1",
        "name": "Senior Developer"
      },
      {
        "_id": "6901c5f7ed0f35753d38c2",
        "name": "Junior Developer"
      },
      {
        "_id": "6901c5f7ed0f35753d38c3",
        "name": "Product Manager"
      }
    ],
    "notFound": [
      "invalidid123"
    ],
    "errors": [],
    "summary": {
      "total": 4,
      "deleted": 3,
      "notFound": 1,
      "errors": 0
    }
  }
}
```

**Error** (400 Bad Request - Missing positionIds array):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Position IDs array is required"
}
```

**Error** (400 Bad Request - Empty array):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Position IDs array cannot be empty"
}
```

---

## Summary Table

| # | Endpoint | Method | Access | Description |
|---|----------|--------|--------|-------------|
| 1 | `/project` | GET | All | Get projects (role-based filtering) |
| 2 | `/project/all` | GET | HR | Get all projects (HR only) |
| 3 | `/project/:projectId` | GET | All | Get project by ID |
| 3a | `/project/:projectId/details` | GET | All | **Get comprehensive project details with all users** |
| 3b | `/project/:projectId/assign-tech-lead` | PUT | Manager/HR | **Assign/remove tech lead status** |
| 4 | `/project` | POST | Manager/HR | Create new project (auto-active) |
| 5 | `/project/with-assignments` | POST | Manager | **Create project with staff (auto-active, Recommended)** |
| 6 | `/project/:projectId` | PUT | Manager/HR | **Update project (staff mgmt + skill transfer)** |
| 7 | `/project/:projectId` | DELETE | Manager/HR | **Delete project (cascading deletes)** |
| 8 | `/project-assignment` | GET | All | Get all assignments (with filters) |
| 9 | `/project-assignment/:assignmentId` | GET | All | Get assignment by ID |
| 10 | `/project-assignment` | POST | Manager/HR | Assign user to project (auto tech lead) |
| 11 | `/project-assignment/:assignmentId` | PUT | Manager/HR | Update assignment |
| 12 | `/project-assignment/:assignmentId` | DELETE | Manager/HR | Remove assignment |
| 13 | `/position/batch` | POST | HR | **Create multiple positions (batch)** |
| 14 | `/position/batch` | DELETE | HR | **Delete multiple positions (batch)** |

---

## Key Features

### 1. Role-Based Access Control
- **Managers**: Can only view and manage their own projects
- **HR**: Has full access to all projects across all managers
- Automatic filtering based on JWT token role

### 2. Auto-Active Project Status
- **All new projects are automatically set to 'active' status**
- Cannot be changed during creation
- Ensures consistency in project lifecycle
- startDate is automatically set to current date

### 3. Comprehensive Staff Management
- **Add Staff**: Add individual staff members to existing projects
- **Remove Staff**: Remove staff from projects and all related task assignments
- **Replace All Staff**: Complete staff replacement in one operation
- **Auto teamMemberCount**: Automatically includes manager in count (+1)
- Prevents data inconsistency across related entities

### 4. Skill Transfer on Project Completion
- **Automatic Skill Transfer**: When project status changes to 'completed'
- Transfers all task requiredSkills to users who completed those tasks
- **Prevents Duplicates**: Uses Set to avoid duplicate skills in user_skills array
- Enhances user skill profiles based on project experience

### 5. Cascading Deletes
- **Complete Data Cleanup**: Deleting a project cascades to all related entities
- Deletes: Task Assignments → Tasks → Project Assignments → Project
- Prevents orphaned data in the database
- Maintains database integrity

### 6. Auto Tech Lead Assignment
- Users with `manager` role are **automatically assigned as tech leads**
- Cannot be demoted from tech lead status
- Enforced during both creation and update operations
- Provides consistent leadership hierarchy

### 7. Position Management with Batch Operations
- **Case-Insensitive Duplicate Prevention**: "Developer" and "developer" treated as same
- **Batch Creation**: Create multiple positions in one API call
- **Batch Deletion**: Delete multiple positions in one API call
- **Detailed Reporting**: Returns created/skipped/errors for transparency

### 8. Comprehensive Filtering
- Filter projects by status (`active`, `completed`), creator, date
- Filter assignments by project, user, tech lead status
- Pagination support on all list endpoints
- Query parameters for flexible data retrieval

### 9. Full CRUD Operations
- Complete Create, Read, Update, Delete functionality
- Consistent response format across all endpoints
- Proper error handling with descriptive messages
- RESTful API design principles

### 10. Data Population
- Automatic population of related data (user details, project details)
- Reduced need for multiple API calls
- Complete information in single response

### 11. Swagger Documentation
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
  "status": "active",
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

**Last Updated**: 2025-10-30
**Branch**: feat/crud_project
**Version**: 2.1.0

## Changelog

### Version 2.1.0 (2025-10-30)
- **New**: Get comprehensive project details endpoint (`GET /project/:projectId/details`)
  - Returns manager ID, all staff IDs, and tech lead staff IDs in single request
  - Includes detailed information about all team members
  - Excludes manager from tech lead staff IDs array
- **New**: Assign/remove tech lead status endpoint (`PUT /project/:projectId/assign-tech-lead`)
  - Manages tech lead assignments with validation
  - Enforces 1 manager + max 1 staff as tech leads (max 2 total)
  - Allows manager to assign, change, or remove staff tech lead status
  - Prevents changing manager's tech lead status (always true)
- **Updated**: Added `startDate` field to project creation endpoints
  - `POST /project` now accepts optional `startDate` parameter
  - `POST /project/with-assignments` now accepts optional `startDate` parameter
  - If not provided, defaults to current date as per schema
- Enhanced documentation with new endpoints and examples

### Version 2.0.0 (2025-10-30)
- **Breaking Change**: Project status now limited to `active` and `completed` only
- **Breaking Change**: Projects automatically set to 'active' status on creation (cannot be changed)
- Added `startDate` field to projects (auto-set to current date)
- Changed `teamMemberCount` default to 1 (includes manager)
- **New**: Comprehensive project update with staff management (add/remove/replace staff)
- **New**: Automatic skill transfer when project status changes to 'completed'
- **New**: Cascading deletes - deleting project removes all related entities
- **New**: Position batch operations (create and delete multiple positions)
- **New**: Case-insensitive duplicate prevention for positions
- Updated task schema with `requiredSkills`, `startDate`, `endDate` fields
- Refactored task and task-assignment schemas to match codebase patterns
- Enhanced documentation with comprehensive examples

### Version 1.0.0 (2025-10-29)
- Initial release of Project CRUD API
- Project creation and management endpoints
- Project assignment endpoints with auto tech lead
- Role-based access control (Manager/HR)
- Combined project creation with staff assignments
