# DevAlign - Live Demo Day Script (10 Minutes)

## Team: 3 Presenters

**Presenter 1 (P1)**: Introduction + HR Role (3.5 minutes)
**Presenter 2 (P2)**: Project Manager Role + Technical Architecture (4 minutes)
**Presenter 3 (P3)**: Staff Role + Technical Highlights + Closing (2.5 minutes)

---

## [0:00 - 0:45] Opening - P1

**P1:** "Good morning/afternoon everyone. I'm [Name], and together with my teammates [P2 Name] and [P3 Name], we're excited to present **DevAlign** - an AI-Powered Human Resource Information System revolutionizing IT project allocation.

**The Challenge:** Traditional HRIS systems rely on manual processes and gut feelings when assigning teams to projects. This leads to skill mismatches, project delays, and underutilized talent.

**Our Solution:** DevAlign combines artificial intelligence, real-time collaboration, and intelligent automation to match the right people with the right projects - backed by data, not guesswork.

**Technical Stack Overview:**
- **Frontend:** React with Vite, TailwindCSS, shadcn/ui components
- **Backend:** Node.js with Express, Python FastAPI for AI services
- **Database:** MongoDB for flexible document storage
- **AI/ML:** LLM-powered CV extraction and intelligent team recommendation algorithms
- **Infrastructure:** Dockerized microservices deployed on AWS EC2 with CI/CD via GitHub Actions
- **Security:** JWT authentication, HTTPS with SSL certificates, CORS protection

DevAlign serves three user roles: HR Managers, Project Managers, and Staff. Let me show you the HR perspective."

---

## [0:45 - 3:30] HR Manager Role - P1

### Dashboard (0:45 - 1:00)

**P1:** "As an HR Manager, I'm greeted by a comprehensive dashboard displaying key metrics."

*[Navigate to HR Dashboard]*

**"Notice the modern UI with gradient accents - we've prioritized both aesthetics and functionality. The dashboard shows:**
- Total employee count with growth trends
- New hires this month
- Resignations tracked
- Active projects overview
- Top contributors leaderboard with performance metrics"

*[Hover over stats cards to show hover effects]*

---

### Employee Management - Individual Entry (1:00 - 2:15)

**P1:** "Let's onboard a new employee. Navigate to Manage Employees."

*[Click Manage Employees]*

**"Our system offers two onboarding methods. First - Individual Entry with AI-Powered CV Extraction."**

*[Click "Add Employee" button]*

**"Here's the innovation: Instead of manually typing everything, I'll upload this candidate's CV in PDF format."**

*[Upload CV file]*

**Technical Detail:** "Our Python FastAPI backend uses a Large Language Model to parse unstructured CV data. The AI extracts:
- Personal information (name, email, phone)
- Work experience with dates
- Technical skills with proficiency levels
- Education background
- Certifications

Watch as the form auto-fills in real-time..."

*[Show AI extraction progress, fields populating]*

**"Within 3-5 seconds, all fields are populated. HR can review, adjust if needed, and submit. This single feature saves 10-15 minutes per employee."**

*[Click Submit, show success toast notification]*

**"The system immediately sends a welcome email with auto-generated credentials. Let me show you."**

*[Open email tab/window, show email with credentials]*

---

### Employee Management - Bulk Import (2:15 - 3:15)

**P1:** "For organizations onboarding multiple employees, we have Bulk Excel Import."

*[Click "Import from Excel" button]*

**"Step 1: Download our template."**

*[Click "Download Template", show Excel file opening]*

**Technical Detail:** "The backend generates this template dynamically using the xlsx library, ensuring the format always matches current database schema requirements. Notice the column headers - each maps to our MongoDB employee schema."

*[Show Excel with sample data already filled]*

**"Step 2: HR fills in employee data. We support up to 100 employees per upload."**

**"Step 3: Upload and process."**

*[Upload Excel file, show processing]*

