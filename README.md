# LinkSprint — URL Shortener System

🔗 **Live Demo:** [https://linksprint-landing.onrender.com/](https://linksprint-landing.onrender.com/)

## Project Overview
LinkSprint is a full-stack URL shortening platform that allows users to convert long URLs into short, easy-to-share links. It provides per-link and account-level analytics, URL safety scanning, link preview pages, and an administrative dashboard for platform-wide monitoring. The app is live and deployed on Render.

## Problem It Solves
Long URLs are difficult to share, remember, and manage, especially on social media platforms, messaging applications, and printed media. Existing URL shortening services often provide more complexity than required for basic use cases. There is a need for a simple, reliable, and easy-to-use URL shortening solution with meaningful analytics and safety checks built in.

## Target Users (Personas)
- **Regular User**:  
  Individuals who want to shorten URLs, manage their links, and view analytics such as click counts, unique visitors, and time-based trends.

- **Administrator**:  
  A system supervisor who monitors overall platform usage, manages user accounts, and views system-wide link and click statistics.

## Vision Statement
To provide a simple, efficient, and user-friendly URL shortening platform that ensures reliable redirection, actionable analytics, and safety-aware link previews for users and administrators.

## Key Features
- Convert long URLs into unique shortened URLs
- Redirect users reliably to the original URL
- URL safety scanning with risk level and risk score per link
- Link preview page with page title, description, favicon, and preview image
- User authentication (JWT) with role-based routing (user vs admin)
- Personalized dashboards with link management (activate / deactivate / delete)
- Per-link and account-level analytics (click count, unique visitors, clicks over time, device & browser breakdown)
- CSV export of analytics data
- Administrative dashboard for platform-wide user and link monitoring
- Dark mode support
- Loading states throughout the UI for a smooth experience on cold starts

---

## Technical Stack

### Backend
- Python 3.10
- FastAPI
- PostgreSQL (via SQLAlchemy + psycopg2)
- JWT Authentication

### Frontend
- React + Vite
- JavaScript
- HTML5
- Tailwind CSS

### DevOps & Tooling
- Docker & Docker Compose
- Git & GitHub
- GitHub Actions (CI/CD)
- Render (backend + frontend deployment)
- VS Code
- WSL (Linux development environment)

## Success Metrics
- All shortened URLs redirect correctly to their original destinations  
- Average redirection response time remains minimal  
- Users can successfully view analytics for their links  
- Core user stories are implemented and validated  
- The project is completed within the planned timeline  

## Assumptions & Constraints  
- Advanced security mechanisms and large-scale optimization are out of scope  
- The system uses open-source technologies and tools  
- Development is performed by a single developer  
- Free-tier Render services may have cold start delays (~30–60s on first request after inactivity)

---

## 📂 Project Structure

```bash
URL-SHORTENER-SYSTEM/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── db/
│   │   ├── dependencies/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── requirements-dev.txt
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   └── design/
│       ├── diagrams/
│       └── wireframes/
├── tests/
│   ├── conftest.py
│   ├── test_integration_flows.py
│   └── test_regression_flows.py
├── reports/
│   └── mutatest-*.rst
├── pytest.ini
├── mutatest.ini
├── .gitignore
├── docker-compose.yml
├── LICENSE
└── README.md
```
---

## 📐 Software Design

### High Level Architecture Diagram:
![System Architecture](docs/design/diagrams/high_level_arch.png)

This system follows a Client–Server architecture with a layered monolithic backend to ensure clear separation of concerns and strong maintainability. Business logic, routing, and data access are decoupled to minimize coupling, simplify testing, and allow isolated modifications without affecting unrelated components. Stateless JWT authentication and modular service design enable horizontal scalability and smooth evolution toward microservices if required. The structured layering also improves readability, debugging efficiency, and long-term extensibility as new features or integrations are introduced.

### Frontend React Components Interaction Diagram:
![Frontend Component Diagram](docs/design/diagrams/frontend_components.png)

The frontend is structured using a modular, layered component architecture in React. Pages handle routing and compose reusable layout and UI components, while feature-specific components (e.g., URLForm, ResultCard) encapsulate core functionality. Shared structures like DashboardLayout, Navbar, and Footer reduce duplication and maintain visual consistency.

This design improves maintainability by isolating responsibilities within well-defined components, making changes localized and predictable. New features can be added by extending existing modules rather than restructuring the system. The clear separation between layout, UI, and feature logic ensures the application remains scalable and easy to refactor over time.

---
## 🖥️ App Flow

### Public Section

#### Landing Page

- Paste a long URL in the input field and click **"Shorten"** to generate a short link instantly.
- Click **"Login"** in the navigation bar to go to the Login page.
- Click **"Register"** to go to the Sign Up page.

### Authentication Section

#### Sign Up Page

- Enter email, password, and confirm password.
- Click **"Sign Up"** to create your account.
- On success, you are redirected to the **Login** page.
- Click **"Login"** below the form to navigate to the Login page.

#### Login Page

- Enter email and password and click **"Login"**.
- A loading spinner is shown while authenticating.

**Role-Based Routing:**

- Standard user login → Redirects to **User Dashboard**
- Admin login → Redirects to **Admin Panel**

### User Section

#### User Dashboard

After login, the user lands on the Dashboard.

##### i) Metrics Section

Displays live stats:

- Total Links
- Total Clicks
- Active Links
- Top Link Clicks

##### ii) Create New Short Link

- Enter a destination URL.
- Click **"Create Short Link"** to generate a new short link.
- The newly created link appears in the links table below, along with its risk level and preview metadata.

##### iii) Your Links Table

- Click **All / Active / Inactive** tabs to filter links.
- Click the copy icon beside a short URL to copy it to clipboard.
- Activate or deactivate a link using the toggle in the action menu.
- Delete a link from the action menu.
- Use pagination buttons (**Previous / Next**) to navigate between pages.
- Toggle **Dark Mode** in the sidebar.
- Click **Sign Out** to log out and return to the Landing page.

### Analytics Section

#### Analytics Dashboard

Accessible from sidebar navigation.

##### i) Top Metrics

Displays real-time stats:

- Total Clicks
- Unique Visitors
- Avg. Clicks per Day
- Last Accessed Link

##### ii) Clicks Over Time

- Use the filter toggle (**7d / 30d / 90d**) to change the time range for the bar chart.

##### iii) Top Performing Links

- Displays a ranked list of your highest-performing links by click count.

##### iv) Device & Browser Breakdown

- Donut chart showing device distribution across your link clicks.
- Horizontal list for browser usage breakdown.

##### v) Recent Activity

- Live activity log of recent clicks across your links.

##### vi) CSV Export

- Export your full analytics data as a CSV file.

### Admin Section

#### Admin Panel

Accessible only through admin login.

##### i) Platform Metrics

Displays:

- Total Users
- Total Links
- Total Clicks
- Suspended Accounts

##### ii) User Management Table

Includes:

- Email
- Links count
- Clicks count
- Joined Date
- Status (Active / Suspended)
- Actions

Admins can:

- Use the search bar to filter users by email.
- Click the status pill to activate or suspend a user account.
- Switch between **Users** and **Recent Links** tabs.
- Navigate using pagination controls.

---

## Wireframe Images

These wireframes represent the structural layout and interaction flow of the system.  
They illustrate navigation flow, hierarchy, and component placement, but **do not represent the final visual UI design**.

### Landing:
![Landing 1](docs/design/wireframes/landing-1.png)
![Landing 2](docs/design/wireframes/landing-2.png)
![Landing 3](docs/design/wireframes/landing-3.png)

### Sign Up:
![Sign Up](docs/design/wireframes/signup.png)

### Login:
![Login](docs/design/wireframes/login.png)

### User Dashboard:
![Dashboard 1](docs/design/wireframes/dashboard-1.png)
![Dashboard 2](docs/design/wireframes/dashboard-2.png)

### User Analytics:
![Analytics 1](docs/design/wireframes/analytics-1.png)
![Analytics 2](docs/design/wireframes/analytics-2.png)
![Analytics 3](docs/design/wireframes/analytics-3.png)

### Admin Dashboard:
![Admin 1](docs/design/wireframes/admin-1.png)
![Admin 2](docs/design/wireframes/admin-2.png)


---

## 🔧 Branching Strategy

This project follows **GitHub Flow**.

### Main Branch
- **main** – Stable, production-ready code
- All changes are merged via **Pull Requests**

### Feature Branches
Each feature or task is developed in a separate branch.

#### Naming Convention
- `feature/<short-description>`

####  Example Workflow
```bash
git checkout -b feature/docker-backend
git add .
git commit -m "Dockerized FastAPI backend"
git push origin feature/docker-backend
```
---

## 🚀 Quick Start – Local Development

### Option 1: Using Docker 🐳

#### Prerequisites
- Docker Desktop
- Git

#### Steps
```bash
git clone https://github.com/Sakshee21/URL-Shortener-System.git
cd URL-Shortener-System
docker compose up --build
```
#### Access the Application
- Application URL: http://localhost:8000


### Option 2: Local Development (Virtual Environment)

#### Prerequisites
- Python 3.10+
- PostgreSQL 14+
- Git

#### Steps

```bash
git clone https://github.com/Sakshee21/URL-Shortener-System.git
cd URL-Shortener-System/backend
```

#### Set up PostgreSQL

```bash
# Create database and user
sudo -u postgres psql
```
```sql
CREATE DATABASE url_shortener;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE url_shortener TO myuser;
\q
```

#### Create a `.env` file in the `backend/` directory

```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/url_shortener
SECRET_KEY=your-secret-key
BASE_URL=http://127.0.0.1:8000
FRONTEND_BASE_URL=http://localhost:5173
```

#### Create and Activate Virtual Environment
```bash
python3 -m venv venv
```
**Activate venv:**

**Linux / macOS / WSL**
```bash
source venv/bin/activate
```
**Windows (PowerShell)**
```bash
venv\Scripts\activate
```
#### Install Dependencies
```bash
pip install -r requirements.txt
```
#### Run the Application
```bash
uvicorn app.main:app --reload
```
#### Access the Application
- Backend API: http://localhost:8000
- Frontend (run separately): http://localhost:5173

---

## 🐳 Docker Commands Reference

```bash
docker compose up --build     # Build and start containers
docker compose up -d          # Run in detached mode
docker compose down           # Stop containers
docker compose logs -f        # View container logs
```

---

## 🛠️ Local Development Tools

| Tool           | Purpose                       |
|----------------|-------------------------------|
| Python 3.10    | Backend runtime               |
| FastAPI        | Web framework                 |
| PostgreSQL     | Production database           |
| React + Vite   | Frontend UI                   |
| Tailwind CSS   | Styling                       |
| Docker         | Containerization              |
| Git            | Version control               |
| GitHub Actions | CI/CD automation              |
| Render         | Cloud deployment              |
| VS Code        | Code editor                   |
| WSL            | Linux development environment |

---

## 👩‍💻 Contributor

 **Sakshee Ujjwal Kumat**

---

## 📄 License

This project is licensed under the **MIT License**.
