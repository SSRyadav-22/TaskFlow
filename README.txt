================================================================================
TASKFLOW — Full-Stack Team Task Manager
================================================================================

GITHUB:   https://github.com/SSRyadav-22/TaskFlow.git
LIVE URL: <your-deployment-url>

================================================================================
PROJECT OVERVIEW
================================================================================
TaskFlow is a modern full-stack Team Task Manager with:

  - Organisation/Workspace layer (like Jira spaces / Slack workspaces)
  - Role-based access control (Admin / Member)
  - Kanban-style project task boards
  - JWT authentication with auto token refresh
  - Minimalist dark-mode React frontend (Vite)
  - Django REST Framework backend with SQLite

================================================================================
TECH STACK
================================================================================
  Backend:    Python 3.14 + Django 5.1 + Django REST Framework
  Auth:       JWT via djangorestframework-simplejwt
  Database:   SQLite (default, zero config)
  CORS:       django-cors-headers
  Frontend:   React 18 + Vite + React Router v6
  Styling:    Vanilla CSS (Inter font, dark minimalist theme)
  Deployment: Railway + Gunicorn + WhiteNoise

================================================================================
ARCHITECTURE — KEY APPS
================================================================================
  apps/accounts   — Custom User model (email login), JWT registration
  apps/orgs       — Organisation (workspace) model + membership
  apps/projects   — Projects, project members, per-project roles
  apps/tasks      — Tasks with status/priority/due-date + dashboard API
  frontend/       — Vite + React SPA (inside frontend/frontend/)

================================================================================
LOCAL SETUP
================================================================================

--- BACKEND ---

1. Clone the repo:
   git clone https://github.com/SSRyadav-22/TaskFlow.git
   cd TaskFlow

2. Create and activate a virtual environment:
   python -m venv venv
   venv\Scripts\activate          # Windows
   # source venv/bin/activate     # macOS/Linux

3. Install dependencies:
   pip install -r requirements.txt

4. Copy .env.example → .env and set your SECRET_KEY:
   cp .env.example .env           # Linux/macOS
   copy .env.example .env         # Windows

5. Run migrations (seeds Ethara + Random Company orgs automatically):
   python manage.py migrate

6. Create a superuser for the Django admin:
   python manage.py createsuperuser

   NOTE: Login to admin uses EMAIL not username.
   Admin panel: http://127.0.0.1:8000/admin/

7. Start the backend server:
   python manage.py runserver
   API available at: http://localhost:8000/api/

--- FRONTEND ---

1. Navigate to the frontend directory:
   cd frontend/frontend

2. Install dependencies:
   npm install

3. Start the dev server:
   npm run dev
   App available at: http://localhost:5173/

================================================================================
USER FLOW
================================================================================
  1. Register / Login at /login or /register
  2. Choose your Organisation (workspace) — Ethara, Random Company, or create one
  3. Create Projects inside your workspace
  4. Add team members to a project
  5. Create tasks (only assignable to project members)
  6. Track progress on the Kanban board (To Do / In Progress / Done)
  7. View overdue tasks and personal dashboard stats

================================================================================
API ENDPOINTS
================================================================================

AUTH
  POST   /api/auth/register/          Register {username, email, password, role}
  POST   /api/auth/login/             Login — returns {access, refresh} JWT
  POST   /api/auth/token/refresh/     Refresh access token
  GET    /api/auth/me/                Current user info
  GET    /api/auth/users/             List all users

ORGANISATIONS
  GET    /api/orgs/                   List all organisations
  POST   /api/orgs/                   Create new organisation (caller becomes owner)
  GET    /api/orgs/mine/              Organisations the current user belongs to
  GET    /api/orgs/:id/               Organisation detail
  POST   /api/orgs/:id/join/          Join an open organisation
  GET    /api/orgs/:id/members/       List organisation members