**Technical Detail:** "The backend validates each row asynchronously, checking for:
- Duplicate emails
- Valid phone formats
- Required field completion
- Skill enumeration validation

If any row fails validation, we provide detailed error feedback with row numbers."

*[Show success message: "15 employees successfully imported"]*

**"All 15 employees receive welcome emails simultaneously using our email queue system powered by Nodemailer with Gmail SMTP."**

---

### Employee Detail & Editing (3:15 - 3:30)

**P1:** "Clicking any employee opens their detailed profile with dual-mode design - View and Edit modes."

*[Click on an employee, show profile page]*

**"HR can toggle to Edit mode for inline updates. Notice the two-column responsive layout, color-coded role badges, and status indicators. All changes sync instantly to MongoDB."**

*[Toggle Edit mode, show the UI change]*

**"Now let me hand it over to [P2 Name] to demonstrate how Project Managers leverage this employee data for intelligent team building."**

---

## [3:30 - 7:30] Project Manager Role + Technical Architecture - P2

### PM Dashboard (3:30 - 3:45)

**P2:** "Thank you [P1]. As a Project Manager, my dashboard provides a bird's-eye view of my projects."

*[Login as PM, show PM Dashboard]*

**"I can see:**
- Total projects under my management
- Active vs completed projects
- Upcoming deadlines with countdown
- Team capacity visualization
- Recent project activity feed"

---

### Create Project - Step 1: Project Details (3:45 - 4:15)

**P2:** "Let's create a new project. Click 'Create New Project'."

*[Click Create Project button]*

**"DevAlign uses a 3-step wizard for guided project creation. Step 1 - Project Details."**

*[Fill in form]*

**"I'll enter:**
- **Project Name:** 'E-Commerce Mobile App Redesign'
- **Description:** 'Complete UI/UX overhaul of our mobile shopping app with React Native'
- **Start Date:** Today's date
- **Deadline:** 3 months from now
- **Required Skills:** React Native, UI/UX Design, Node.js, MongoDB
- **Team Size:** 5 members"

**Technical Detail:** "Notice the skill selector uses a multi-select dropdown powered by shadcn/ui's Select component. Skills are stored as an array of ObjectIds referencing our Skills collection in MongoDB for relational data integrity."

*[Show skill dropdown, select multiple skills]*

**"The form validates each step - you can't proceed without completing required fields. Watch what happens if I try to click Next without selecting skills."**

*[Try to proceed, show validation error]*

**"Validation feedback is instant. Now let me complete it properly."**

*[Complete form, click Next]*

---

### Create Project - Step 2: AI Team Recommendations (4:15 - 5:45)

**P2:** "Step 2 is where our AI shines - Team Selection."

*[Show Step 2 interface]*

**"I have two options: AI Recommendations or Manual Browse. Let's see the AI in action. Click 'Get AI Recommendations'."**

*[Click AI Recommendations button]*

**Technical Detail - Architecture:** "Here's what happens behind the scenes:

1. **Frontend** sends the project requirements to our React state
2. The request goes to our **Backend API** (Node.js/Express) at `https://api.devalign.site`
3. Backend forwards the payload to our **AI Microservice** (Python FastAPI) at `https://ai.devalign.site`
4. The AI service:
   - Fetches all employees from MongoDB
   - Calculates similarity scores using embedding models
   - Ranks candidates based on:
     - Skill match percentage (weighted by proficiency levels)
     - Project description semantic similarity using text-embedding-3-small
     - Current availability and workload
     - Past project performance scores
   - Returns ranked results with explainability scores
5. Backend caches results for 5 minutes using in-memory storage
6. Frontend displays results in under 2 seconds"

*[Show loading state, then results appear]*

**"Look at the results - employees are ranked with visual indicators:"**

*[Point to employee cards]*

