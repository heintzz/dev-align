# API Documentation - Notifications & Project Approval System

## Overview
This document provides comprehensive documentation for the Notification System and Project Approval Workflow implemented in the `feat/crud_project` branch.

**Base URL**: `http://localhost:5000`

**Swagger Documentation**: `http://localhost:5000/api-docs`

---

## Table of Contents
- [Authentication](#authentication)
- [Colleague Endpoints](#colleague-endpoints)
  - [Get Colleagues List](#get-colleagues-list)
- [Notification System](#notification-system)
  - [Get Notifications](#1-get-notifications)
  - [Get Unread Count](#2-get-unread-count)
  - [Get Notification by ID](#3-get-notification-by-id)
  - [Mark Notification as Read](#4-mark-notification-as-read)
  - [Mark All as Read](#5-mark-all-as-read)
  - [Delete Notification](#6-delete-notification)
- [Borrow Request System](#borrow-request-system)
  - [Get Pending Requests](#7-get-pending-requests-manager)
  - [Get Project Borrow Requests](#8-get-project-borrow-requests)
  - [Respond to Borrow Request](#9-respond-to-borrow-request)
- [Updated Project Endpoints](#updated-project-endpoints)
  - [Get Project Staff](#10-get-project-staff)
  - [Create Project with Assignments](#11-create-project-with-assignments-updated)
  - [Update Project](#12-update-project-updated)
  - [Delete Project](#13-delete-project-updated)
- [Notification Scenarios](#notification-scenarios)
- [Project Approval Workflow](#project-approval-workflow)
- [Setup Instructions](#setup-instructions)

---

## Authentication

All endpoints require a Bearer token in the Authorization header.

**Header Format**:
```
Authorization: Bearer <your_jwt_token>
```

---

## Colleague Endpoints

Base path: `/hr`

### Get Colleagues List

Retrieves a list of colleagues based on the authenticated user's role and organizational hierarchy.

**Endpoint**: `GET /hr/colleagues`

**Access**: All authenticated users

**Role-Based Behavior**:
- **Manager**: Returns all direct subordinates (employees where `managerId` equals the manager's ID)
- **Staff/HR**: Returns teammates with the same manager (colleagues with the same `managerId`), plus their direct manager information

**Request Example**:
```http
GET /hr/colleagues
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response for Staff/HR** (200 OK):
```json
{
  "success": true,
  "data": {
    "userRole": "staff",
    "colleagues": [
      {
        "id": "69016bcc7157f337f7e2e4eb",
        "name": "John Developer",
        "email": "john@example.com",
        "role": "staff",
        "position": {
          "id": "507f1f77bcf86cd799439012",
          "name": "Senior Developer"
        },
        "skills": [
          {
            "id": "507f1f77bcf86cd799439015",
            "name": "JavaScript"
          },
          {
            "id": "507f1f77bcf86cd799439016",
            "name": "React"
          }
        ]
      }
    ],
    "directManager": {
      "id": "69016bcc7157f337f7e2e4ea",
      "name": "Tony Yoditanto",
      "email": "tonyoditanto@gmail.com",
      "role": "manager",
      "position": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Engineering Manager"
      }
    },
    "totalColleagues": 1
  }
}
```

**Response for Manager** (200 OK):
```json
{
  "success": true,
  "data": {
    "userRole": "manager",
    "colleagues": [
      {
        "id": "69016bcc7157f337f7e2e4eb",
        "name": "John Developer",
        "email": "john@example.com",
        "role": "staff",
        "position": {
          "id": "507f1f77bcf86cd799439012",
          "name": "Senior Developer"
        },
        "skills": [
          {
            "id": "507f1f77bcf86cd799439015",
            "name": "JavaScript"
          }
        ]
      },
      {
        "id": "69016bcc7157f337f7e2e4ec",
        "name": "Jane Designer",
        "email": "jane@example.com",
        "role": "staff",
        "position": {
          "id": "507f1f77bcf86cd799439013",
          "name": "UI/UX Designer"
        },
        "skills": []
      }
    ],
    "totalColleagues": 2
  }
}
```

**Response Explanation**:
- `userRole`: The role of the current authenticated user
- `colleagues`: Array of colleague objects with basic information, position, and skills
- `directManager`: Only included for staff/HR roles - information about their direct supervisor
- `totalColleagues`: Count of colleagues returned

**Special Features**:
- **Excludes Self**: The current user is not included in the colleagues list
- **Active Only**: Only returns active employees (`active: true`)
- **Sorted by Name**: Colleagues are sorted alphabetically by name
- **Populated Data**: Includes position and skills information for easy display

**Use Cases**:
- Display team members in a project creation form
- Show organizational hierarchy
- List available colleagues for collaboration or task assignment
- Display manager information for approval workflows

---

## Notification System

### 1. Get Notifications

Retrieves all notifications for the authenticated user with pagination and filtering.

**Endpoint**: `GET /notification`

**Access**: All authenticated users

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `perPage` | integer | No | 15 | Number of items per page |
| `type` | string | No | - | Filter by type: `announcement` or `project_approval` |
| `isRead` | boolean | No | - | Filter by read status |

**Request Example**:
```http
GET /notification?page=1&perPage=10&isRead=false
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "page": 1,
    "perPage": 10,
    "total": 25,
    "unreadCount": 5,
    "notifications": [
      {
        "_id": "67820a1b2f3d4e5f6a7b8c9d",
        "userId": "69016bcc7157f337f7e2e4ea",
        "title": "New Project Assignment",
        "message": "You have been assigned to the project \"Mobile App Development\". Your manager John Doe has created this project.",
        "type": "announcement",
        "isRead": false,
        "relatedProject": {
          "_id": "6901b5caf7ed0f35753d38a3",
          "name": "Mobile App Development",
          "description": "Develop a cross-platform mobile application"
        },
        "relatedBorrowRequest": null,
        "createdAt": "2025-10-31T10:30:00.000Z",
        "updatedAt": "2025-10-31T10:30:00.000Z"
      },
      {
        "_id": "67820a1b2f3d4e5f6a7b8c9e",
        "userId": "69016bcc7157f337f7e2e4ea",
        "title": "Staff Assignment Approval Required",
        "message": "John Doe wants to assign your team member Jane Smith to the project \"E-Commerce Platform\". Please review and respond to this request.",
        "type": "project_approval",
        "isRead": false,
        "relatedProject": {
          "_id": "6901b5caf7ed0f35753d38a4",
          "name": "E-Commerce Platform",
          "description": "Build a full-featured e-commerce platform"
        },
        "relatedBorrowRequest": {
          "_id": "67820a1b2f3d4e5f6a7b8c9f",
          "projectId": "6901b5caf7ed0f35753d38a4",
          "staffId": "69016bcc7157f337f7e2e4ec",
          "requestedBy": {
            "_id": "69016bcc7157f337f7e2e4ea",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "role": "manager",
            "position": {
              "_id": "507f1f77bcf86cd799439011",
              "name": "Engineering Manager"
            }
          },
          "approvedBy": {
            "_id": "69016bcc7157f337f7e2e4eb",
            "name": "Mike Manager",
            "email": "mike.manager@example.com",
            "role": "manager",
            "position": {
              "_id": "507f1f77bcf86cd799439012",
              "name": "Senior Manager"
            }
          },
          "isApproved": null,
          "createdAt": "2025-10-31T10:35:00.000Z",
          "updatedAt": "2025-10-31T10:35:00.000Z"
        },
        "createdAt": "2025-10-31T10:35:00.000Z",
        "updatedAt": "2025-10-31T10:35:00.000Z"
      }
    ]
  }
}
```

**Important Notes**:
- For **`project_approval`** type notifications, the `relatedBorrowRequest` field now includes:
  - `requestedBy`: Full details of the manager requesting the staff assignment (id, name, email, role, position)
  - `approvedBy`: Full details of the manager who needs to approve (id, name, email, role, position)
- For **`announcement`** type notifications, `relatedBorrowRequest` will be `null`

---

### 2. Get Unread Count

Get the count of unread notifications for the authenticated user.

**Endpoint**: `GET /notification/unread-count`

**Access**: All authenticated users

**Request Example**:
```http
GET /notification/unread-count
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

### 3. Get Notification by ID

Get details of a specific notification.

**Endpoint**: `GET /notification/:notificationId`

**Access**: Notification owner only

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notificationId` | string | Yes | MongoDB ObjectId of the notification |

**Request Example**:
```http
GET /notification/67820a1b2f3d4e5f6a7b8c9d
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response for Announcement Type** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "67820a1b2f3d4e5f6a7b8c9d",
    "userId": "69016bcc7157f337f7e2e4ea",
    "title": "New Project Assignment",
    "message": "You have been assigned to the project \"Mobile App Development\".",
    "type": "announcement",
    "isRead": false,
    "relatedProject": {
      "_id": "6901b5caf7ed0f35753d38a3",
      "name": "Mobile App Development",
      "description": "Develop a cross-platform mobile application",
      "status": "active"
    },
    "relatedBorrowRequest": null,
    "createdAt": "2025-10-31T10:30:00.000Z",
    "updatedAt": "2025-10-31T10:30:00.000Z"
  }
}
```

**Response for Project Approval Type** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "67820a1b2f3d4e5f6a7b8c9e",
    "userId": "69016bcc7157f337f7e2e4ea",
    "title": "Staff Assignment Approval Required",
    "message": "John Doe wants to assign your team member Jane Smith to the project \"E-Commerce Platform\". Please review and respond to this request.",
    "type": "project_approval",
    "isRead": false,
    "relatedProject": {
      "_id": "6901b5caf7ed0f35753d38a4",
      "name": "E-Commerce Platform",
      "description": "Build a full-featured e-commerce platform",
      "status": "active"
    },
    "relatedBorrowRequest": {
      "_id": "67820a1b2f3d4e5f6a7b8c9f",
      "projectId": "6901b5caf7ed0f35753d38a4",
      "staffId": "69016bcc7157f337f7e2e4ec",
      "requestedBy": {
        "_id": "69016bcc7157f337f7e2e4ea",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "manager",
        "position": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Engineering Manager"
        }
      },
      "approvedBy": {
        "_id": "69016bcc7157f337f7e2e4eb",
        "name": "Mike Manager",
        "email": "mike.manager@example.com",
        "role": "manager",
        "position": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Senior Manager"
        }
      },
      "isApproved": null,
      "createdAt": "2025-10-31T10:35:00.000Z",
      "updatedAt": "2025-10-31T10:35:00.000Z"
    },
    "createdAt": "2025-10-31T10:35:00.000Z",
    "updatedAt": "2025-10-31T10:35:00.000Z"
  }
}
```

**Important Notes**:
- For **`project_approval`** type notifications, the `relatedBorrowRequest` field includes:
  - `requestedBy`: Full details of the manager requesting the staff assignment (id, name, email, role, position)
  - `approvedBy`: Full details of the manager who needs to approve (id, name, email, role, position)
- For **`announcement`** type notifications, `relatedBorrowRequest` will be `null`

**Error** (403 Forbidden):
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You do not have permission to view this notification"
}
```

---

### 4. Mark Notification as Read

Mark a specific notification as read.

**Endpoint**: `PUT /notification/:notificationId/mark-read`

**Access**: Notification owner only

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notificationId` | string | Yes | MongoDB ObjectId of the notification |

**Request Example**:
```http
PUT /notification/67820a1b2f3d4e5f6a7b8c9d/mark-read
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "67820a1b2f3d4e5f6a7b8c9d",
    "userId": "69016bcc7157f337f7e2e4ea",
    "title": "New Project Assignment",
    "message": "You have been assigned to the project \"Mobile App Development\".",
    "type": "announcement",
    "isRead": true,
    "createdAt": "2025-10-31T10:30:00.000Z",
    "updatedAt": "2025-10-31T11:00:00.000Z"
  },
  "message": "Notification marked as read"
}
```

---

### 5. Mark All as Read

Mark all unread notifications as read for the authenticated user.

**Endpoint**: `PUT /notification/mark-all-read`

**Access**: All authenticated users

**Request Example**:
```http
PUT /notification/mark-all-read
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "modifiedCount": 5
  },
  "message": "5 notification(s) marked as read"
}
```

---

### 6. Delete Notification

Delete a specific notification.

**Endpoint**: `DELETE /notification/:notificationId`

**Access**: Notification owner only

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notificationId` | string | Yes | MongoDB ObjectId of the notification |

**Request Example**:
```http
DELETE /notification/67820a1b2f3d4e5f6a7b8c9d
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## Borrow Request System

### 7. Get Pending Requests (Manager)

Get all pending borrow requests that require the authenticated manager's approval.

**Endpoint**: `GET /borrow-request/pending`

**Access**: Manager only

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `perPage` | integer | No | 15 | Number of items per page |

**Request Example**:
```http
GET /borrow-request/pending?page=1&perPage=10
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
    "requests": [
      {
        "_id": "67820a1b2f3d4e5f6a7b8c9f",
        "projectId": {
          "_id": "6901b5caf7ed0f35753d38a4",
          "name": "E-Commerce Platform",
          "description": "Build a full-featured e-commerce platform",
          "deadline": "2025-12-31T00:00:00.000Z"
        },
        "staffId": {
          "_id": "69016bcc7157f337f7e2e4ec",
          "name": "Jane Smith",
          "email": "jane.smith@example.com",
          "position": "507f1f77bcf86cd799439013"
        },
        "requestedBy": {
          "_id": "69016bcc7157f337f7e2e4ea",
          "name": "John Doe",
          "email": "john.doe@example.com"
        },
        "isApproved": null,
        "createdAt": "2025-10-31T10:35:00.000Z",
        "updatedAt": "2025-10-31T10:35:00.000Z"
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
  "message": "Only managers can view borrow requests"
}
```

---

### 8. Get Project Borrow Requests

Get all borrow requests related to a specific project.

**Endpoint**: `GET /borrow-request/project/:projectId`

**Access**: Manager or HR only

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | MongoDB ObjectId of the project |

**Request Example**:
```http
GET /borrow-request/project/6901b5caf7ed0f35753d38a4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "67820a1b2f3d4e5f6a7b8c9f",
      "staffId": {
        "_id": "69016bcc7157f337f7e2e4ec",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "position": "507f1f77bcf86cd799439013"
      },
      "requestedBy": {
        "_id": "69016bcc7157f337f7e2e4ea",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "approvedBy": {
        "_id": "69016bcc7157f337f7e2e4eb",
        "name": "Mike Manager",
        "email": "mike.manager@example.com"
      },
      "isApproved": true,
      "createdAt": "2025-10-31T10:35:00.000Z",
      "updatedAt": "2025-10-31T11:00:00.000Z"
    }
  ]
}
```

---

### 9. Respond to Borrow Request

Approve or reject a borrow request.

**Endpoint**: `PUT /borrow-request/:requestId/respond`

**Access**: Approving manager only

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `requestId` | string | Yes | MongoDB ObjectId of the borrow request |

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isApproved` | boolean | Yes | `true` to approve, `false` to reject |

**Request Example - Approve**:
```http
PUT /borrow-request/67820a1b2f3d4e5f6a7b8c9f/respond
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "isApproved": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "67820a1b2f3d4e5f6a7b8c9f",
    "projectId": {
      "_id": "6901b5caf7ed0f35753d38a4",
      "name": "E-Commerce Platform",
      "description": "Build a full-featured e-commerce platform"
    },
    "staffId": {
      "_id": "69016bcc7157f337f7e2e4ec",
      "name": "Jane Smith",
      "email": "jane.smith@example.com"
    },
    "requestedBy": {
      "_id": "69016bcc7157f337f7e2e4ea",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "isApproved": true,
    "createdAt": "2025-10-31T10:35:00.000Z",
    "updatedAt": "2025-10-31T11:00:00.000Z"
  },
  "message": "Borrow request approved and staff assigned to project"
}
```

**Request Example - Reject**:
```http
PUT /borrow-request/67820a1b2f3d4e5f6a7b8c9f/respond
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "isApproved": false
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "67820a1b2f3d4e5f6a7b8c9f",
    "isApproved": false,
    "updatedAt": "2025-10-31T11:00:00.000Z"
  },
  "message": "Borrow request rejected"
}
```

**Error** (403 Forbidden):
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You are not authorized to respond to this request"
}
```

**Error** (400 Bad Request - Already Processed):
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "This request has already been approved"
}
```

---

## Updated Project Endpoints

### 10. Get Project Staff

Get all staff members assigned to a specific project. Returns user ID and name for easy task assignment.

**Endpoint**: `GET /project/:projectId/staff`

**Access**: All authenticated users

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | MongoDB ObjectId of the project |

**Request Example**:
```http
GET /project/6901b5caf7ed0f35753d38a4/staff
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "projectId": "6901b5caf7ed0f35753d38a4",
    "projectName": "E-Commerce Platform",
    "totalStaff": 4,
    "staff": [
      {
        "id": "69016bcc7157f337f7e2e4ea",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "manager",
        "isTechLead": true
      },
      {
        "id": "69016bcc7157f337f7e2e4eb",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "role": "staff",
        "isTechLead": true
      },
      {
        "id": "69016bcc7157f337f7e2e4ec",
        "name": "Bob Johnson",
        "email": "bob.johnson@example.com",
        "role": "staff",
        "isTechLead": false
      }
    ]
  }
}
```

---

### 11. Create Project with Assignments (Updated)

Creates a project with automatic staff assignment and approval workflow.

**Endpoint**: `POST /project/with-assignments`

**Access**: Manager only

**⭐ New Approval Workflow**:
- **Direct Subordinates**: Staff with `managerId` matching creator's ID are assigned immediately
- **Non-Direct Staff**: Borrow requests are created, requiring approval from their manager
- **Notifications**: Sent to all affected parties (staff, managers, HR)

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Project name (max 100 chars) |
| `description` | string | Yes | Project description |
| `startDate` | date | No | Project start date (defaults to now) |
| `deadline` | date | No | Project deadline |
| `staffIds` | array | Yes | Array of user IDs to assign (at least 1) |

**Request Example**:
```http
POST /project/with-assignments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "E-Commerce Platform",
  "description": "Build a full-featured e-commerce platform with React and Node.js",
  "startDate": "2025-11-01",
  "deadline": "2025-12-31",
  "staffIds": [
    "69016bcc7157f337f7e2e4eb",
    "69016bcc7157f337f7e2e4ec",
    "69016bcc7157f337f7e2e4ed"
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "project": {
      "_id": "6901b5caf7ed0f35753d38a4",
      "name": "E-Commerce Platform",
      "description": "Build a full-featured e-commerce platform with React and Node.js",
      "status": "active",
      "startDate": "2025-11-01T00:00:00.000Z",
      "deadline": "2025-12-31T00:00:00.000Z",
      "teamMemberCount": 3,
      "createdBy": {
        "_id": "69016bcc7157f337f7e2e4ea",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "manager"
      },
      "createdAt": "2025-10-31T10:00:00.000Z",
      "updatedAt": "2025-10-31T10:00:00.000Z"
    },
    "assignments": [
      {
        "_id": "6901b5e8f7ed0f35753d38a9",
        "projectId": {
          "_id": "6901b5caf7ed0f35753d38a4",
          "name": "E-Commerce Platform",
          "description": "Build a full-featured e-commerce platform with React and Node.js",
          "status": "active"
        },
        "userId": {
          "_id": "69016bcc7157f337f7e2e4eb",
          "name": "Jane Smith",
          "email": "jane.smith@example.com",
          "role": "staff",
          "position": {
            "_id": "507f1f77bcf86cd799439012",
            "name": "Senior Developer"
          }
        },
        "isTechLead": false
      }
    ],
    "borrowRequests": 2,
    "message": "Project created successfully. 1 staff member(s) assigned immediately. 2 staff member(s) pending manager approval."
  }
}
```

**Notifications Sent**:
1. **Own Staff**: "New Project Assignment" - immediate notification
2. **Other Managers**: "Staff Assignment Approval Required" - project_approval type
3. **Pending Staff**: "Pending Project Assignment" - waiting for approval
4. **HR**: "New Project Created" - summary notification

---

### 12. Update Project (Updated)

Update project details with enhanced notification support.

**Endpoint**: `PUT /project/:projectId`

**Access**: Manager (project creator) or HR only

**⭐ New Features**:
- **Status Change to Completed**: Automatically transfers skills from tasks with status `in_progress` or `done` (excludes `todo`)
- **Staff Addition**: Sends "Added to Project" notification
- **Staff Removal**: Sends "Removed from Project" notification
- **Completion Notifications**: Notifies all team members and HR

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Project name |
| `description` | string | No | Project description |
| `status` | string | No | Project status (`active` or `completed`) |
| `deadline` | date | No | Project deadline |
| `addStaffIds` | array | No | User IDs to add to project |
| `removeStaffIds` | array | No | User IDs to remove from project |
| `replaceStaffIds` | array | No | Replace all staff with these user IDs |

**Request Example - Complete Project**:
```http
PUT /project/6901b5caf7ed0f35753d38a4
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
    "_id": "6901b5caf7ed0f35753d38a4",
    "name": "E-Commerce Platform",
    "status": "completed",
    "teamMemberCount": 5,
    "createdBy": {
      "_id": "69016bcc7157f337f7e2e4ea",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "manager"
    },
    "updatedAt": "2025-10-31T15:00:00.000Z"
  },
  "message": "Project completed. Transferred skills from 12 task(s) to 4 user(s)"
}
```

**Notifications Sent on Completion**:
1. **All Team Members**: "Project Completed" - skills transferred message
2. **HR**: "Project Completed" - summary with skill transfer stats

---

### 13. Delete Project (Updated)

Delete a project with cascade deletion and notifications.

**Endpoint**: `DELETE /project/:projectId`

**Access**: Manager (project creator) or HR only

**⭐ New Features**:
- **Cascade Deletion**: Deletes all related tasks, assignments, and borrow requests
- **Team Notifications**: "Project Deleted" sent to all team members
- **HR Notifications**: "Project Deleted" with impact summary

**Request Example**:
```http
DELETE /project/6901b5caf7ed0f35753d38a4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (204 No Content)

**Notifications Sent**:
1. **All Team Members**: "Project Deleted" - project removed notification
2. **HR**: "Project Deleted" - summary with team member count

---

## Notification Scenarios

All notification scenarios are automatically handled by the system:

### 1. Staff Assignment to Project
**Trigger**: When a staff member is assigned to a project
**Notification Type**: `announcement`
**Title**: "New Project Assignment"
**Message**: "You have been assigned to the project \"{project_name}\". Your manager {manager_name} has created this project."
**Recipients**: Assigned staff member

### 2. Staff Removal from Project
**Trigger**: When a staff member is removed from a project
**Notification Type**: `announcement`
**Title**: "Removed from Project"
**Message**: "You have been removed from the project \"{project_name}\"."
**Recipients**: Removed staff member

### 3. Project Deletion
**Trigger**: When a project is deleted
**Notification Type**: `announcement`
**Title**: "Project Deleted"
**Message (Team)**: "The project \"{project_name}\" has been deleted by {creator_name}. All associated tasks and assignments have been removed."
**Message (HR)**: "The project \"{project_name}\" created by {creator_name} has been deleted. {count} team member(s) were affected."
**Recipients**: All team members + HR

### 4. Project Completion
**Trigger**: When project status changes to `completed`
**Notification Type**: `announcement`
**Title**: "Project Completed"
**Message (Team)**: "The project \"{project_name}\" has been marked as completed. Your task skills have been transferred to your profile."
**Message (HR)**: "The project \"{project_name}\" has been completed. Skills from {task_count} task(s) have been transferred to {user_count} team member(s)."
**Recipients**: All team members + HR

### 5. Project Creation - Direct Assignment
**Trigger**: When project is created with direct subordinates
**Notification Type**: `announcement`
**Title**: "New Project Assignment"
**Message**: "You have been assigned to the project \"{project_name}\". Your manager {manager_name} has created this project."
**Recipients**: Direct subordinate staff

### 6. Project Creation - Approval Request
**Trigger**: When project is created with non-direct staff
**Notification Type**: `project_approval`
**Title**: "Staff Assignment Approval Required"
**Message (Manager)**: "{creator_name} wants to assign your team member {staff_name} to the project \"{project_name}\". Please review and respond to this request."
**Message (Staff)**: "You have been nominated for the project \"{project_name}\" by {creator_name}. Waiting for approval from your manager."
**Recipients**: Staff's manager + Staff member

### 7. Approval Granted
**Trigger**: When manager approves borrow request
**Notification Type**: `announcement`
**Title (Staff)**: "Project Assignment Approved"
**Title (Creator)**: "Staff Assignment Approved"
**Message (Staff)**: "Your manager has approved your assignment to the project \"{project_name}\". You are now officially part of the team!"
**Message (Creator)**: "{staff_name} has been approved by their manager and is now assigned to your project \"{project_name}\"."
**Recipients**: Staff + Project creator

### 8. Approval Rejected
**Trigger**: When manager rejects borrow request
**Notification Type**: `announcement`
**Title**: "Staff Assignment Rejected"
**Message**: "The manager has declined your request to assign {staff_name} to the project \"{project_name}\". You may need to find a replacement."
**Recipients**: Project creator

### 9. HR Project Creation Notification
**Trigger**: When any project is created
**Notification Type**: `announcement`
**Title**: "New Project Created"
**Message**: "{creator_name} has created a new project: \"{project_name}\". {assigned_count} staff member(s) assigned, {pending_count} pending approval."
**Recipients**: All HR users

---

## Project Approval Workflow

### Complete Workflow Diagram

```
Manager Creates Project with Staff IDs
             |
             v
   Check Each Staff Member
             |
     +--------------+--------------+
     |                             |
Direct Subordinate          Non-Direct Staff
(managerId = creator)    (managerId != creator)
     |                             |
     v                             v
Immediately Assigned        Create Borrow Request
     |                             |
     v                             v
Send "Assignment"         Send "Approval Request"
Notification                  to Staff's Manager
     |                             |
     +--------+                    v
              |            Manager Reviews Request
              |                    |
              |         +----------+----------+
              |         |                     |
              |      Approve                Reject
              |         |                     |
              |         v                     v
              |   Add to Project       Send "Rejected"
              |         |              Notification
              |         v              to Creator
              |  Send "Approved"            |
              |  Notifications              |
              |  (Staff + Creator)          |
              |         |                   |
              +---------+-------------------+
                        |
                        v
             Project Successfully Created
                  with Assigned Staff
```

### Workflow Steps

1. **Project Creation**
   - Manager creates project with list of staff IDs
   - System checks each staff member's `managerId`

2. **Staff Categorization**
   - **Own Staff**: `staff.managerId === creator.id`
     - Immediately create ProjectAssignment
     - Send "New Project Assignment" notification
   - **Other's Staff**: `staff.managerId !== creator.id`
     - Create BorrowRequest (isApproved: null for pending)
     - Send approval request to staff's manager
     - Send "Pending Assignment" notification to staff

3. **Manager Reviews Request**
   - Manager receives notification (type: project_approval)
   - Manager accesses `/borrow-request/pending`
   - Manager responds via `/borrow-request/:requestId/respond`

4. **Approval Decision**
   - **If Approved (isApproved: true)**:
     - Create ProjectAssignment
     - Update project teamMemberCount
     - Send "Approved" notification to staff
     - Send "Approved" notification to project creator
   - **If Rejected (isApproved: false)**:
     - Update BorrowRequest isApproved to false
     - Send "Rejected" notification to project creator
     - Staff is NOT added to project

5. **Project Status**
   - Project is created regardless of pending approvals
   - Only approved staff are added to ProjectAssignment
   - Team member count reflects only assigned staff

---

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration (for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# If using Gmail, create an App Password:
# 1. Go to Google Account Settings
# 2. Security > 2-Step Verification
# 3. App passwords > Generate new app password
# 4. Use the generated password as EMAIL_PASS
```

### 2. Database Migrations

The following collections will be automatically created:
- `notifications` - Stores in-app notifications
- `borrowrequests` - Stores staff borrow requests

### 3. Testing the System

#### Test 1: Create Project with Mixed Staff
```bash
# Manager 1 creates project with:
# - Their own staff (direct subordinate)
# - Manager 2's staff (needs approval)

POST /project/with-assignments
{
  "name": "Test Project",
  "description": "Testing approval workflow",
  "staffIds": ["own_staff_id", "other_manager_staff_id"]
}

# Expected:
# - own_staff_id: Assigned immediately
# - other_manager_staff_id: Borrow request created
# - Notifications sent to all parties
```

#### Test 2: Manager Approves Request
```bash
# Manager 2 logs in and checks pending requests
GET /borrow-request/pending

# Manager 2 approves the request
PUT /borrow-request/{requestId}/respond
{
  "isApproved": true
}

# Expected:
# - Staff added to project
# - Notifications sent to staff and project creator
```

#### Test 3: Manager Rejects Request
```bash
# Manager 2 rejects the request
PUT /borrow-request/{requestId}/respond
{
  "isApproved": false
}

# Expected:
# - Staff NOT added to project
# - Rejection notification sent to project creator
```

#### Test 4: Complete Project
```bash
# Project creator completes the project
PUT /project/{projectId}
{
  "status": "completed"
}

# Expected:
# - Skills transferred from in_progress/done tasks
# - Completion notifications sent to team + HR
```

#### Test 5: Check Notifications
```bash
# Staff checks their notifications
GET /notification?isRead=false

# Staff marks all as read
PUT /notification/mark-all-read

# Check unread count
GET /notification/unread-count
```

### 4. Email Testing

If email is not configured, the system will:
- Log email details to console
- Continue processing without errors
- Still create in-app notifications

To enable email:
1. Set up EMAIL_* environment variables
2. Restart the server
3. Emails will be sent for all notification events

---

## Schema Reference

### Notification Schema
```javascript
{
  userId: ObjectId (ref: 'User', required),
  title: String (required, max 255 chars),
  message: String (required),
  type: String (enum: ['announcement', 'project_approval'], required),
  isRead: Boolean (default: false),
  relatedProject: ObjectId (ref: 'Project', optional),
  relatedBorrowRequest: ObjectId (ref: 'BorrowRequest', optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### BorrowRequest Schema
```javascript
{
  projectId: ObjectId (ref: 'Project', required),
  staffId: ObjectId (ref: 'User', required),
  requestedBy: ObjectId (ref: 'User', required),
  approvedBy: ObjectId (ref: 'User', required),
  isApproved: Boolean (default: null),
  // null = pending, true = approved, false = rejected
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

**Last Updated**: 2025-11-01
**Branch**: feat/crud_project
**Version**: 3.0.1 (Notification & Approval System - Status field removed)

---

## Support

For issues or questions:
- Check server logs for detailed error messages
- Verify authentication tokens are valid
- Ensure user has proper role permissions
- Check that related entities (projects, users) exist
- Verify email configuration in .env file