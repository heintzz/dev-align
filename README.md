# DevAlign

<div align="center">

![DevAlign Logo](https://img.shields.io/badge/DevAlign-AI--Powered%20HRIS-blue?style=for-the-badge)

**AI-Powered Human Resource Information System for Intelligent IT Project Allocation**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-devalign.site-success?style=flat-square)](https://devalign.site)
[![GitHub Repo](https://img.shields.io/badge/GitHub-PentabyteDevAlign%2FDevAlign-181717?style=flat-square&logo=github)](https://github.com/PentabyteDevAlign/DevAlign)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-key-features) • [Demo](#-live-demo) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Team](#-team)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Live Demo](#-live-demo)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Team](#-team)
- [Acknowledgments](#-acknowledgments)
- [Contact & Support](#-contact--support)
- [Project Status](#-project-status)

---

## 🎯 Overview

**DevAlign** is an AI-powered Human Resource Information System (HRIS) specifically designed to revolutionize IT project allocation in Indonesia's software industry. Built to address the critical challenge of high employee turnover (20-35% annually) caused by skill-role mismatches, DevAlign leverages artificial intelligence and data analytics to match the right people with the right projects.

### SDG Alignment

DevAlign directly contributes to **UN Sustainable Development Goal 8**: *Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all.*

Specifically targeting:
- **SDG 8.2**: Achieve higher levels of economic productivity through technological upgrading and innovation
- **SDG 8.5**: Achieve full and productive employment and decent work for all

---

## 🚨 The Problem

Indonesia's IT industry faces three interconnected challenges:

### 1. High Employee Turnover Due to Skill-Role Mismatch
- **20-35% annual turnover rate** in IT companies across Indonesia
- 60%+ of IT professionals leave due to misaligned roles (Jobstreet Indonesia, 2024)
- Example: A React Native expert assigned to legacy Java projects → frustration → resignation

### 2. Inefficient Talent Utilization
- **40% of IT companies** cite inefficient staffing as a barrier to meeting deadlines (APJII, 2023)
- No centralized visibility into employee skills, workloads, or availability
- Manual, bias-prone project assignment processes
- Some teams overloaded while others underutilized

### 3. Rising Costs from Workforce Churn
- Replacing one IT professional costs **50-150% of their annual salary** (Mercer Indonesia, 2024)
- Lengthy recruitment and onboarding processes slow project delivery
- Small/medium IT enterprises most affected due to lack of HR analytics

**The Vicious Cycle**: Skill mismatch → Poor performance → Employee frustration → Resignation → High replacement cost → Rushed hiring → Skill mismatch...

---

## 💡 Our Solution

DevAlign breaks this cycle with **intelligent, data-driven workforce management**:

### Core Innovation
An AI-powered system that:
- ✅ **Automates CV extraction** using LLM technology (GPT oss 20b)
- ✅ **Recommends optimal project teams** based on project details, skill match, workload, and experience with LLM technology (GPT 4.1 nano)
- ✅ **Provides real-time collaboration** through WebSocket-powered Kanban boards
- ✅ **Enables transparent communication** via dual-channel notifications (email + in-app)
- ✅ **Tracks workforce analytics** for data-driven HR decisions

### How It Works
1. **HR uploads employee CVs** → AI extracts skills, experience, certifications in 3 seconds
2. **Project Manager creates a project** → AI analyzes all employees and ranks candidates by compatibility
3. **Smart allocation engine** considers: skill match %, current workload, past performance
4. **Real-time task management** syncs across distributed teams via Socket.io
5. **Predictive insights (Future Development)** help HR intervene before talent loss occurs

---

## ✨ Key Features

### For HR Managers
- 🤖 **AI-Powered CV Extraction**: Upload PDF resumes, auto-fill employee profiles in seconds
- 📊 **Bulk Import**: Onboard 100+ employees via Excel with validation
- 📧 **Automated Onboarding**: Welcome emails with credentials sent automatically
- 📈 **Workforce Analytics**: HR Dashboard
- 🔔 **Smart Notifications**: Email + in-app alerts for approvals and system events

### For Project Managers
- 🎯 **Intelligent Team Recommendations**: AI ranks employees by project fit (95%+ accuracy)
- 🔄 **Manual Override**: Compare AI suggestions with manual browsing, switch seamlessly
- 📋 **3-Step Project Wizard**: Define requirements → Select team → Review & Create
- 📊 **Real-Time Dashboards**: Track active projects, deadlines, team capacity


### For Staff Members
- 👤 **Personalized Dashboards**: View assigned projects, tasks, deadlines
- 📌 **Kanban Task Boards**: Drag-and-drop task management with real-time sync
- 🔔 **Project Notifications**: Instant alerts for new assignments and updates
- 👥 **Collaborative Workspace**: See teammate updates live, no refresh needed
- 📊 **Performance Visibility**: Track contributions across projects

### Technical Excellence
- 🏗️ **Microservices Architecture**: Frontend, Backend API, AI Service (Docker orchestrated)
- 🔒 **Enterprise Security**: JWT authentication, RBAC, HTTPS, bcrypt password hashing
- 🚀 **CI/CD Pipeline**: GitHub Actions auto-deploy to AWS EC2 in <5 minutes
- ⚡ **Real-Time Collaboration**: Socket.io rooms for multiplayer Kanban boards

---

## 🌐 Live Demo

### 🔗 Access DevAlign
- **Production URL**: [https://devalign.site](https://devalign.site)

### 🔑 Test Accounts

| User | Email | Role | Manager | Position | Password |
|------|-------|------|---------|----------|----------|
| **Raffi Fajar Rhamadhan** | raffifr098@gmail.com | HR | - | - | 123 |
| **Hasnan Regard** | mhasnanr@gmail.com | Manager | - | - | 123 |
| **Rahadi Fauzan** | rahadifauzan3@gmail.com | Manager | - | - | 123 |
| **Regard Hasnan** | muhammadhasnan033@gmail.com | Staff | Rahadi Fauzan | ML Engineer | 123 |
| **Tony Varian Yoditanto** | tonyoditanto@gmail.com | Staff | Hasnan Regard | Backend Developer | 123 |

**Access Levels by Role:**
- **HR**: Employee management, analytics, bulk import, CV extraction
- **Manager**: Project creation, AI team recommendations, team allocation, approval workflows
- **Staff**: Task management, Kanban boards, project collaboration, notifications

> **Note**: Test accounts use demo data. Feel free to explore all features!

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand
- **Real-Time**: Socket.io Client
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Tables**: TanStack React Table
- **Forms**: React Hook Form
- **Drag & Drop**: hello-pangea/dnd
- **Notifications**: Custom Toast with Framer Motion

### Backend (API Service)
- **Runtime**: Node.js 20.x
- **Framework**: Express.js 5.1
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **File Processing**: Multer, xlsx, pdf-parse
- **Email**: Nodemailer with Gmail SMTP
- **Real-Time**: Socket.io
- **Job Queue**: Agenda (MongoDB-backed)
- **API Docs**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Security**: CORS, helmet, express-validator

### AI/ML Service
- **Framework**: Python FastAPI (async)
- **LLM**: GPT 4.1 nano & GPT oss 20b
- **Embeddings**: OpenAI text-embedding-3-small
- **CV Parsing**: PyPDF2
- **Similarity**: Cosine similarity for calculating project similarity
- **Database**: MongoDB (shared with backend)

### Infrastructure
- **Cloud**: AWS EC2 (Singapore region)
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (reverse proxy + static hosting)
- **SSL/TLS**: Let's Encrypt (Certbot)
- **CI/CD**: GitHub Actions
- **Monitoring**: Docker logs, Nginx access/error logs

### DevOps
- **Version Control**: Git + GitHub
- **Branching Strategy**: GitFlow (master, dev, feature)
- **Deployment**: Automated via GitHub Actions on push to `dev`
- **Secrets Management**: GitHub Secrets + .env files
- **Backup**: Automated repository backups before deployment

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                           │
│                  https://devalign.site                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│           Frontend EC2 (xx.xxx.xxx.xx)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Nginx (HTTPS → Static React Build)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                   │
                   │ HTTPS API Calls
                   ▼
┌─────────────────────────────────────────────────────────────┐
│           Backend EC2 (xx.xxx.xxx.xx)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Nginx Reverse Proxy                                 │  │
│  │  ├─ xxx.devalign.site → :x00x (Backend API)         │  │
│  │  └─ xx.devalign.site  → :x00x (AI Service)          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │  Docker Container    │  │  Docker Container    │       │
│  │  Backend API         │  │  AI Service          │       │
│  │  (Node.js/Express)   │  │  (Python/FastAPI)    │       │
│  │  Port: x00x          │  │  Port: x00x          │       │
│  └──────────────────────┘  └──────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                   │
                   │ MongoDB Atlas
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud Database)                  │
│  Collections: users, projects, tasks, skills, notifications │
└─────────────────────────────────────────────────────────────┘
```

### Microservices Breakdown

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| **Frontend** | React + Vite | 80/443 | UI/UX, client-side routing, state management |
| **Backend API** | Node.js + Express | 5000 | CRUD, authentication, business logic, WebSocket |
| **AI Service** | Python + FastAPI | 8000 | CV extraction, team recommendations, embeddings |
| **Database** | MongoDB Atlas | 27017 | Data persistence, indexing, aggregations |
| **Email Queue** | Agenda + Nodemailer | N/A | Async email delivery, retry logic |

---

## 👥 Team

**DevAlign** is developed by **Team PentaByte** as part of our capstone project.

<table>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/Fullstack-Developer-blue?style=flat-square" alt="Role"/><br/>
      <b>Rahadi Fauzan</b><br/>
      <a href="https://linkedin.com/in/rahadi-fauzan">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin" alt="LinkedIn"/>
      </a><br/>
      📞 +62 811-1107-244
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/UI%2FUX%20Designer-Frontend-purple?style=flat-square" alt="Role"/><br/>
      <b>Irsyad Ibadurrahman</b><br/>
      <a href="https://linkedin.com/in/irsyadibdrrhmn19">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin" alt="LinkedIn"/>
      </a><br/>
      📞 +62 877-2351-4244
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/AI%20Engineer-Backend-green?style=flat-square" alt="Role"/><br/>
      <b>Muhammad Hasnan Regard</b><br/>
      <a href="https://linkedin.com/in/mhasnanr">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin" alt="LinkedIn"/>
      </a><br/>
      📞 +62 851-5531-1485
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/Backend-QA-orange?style=flat-square" alt="Role"/><br/>
      <b>Raffi Fajar Rhamadhan</b><br/>
      <a href="https://linkedin.com/in/raffifajar">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin" alt="LinkedIn"/>
      </a><br/>
      📞 +62 858-1191-7518
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/Project%20Manager-Backend%20%26%20DevOps-red?style=flat-square" alt="Role"/><br/>
      <b>Tony Varian Yoditanto</b><br/>
      <a href="https://linkedin.com/in/tony-yoditanto">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin" alt="LinkedIn"/>
      </a><br/>
      📞 +62 812-1612-9884
    </td>
    <td align="center">
      <br/><br/>
      <b>Team PentaByte</b><br/>
      <i>Building the future of HR tech</i>
    </td>
  </tr>
</table>

---

## 🙏 Acknowledgments

- **Sustainable Development Goals (SDG 8)** for inspiring our mission
- **GPT oss 20b** for CV extraction capabilities
- **OpenAI** for embedding models
- **MongoDB Atlas** for database hosting
- **AWS** for cloud infrastructure
- **Let's Encrypt** for free SSL certificates
- **All open-source contributors** whose libraries made this possible

---

## 📞 Contact & Support

- **GitHub**: [PentabyteDevAlign/DevAlign](https://github.com/PentabyteDevAlign/DevAlign)
- **Issues**: [Report a bug or request a feature](https://github.com/PentabyteDevAlign/DevAlign/issues)
- **Email**: devalign.id@gmail.com

---

## 🎯 Project Status

**Current Version**: 1.0.0 (Production Ready)

**Roadmap**:
- ✅ Phase 1: Core HRIS features (Employee management, CV extraction)
- ✅ Phase 2: AI-powered project allocation
- ✅ Phase 3: Real-time collaboration (Kanban boards)
- ✅ Phase 4: Notification system (Email + In-app)
- ✅ Phase 5: Production deployment (AWS + HTTPS)
- 📋 Phase 6: Advanced analytics dashboard
- 📋 Phase 7: Multi-language support (Bahasa Indonesia + English)

---

<div align="center">

**Made with ❤️ by Team PentaByte**

*Empowering Indonesia's IT workforce with intelligent HR solutions*

[![GitHub stars](https://img.shields.io/github/stars/PentabyteDevAlign/DevAlign?style=social)](https://github.com/PentabyteDevAlign/DevAlign/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/PentabyteDevAlign/DevAlign?style=social)](https://github.com/PentabyteDevAlign/DevAlign/network/members)

</div>