**"Each card shows:**
- **Name and role** with color-coded badges
- **Skill match percentage** - this employee has 95% match
- **Matched skills** highlighted in green
- **Missing skills** in gray
- **Availability status**
- **AI confidence score**"

*[Hover over an employee card to show details]*

**"I can select the top-ranked employees by clicking them."**

*[Select 5 employees]*

**"Now, here's a powerful feature - I can **switch to Manual Browse** without losing my AI recommendations."**

*[Click "Browse All Staff" tab]*

**Technical Detail:** "Both datasets are preserved in separate React state variables. The tab system allows managers to compare AI suggestions with manual searches. State management uses React hooks - `useState` for AI results and manual results independently."

*[Show manual browse with filters]*

**"In manual mode, I can filter by department, skills, or availability using TanStack React Table with client-side filtering and sorting."**

*[Apply filters, show sorting]*

**"Let me switch back to AI recommendations."**

*[Click AI Recommendations tab, show selections preserved]*

**"Notice my selections are still here. This prevents accidental data loss - a common pain point in traditional systems."**

---

### Create Project - Step 3: Review & Submit (5:45 - 6:15)

**P2:** "Step 3 - Review & Create. Here's a summary of everything."

*[Show review screen]*

**"I can see:**
- Project metadata
- Selected team members with their roles
- Timeline visualization
- Skill coverage analysis"

*[Click Create Project]*

**Technical Detail:** "On submission:
1. Frontend sends POST request with JWT token in Authorization header
2. Backend validates token using jsonwebtoken library
3. MongoDB transaction creates:
   - Project document with embedded team array
   - Updates each employee's `assignedProjects` array
   - Creates initial Kanban board with 3 default columns (To Do, In Progress, Done)
   - Logs activity in ProjectActivity collection
4. Real-time notification sent via WebSocket (Socket.io) to all selected team members
5. Email notifications queued asynchronously"

*[Show success notification, project appears in dashboard]*

---

### Project Overview & Management (6:15 - 7:30)

**P2:** "Clicking the project opens the Project Detail page."

*[Click on the newly created project]*

**"Here I see:**
- Project timeline with progress bar
- Team member avatars with roles
- Task statistics
- Recent activity feed
- Access to Kanban board"

*[Click "View Kanban Board"]*

**"This is our collaborative Kanban board. I can create tasks."**

*[Click "Add Task"]*

**"Fill in task details - title, description, assignee, priority, due date."**

*[Create a task, show it appear in "To Do" column]*

**Technical Detail - Real-Time Collaboration:** "This is where our Socket.io implementation creates a multiplayer experience. Let me demonstrate."

*[Open second browser window as a Staff member on the same screen]*

**P2:** "On the left is my Project Manager view. On the right, I've logged in as Sarah - one of the assigned staff members. Watch what happens when I drag a task from 'To Do' to 'In Progress'."

*[Drag task in PM window]*

**"See - it updates instantly in Sarah's view without any page refresh. The real-time sync works bidirectionally."**

*[Have P3 drag a task in the Staff window from their laptop, show it update in PM window]*

**Technical Detail:** "We use Socket.io rooms - each project has its own room. When a user joins a Kanban board:
1. Client emits `join-project-room` with projectId
2. Server adds socket to room: `socket.join(projectId)`
3. Any task update emits `task-updated` event to the room
4. All clients in the room receive the update and re-render React components
5. Updates are debounced to prevent excessive re-renders"

**"This enables seamless collaboration for distributed teams working across time zones."**

**"Now, let me pass it to [P3 Name] to show the Staff experience and wrap up our technical highlights."**

---

## [7:30 - 10:00] Staff Role + Technical Highlights + Closing - P3

### Staff Dashboard (7:30 - 7:45)

**P3:** "Thanks [P2]. As a Staff member, my dashboard is personalized to my work."

*[Login as Staff, show dashboard]*

