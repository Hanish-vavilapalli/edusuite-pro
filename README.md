# EduSuite Pro — Enterprise College Management System (CMS & ERP)

![EduSuite Pro Banner](https://img.shields.io/badge/EduSuite%20Pro-v1.0.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite)
![Express](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.12-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Postgres--based-4169E1?style=for-the-badge&logo=postgresql)

---

## 📌 Executive Summary

**EduSuite Pro** is an all-in-one, enterprise-grade Higher Education Campus Management System (CMS & ERP). Built with a modern micro-services architecture, it orchestrates institutional operations across academics, admissions, student life, faculty workflows, examinations, financial operations, human resources, library, transport, hostels, and super-admin governance.

---

## 🌟 Key Functional Modules

### 🛡️ 1. Super Admin Cockpit & Controller
- **Global User Management**: Register, view dossier, update status, edit, and bulk-manage system accounts across 9 distinct roles.
- **Academic Department Governance**: Manage accredited departments with strict referential integrity safeguards preventing accidental deletion of populated departments.
- **Role-Based Access Control (RBAC) Matrix**: Configure fine-grained privilege flags across system roles with automated protection for Super Admin root permissions.
- **Operational Delegation Governance**: Delegate operational authority to Deans, HODs, Exam Controllers, Finance Managers, and HR Directors.
- **System Audit Trail**: Real-time immutable audit trail logging actor, action, module, IP address, timestamp, and status for all privileged operations.
- **Database Backup & Recovery**: Perform database backup snapshot requests with full audit logging and node status monitoring.
- **Emergency Broadcast Dispatcher**: High-priority campus emergency alerts dispatches targeted by audience (All Users, Students, Faculty, Staff) and priority levels.
- **Global Search**: Debounced instant search across Students, Faculty, Staff, Departments, Courses, and Administrators.
- **AI Anomaly & Security Engine**: Automated security anomaly monitoring (Concurrent Request Surges, Brute Force IP Blocks) with interactive mitigation workflows.

### 🎓 2. Academic & Curriculum Management
- **Curriculum & Syllabus Tracker**: Syllabus progress tracking, lesson plan approval, and course catalog management.
- **Timetable Engine**: Automated semester class scheduling, proxy faculty allocation, and room assignments.
- **Academic Calendar**: Event scheduling, examination dates, institutional holidays, and term deadlines.

### 📝 3. Admissions & Student Directory
- **Pre-Admission Portal**: Application intake, document verification, interview scoring, and merit list generation.
- **Admission Office Workspace**: Student enrollment, seat quota allocation, fee structure assignment, and ID card generation.
- **Student Dossier & Profiles**: Comprehensive student profile tracking, attendance history, academic performance, and parent link.

### 📋 4. Examinations & Evaluation Cell
- **Exam Scheduling & Hall Tickets**: Exam timetable generation, invigilation duty assignment, hall ticket generation, and release workflow.
- **Evaluation & Booklet Management**: Answer booklet allocation, digital evaluation code tracking, internal marks locks, and grade sheet publishing.

### 💰 5. Finance & Payroll Operations
- **Fee Management**: Student fee collection, ledger tracking, installment management, and receipt generation.
- **Staff Payroll & Reports**: Salary structure definition, monthly payroll processing, payslip issuance, and financial audit reports.

### 👥 6. Human Resources & Faculty Workspace
- **Faculty Management**: Faculty onboarding, workload balancing, appraisal records, and research publication tracking.
- **Leave Governance**: Multi-tier faculty & staff leave requests, substitution approvals, and leave balance tracking.

### 📚 7. Learning Management System (LMS) & Campus Facilities
- **LMS Workspace**: Assignment creation, question paper distribution, online student submission tracking, and grading.
- **Library Management**: Book inventory cataloging, issue/return tracking, overdue fine calculation, and digital resource repository.
- **Hostel & Transport**: Hostel room allocation, mess management, outing approvals, bus route scheduling, and vehicle tracking.
- **Placements & Alumni**: Recruiter portal, student resume bank, placement drive scheduling, and alumni analytics.

---

## 🏗️ Technology Architecture

```
edusuite-pro/
├── edusuite-frontend/          # Vite + React 19 + TanStack Start (SSR) App
│   ├── src/
│   │   ├── components/         # Radix UI primitives, Topbar, Sidebar, AI Assistant
│   │   ├── modules/            # Domain Feature Modules (super-admin, dean, etc.)
│   │   ├── routes/             # TanStack File-Based Router Tree
│   │   ├── services/           # Frontend API Clients & State Stores
│   │   └── context/            # RBAC Role Context & Theme Provider
│   ├── package.json
│   └── vite.config.ts
│
├── edusuite-backend/           # Express.js + TypeScript + Prisma BaaS API
│   ├── src/
│   │   ├── modules/            # Express Routers (super-admin, auth, exams, etc.)
│   │   ├── db.ts               # Prisma Client Instance & Database Connection
│   │   ├── seeder.ts           # Database Seeder & Mock Data Provisioner
│   │   └── index.ts            # Server Entry Point (Port 5000)
│   └── package.json
└── README.md
```

### 💻 Frontend Tech Stack
- **Framework**: [React 19](https://react.dev/), [TypeScript 5.8](https://www.typescriptlang.org/)
- **Bundler & Server**: [Vite 8](https://vitejs.dev/), [TanStack Start (SSR)](https://tanstack.com/start), [Nitro](https://nitro.unjs.io/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), Radix UI Primitives, Lucide Icons, Class Variance Authority
- **Data & State**: [TanStack Query](https://tanstack.com/query), Axios, Custom Hooks
- **Data Visualization**: Recharts, Date-fns, Sonner Toasts

### ⚡ Backend Tech Stack
- **Server Environment**: [Node.js](https://nodejs.org/), [Express.js 4](https://expressjs.com/)
- **ORM & Database**: [Prisma ORM 5](https://www.prisma.io/), PostgreSQL / InsForge Postgres BaaS
- **Security & Authentication**: JSON Web Tokens (JWT), Bcryptjs Password Hashing, RBAC Authorization Middleware
- **Dev Server**: `ts-node-dev` with live reload

---

## 🔐 Role-Based Access Control (RBAC) System

EduSuite Pro enforces strict security boundaries across **9 Institutional Roles**:

| Role ID | Display Name | Scope & Authority |
| :--- | :--- | :--- |
| `super_admin` | Super Admin | Root platform control, RBAC matrix, database backups, audit logs |
| `principal` | Principal | Executive institutional oversight, policy enforcement |
| `dean` | Academic Dean | Academic governance, curriculum approvals, timetable oversight |
| `hod` | Head of Department | Departmental faculty supervision, lesson plans, student rosters |
| `faculty` | Faculty Member | Class attendance, LMS assignments, internal marks evaluation |
| `student` | Enrolled Student | LMS access, fee payments, exam hall tickets, hostel/transport |
| `parent` | Parent / Guardian | Student attendance tracking, academic progress, fee receipts |
| `finance` | Finance Officer | Fee collection, payroll disbursement, vendor procurement |
| `hr` | HR Manager | Staff recruitment, leave approvals, appraisal management |

---

## 🛠️ Installation & Setup Instructions

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- PostgreSQL Database or InsForge App Connection

### 1. Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Hanish0717/edusuite-pro.git
cd edusuite-pro

# Install Backend Dependencies
cd edusuite-backend
npm install

# Install Frontend Dependencies
cd ../edusuite-frontend
npm install
```

### 2. Configure Environment Variables

Create `.env` in `edusuite-backend`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/edusuite_db?schema=public"
JWT_SECRET="edusuite-super-secret-jwt-key"
```

Create `.env.local` in `edusuite-frontend`:
```env
VITE_API_BASE_URL="http://localhost:5000"
```

### 3. Initialize Database Schema & Seed Data

```bash
cd edusuite-backend

# Generate Prisma Client
npm run prisma:generate

# Run DB Migrations
npm run prisma:migrate

# Seed Initial System Data
npx ts-node src/seeder.ts
```

---

## 🚀 Running the Application Locally

### Option A: Running Development Mode

**Terminal 1 — Start Backend Server**:
```bash
cd edusuite-backend
npm run dev
# Express API listening on http://localhost:5000
```

**Terminal 2 — Start Frontend Application**:
```bash
cd edusuite-frontend
npm run dev
# Vite application listening on http://localhost:8080
```

### Option B: Building for Production

```bash
# Build Backend
cd edusuite-backend
npm run build

# Build Frontend
cd ../edusuite-frontend
npm run build
```

---

## 📡 API Reference Overview

| HTTP Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/super-admin/stats` | Platform metrics & infrastructure health | Super Admin |
| `GET` | `/api/super-admin/users` | List users with search/role/status filters | Super Admin |
| `POST` | `/api/super-admin/users` | Register a new global user account | Super Admin |
| `PUT` | `/api/super-admin/users/:id` | Update user account details | Super Admin |
| `DELETE` | `/api/super-admin/users/:id` | Delete a user account | Super Admin |
| `GET` | `/api/super-admin/departments` | Fetch active departments | Super Admin |
| `POST` | `/api/super-admin/departments` | Create academic department | Super Admin |
| `DELETE` | `/api/super-admin/departments/:id` | Delete department (with referential check) | Super Admin |
| `GET` | `/api/super-admin/global-search` | Multi-entity global search | Super Admin |
| `GET` | `/api/super-admin/academic-retention` | Retention & dropout risk analytics | Super Admin |
| `GET` | `/api/super-admin/anomalies` | Security anomaly telemetry alerts | Super Admin |
| `POST` | `/api/super-admin/anomalies/:id/mitigate` | Apply security mitigation rule | Super Admin |
| `POST` | `/api/super-admin/broadcast` | Dispatch emergency broadcast notice | Super Admin |
| `POST` | `/api/super-admin/backups/create` | Trigger database snapshot backup | Super Admin |
| `GET` | `/api/super-admin/users/export` | Download CSV user roster export | Super Admin |

---

## 📄 License & Attribution

&copy; 2026 EduSuite Pro Systems. All rights reserved.  
Built for modern multi-campus higher education institutions.