PROJECTS  (scoped to X-Org-Id header)
  GET    /api/projects/               List projects in current org
  POST   /api/projects/               Create project {name, description, org}
  GET    /api/projects/:id/           Project detail
  PUT    /api/projects/:id/           Update project
  DELETE /api/projects/:id/           Delete project
  GET    /api/projects/:id/members/   List project members
  POST   /api/projects/:id/add-member/          Add member {user_id, role}
  DELETE /api/projects/:id/remove-member/:uid/  Remove member

TASKS
  GET    /api/tasks/                  List tasks (see filters below)
  POST   /api/tasks/                  Create task {title, project, priority, ...}
  GET    /api/tasks/:id/              Task detail
  PUT    /api/tasks/:id/              Update task
  DELETE /api/tasks/:id/              Delete task
  PATCH  /api/tasks/:id/status/       Update status only {status}
  GET    /api/tasks/dashboard/        Dashboard summary + my tasks + overdue

================================================================================
AUTHENTICATION
================================================================================
All endpoints (except /register/ and /login/) require:
  Header: Authorization: Bearer <access_token>

Organisation-scoped endpoints also require:
  Header: X-Org-Id: <organisation_id>
  (The frontend sets this automatically from the selected workspace)

================================================================================
ROLES & PERMISSIONS
================================================================================
Global roles (set on User):
  admin   — Sees all projects & tasks across all orgs
  member  — Sees only their own projects & tasks

Organisation roles (OrgMember):
  owner   — Created the org; full control
  admin   — Can manage org members
  member  — Regular workspace member

Project roles (ProjectMember):
  admin   — Can add/remove members, create/edit tasks
  member  — Can view tasks and update status

Task Assignment Rule:
  Tasks can only be assigned to users who are already members of that project.
  Backend enforces this — frontend "Assign to" dropdown shows only project members.

================================================================================
TASK STATUS & PRIORITY VALUES
================================================================================
  status:   todo | in_progress | done
  priority: low  | medium      | high

================================================================================
QUERY PARAMS (GET /api/tasks/)
================================================================================
  ?project=<id>    Filter by project
  ?status=todo     Filter by status
  ?priority=high   Filter by priority
  ?mine=true       Tasks assigned to me
  ?overdue=true    Tasks past due date

================================================================================
DJANGO ADMIN
================================================================================
  URL:      http://127.0.0.1:8000/admin/
  Login:    Use EMAIL (not username) + password
  Sections:
    - Accounts → Users           (list, filter, manage all users)
    - Organisations → Orgs       (with inline member list)
    - Projects → Projects        (with inline member list, task count)
    - Projects → Project Members
    - Tasks → Tasks              (with overdue indicator)

================================================================================
DEPLOYMENT (Railway)
================================================================================
1. Push code to GitHub
2. Create a new Railway project → "Deploy from GitHub repo"
3. Set environment variables in Railway dashboard:
     SECRET_KEY=<generate a strong key>
     DEBUG=False
     ALLOWED_HOSTS=<your-railway-domain>
4. Railway auto-detects the Procfile and runs:
     python manage.py migrate && gunicorn taskmanager.wsgi:application
5. Your app is live!

NOTE: The seed migration (orgs 0002_seed) will automatically create
Ethara and Random Company organisations on first deploy.

================================================================================
PROJECT STRUCTURE
================================================================================
  taskmanager/
  ├── apps/
  │   ├── accounts/     User model, JWT auth, registration
  │   ├── orgs/         Organisation + OrgMember models & API
  │   ├── projects/     Project + ProjectMember models & API
  │   └── tasks/        Task model, dashboard API
  ├── taskmanager/      Django settings, URLs, WSGI
  ├── frontend/
  │   └── frontend/     Vite + React SPA
  │       └── src/
  │           ├── api/          Axios client (auto attaches JWT + X-Org-Id)
  │           ├── context/      AuthContext, OrgContext
  │           ├── components/
  │           │   ├── layout/   Sidebar Layout
  │           │   └── ui/       Btn, Input, Card, Modal, Badge, etc.
  │           └── pages/        Login, Register, OrgPicker, Dashboard,
  │                             Projects, ProjectDetail, Tasks
  ├── requirements.txt
  ├── .env.example
  ├── .gitignore
  └── README.txt

================================================================================