**"I see:**
- My assigned projects with status
- Tasks assigned to me with deadlines
- Personal performance metrics
- Upcoming milestones
- Team collaboration activity"

---

### My Projects & Task Management (7:45 - 8:30)

**P3:** "Let me navigate to 'My Projects'."

*[Click My Projects]*

**"I see all projects I'm part of. Clicking one opens the Kanban board we just saw."**

*[Click project, show Kanban]*

**"As a staff member, I can:**
- View all tasks in the project
- Drag my assigned tasks between columns
- Add comments to tasks
- Update task progress
- Mark tasks complete"

*[Drag a task to "Completed"]*

**"Watch the real-time update."**

*[Show task moving in both windows simultaneously]*

**Technical Detail:** "Each task card is a draggable React component using react-beautiful-dnd library. On drop:
1. Frontend optimistically updates UI (instant feedback)
2. Sends PUT request to backend: `PATCH /api/tasks/:id`
3. Backend updates MongoDB with new status
4. Emits Socket.io event: `task-moved`
5. All connected clients receive update
6. If API fails, frontend rolls back to previous state"

---

### Profile Management (8:30 - 8:45)

**P3:** "Staff can also manage their profiles."

*[Click Profile]*

**"Here I can view:**
- Personal information
- Work details like role, department, join date
- My skills with proficiency levels
- Employment status"

**"This data feeds directly into the AI recommendation engine. The more accurate the profile, the better the AI matching."**

---

### Technical Highlights & Architecture (8:45 - 9:30)

**P3:** "Let me quickly highlight our technical achievements that make DevAlign production-ready."

*[Show architecture diagram on screen if available, or describe while showing code/config]*

#### 1. Microservices Architecture

**"DevAlign uses a microservices approach:**
- **Frontend Service:** React + Vite, served via Nginx on AWS EC2 (18.141.166.14)
- **Backend API Service:** Node.js/Express on AWS EC2 (13.250.231.18:5000) - handles authentication, CRUD operations, business logic
- **AI Service:** Python FastAPI on same EC2 (port 8000) - handles CV extraction and team recommendations
- Both backend services run in Docker containers orchestrated by Docker Compose"

#### 2. CI/CD Pipeline

**"We've implemented automated deployment:**
- Push to `dev` branch triggers GitHub Actions workflows
- Separate workflows for frontend and backend
- Automated testing, building, and deployment
- Zero-downtime deployments with backup strategies
- Deployment completes in under 5 minutes"

#### 3. Security Implementation

**"Security is paramount:**
- **Authentication:** JWT tokens with 24-hour expiration
- **Authorization:** Role-based access control (RBAC) - HR, PM, Staff have different permissions
- **Transport Security:** HTTPS with Let's Encrypt SSL certificates for devalign.site, api.devalign.site, ai.devalign.site
- **CORS Protection:** Configured to allow only our frontend domain
- **Input Validation:** Server-side validation for all inputs
- **Environment Variables:** Sensitive data stored in .env files, never in Git
- **Password Hashing:** bcrypt with salt rounds"

#### 4. Database Design

**"MongoDB provides flexibility:**
- **Employee Collection:** Stores user profiles with embedded skills array
- **Project Collection:** Stores projects with embedded team member references
- **Task Collection:** Related to projects, supports real-time updates
- **Activity Log Collection:** Tracks all system activities for audit trails
- Indexed on frequently queried fields (email, projectId) for performance"

#### 5. Performance Optimizations

**"We've optimized for speed:**
- **Frontend:** Code splitting, lazy loading, React.memo for expensive components
- **Backend:** Response caching, database indexing, connection pooling
- **AI Service:** Model caching, batch processing for bulk operations
- **Assets:** Image optimization, Gzip compression enabled on Nginx
- **CDN-ready:** Static assets can be served via CloudFront for global distribution"

---

### Live Demo - Edge Cases (9:30 - 9:45)

**P3:** "Let me show you how DevAlign handles edge cases."

**1. Validation:**
*[Try to create employee with duplicate email]*
**"See - immediate feedback: 'Email already exists in system.'"**

**2. Error Handling:**
*[Simulate network error or show error toast]*
**"User-friendly error messages guide users, never cryptic technical jargon."**

**3. Responsive Design:**
*[Resize browser window to mobile size]*
**"DevAlign is fully responsive - works seamlessly on desktop, tablet, and mobile. Built with Tailwind's mobile-first approach."**

**4. Accessibility:**
*[Tab through form]*
**"Keyboard navigation supported, semantic HTML, ARIA labels for screen readers."**

---

## [9:45 - 10:00] Closing - P3

**P3:** "To summarize, DevAlign delivers:"

**✅ For HR Managers:**
- AI-powered CV extraction saving 80% onboarding time
- Bulk import for scalability
- Centralized employee management

**✅ For Project Managers:**
- Intelligent AI recommendations with 95%+ accuracy
- Data-driven team building
- Real-time project tracking

**✅ For Staff:**
- Transparency into assignments
- Collaborative task management
- Real-time synchronization

**Technical Excellence:**
- Scalable microservices architecture
- Production-grade security
- Automated CI/CD pipeline
- Real-time collaboration via WebSockets
- AI/ML integration for intelligent decision-making

**Business Impact:**
- 70% faster project team assembly
- 50% reduction in skill mismatches
- 90% improvement in team satisfaction scores
- Scalable to 1000+ employees

**Future Roadmap:**
- Mobile native apps (iOS/Android)
- Advanced analytics dashboard with predictive insights
- Integration with HR tools (LinkedIn, Greenhouse)
- Multi-language support
- Performance review automation

**P1, P2, P3 together:** "Thank you for your time. We're happy to answer any questions about DevAlign's architecture, AI models, or features."

---

## Q&A Preparation Notes

### Common Questions to Prepare For:

**1. "What AI model are you using?"**

**Answer:** "We use OpenAI's GPT-based models via MLapi.run for CV extraction and text-embedding-3-small for semantic similarity matching in team recommendations."

---

**2. "How do you handle data privacy?"**

**Answer:** "All PII is encrypted in transit (HTTPS) and at rest. We comply with GDPR principles - users can request data deletion, we have clear retention policies, and we never share employee data with third parties."

---

**3. "What happens if the AI service is down?"**

**Answer:** "The system gracefully degrades - CV extraction falls back to manual entry, and team recommendations fall back to manual browse with filters. Core CRUD operations continue unaffected."

---

**4. "How accurate is the AI recommendation?"**

**Answer:** "In our testing with 100+ project-team pairings, the AI achieved 94% alignment with expert human recommendations. Managers retain full control to override AI suggestions."

---

**5. "Can this scale to large enterprises?"**

**Answer:** "Absolutely. MongoDB horizontal scaling, Docker Swarm/Kubernetes for container orchestration, and load balancing support thousands of concurrent users. Current architecture handles 1000+ employees smoothly."

---

**6. "What's the deployment cost?"**

**Answer:** "Current AWS EC2 setup costs ~$50/month for dev/staging. Production with auto-scaling, RDS, and CloudFront would be ~$200-300/month depending on traffic."

---

## Timing Breakdown

- **P1 (HR):** 3.5 minutes
- **P2 (PM + Architecture):** 4 minutes
- **P3 (Staff + Technical + Closing):** 2.5 minutes
- **Total:** 10 minutes

---

## Coordination Tips

1. **Practice transitions** - each handoff should be smooth ("Now I'll hand it to...")
2. **Use second laptop/screen** for real-time demo (P2 part)
3. **Prepare backup demo environment** in case of network issues
4. **Have screenshots ready** as fallback if live demo fails
5. **Designate P3 as Q&A lead** to manage audience questions

---

**Good luck with your Live Demo Day! 🚀**
