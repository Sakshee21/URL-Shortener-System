# URL Shortener System

## Project Overview
This URL Shortener System is a lightweight web-based application that allows users to convert long URLs into short, easy-to-share links. The system also provides basic analytics for users to track how often their shortened URLs are accessed. An administrative view is also included to monitor overall system usage.

## Problem It Solves
Long URLs are difficult to share, remember, and manage, especially on social media platforms, messaging applications, and printed media. Existing URL shortening services often provide more complexity than required for basic use cases. There is a need for a simple, reliable, and easy-to-use URL shortening solution with minimal analytics.

## Target Users (Personas)
- **Regular User**:  
  Individuals who want to shorten URLs and view analytics related to their own links, such as the number of times a link is accessed.

- **Administrator**:  
  A system supervisor who monitors overall usage, system activity, and link statistics across all users.

## Vision Statement
To provide a simple, efficient, and user-friendly URL shortening platform that ensures reliable redirection and basic analytics for users and administrators.

## Key Features
- Convert long URLs into unique shortened URLs  
- Redirect users reliably to the original URL  
- User authentication and personalized dashboards  
- Analytics for shortened URLs (click count, creation date)  
- Administrative dashboard for overall system analytics  
- Clean and intuitive user interface  

## Technical Stack

### Backend
- Python 3.10
- FastAPI
- Jinja2 (for server-side templates)
- SQLite

### Frontend
- HTML
- CSS
- JavaScript

### DevOps & Tooling
- Docker & Docker Compose
- Git & GitHub
- VS Code
- WSL (Linux development environment)

## Success Metrics
- All shortened URLs redirect correctly to their original destinations  
- Average redirection response time remains minimal  
- Users can successfully view analytics for their links  
- Core user stories are implemented and validated  
- The project is completed within the planned timeline  

## Assumptions & Constraints  
- Deployment is limited to local or controlled environments  
- Advanced security mechanisms and large-scale optimization are out of scope  
- The system uses open-source technologies and tools  
- Development is performed by a single developer  

## 📂 Project Structure

```bash
URL-Shortener-System/
├── backend/
│   ├── app/
│   │   ├── templates/
│   │   ├── static/
│   │   └── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 📐 Software Design

### Architecture Diagrams

### High Level Architecture Diagram
![System Architecture](docs/design/diagrams/high_level_arch.png)

This system follows a Client–Server architecture with a layered monolithic backend to ensure clear separation of concerns and strong maintainability. Business logic, routing, and data access are decoupled to minimize coupling, simplify testing, and allow isolated modifications without affecting unrelated components. Stateless JWT authentication and modular service design enable horizontal scalability and smooth evolution toward microservices if required. The structured layering also improves readability, debugging efficiency, and long-term extensibility as new features or integrations are introduced.

### Frontend React Components Interaction Diagram
![Frontend Component Diagram](docs/design/diagrams/frontend_components.png)

The frontend is structured using a modular, layered component architecture in React. Pages handle routing and compose reusable layout and UI components, while feature-specific components (e.g., URLForm, ResultCard) encapsulate core functionality. Shared structures like DashboardLayout, Navbar, and Footer reduce duplication and maintain visual consistency.

This design improves maintainability by isolating responsibilities within well-defined components, making changes localized and predictable. New features can be added by extending existing modules rather than restructuring the system. The clear separation between layout, UI, and feature logic ensures the application remains scalable and easy to refactor over time.

## 🖼 Wireframes

### Landing
![Landing 1](docs/design/wireframes/landing-1.png)
![Landing 2](docs/design/wireframes/landing-2.png)
![Landing 3](docs/design/wireframes/landing-3.png)

### Sign Up
![Sign Up](docs/design/wireframes/signup.png)

### Login
![Login](docs/design/wireframes/login.png)

### User Dashboard
![Dashboard 1](docs/design/wireframes/dashboard-1.png)
![Dashboard 2](docs/design/wireframes/dashboard-2.png)

### User Analytics
![Analytics 1](docs/design/wireframes/analytics-1.png)
![Analytics 2](docs/design/wireframes/analytics-2.png)
![Analytics 3](docs/design/wireframes/analytics-3.png)

### Admin Dashboard
![Admin 1](docs/design/wireframes/admin-1.png)
![Admin 2](docs/design/wireframes/admin-2.png)

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
- Git

#### Steps

```bash
git clone https://github.com/Sakshee21/URL-Shortener-System.git
cd URL-Shortener-System/backend
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
- Application URL: http://localhost:8000

## 🐳 Docker Commands Reference

```bash
docker compose up --build     # Build and start containers
docker compose up -d          # Run in detached mode
docker compose down           # Stop containers
docker compose logs -f        # View container logs
```
## 🛠️ Local Development Tools

| Tool        | Purpose                       |
|-------------|-------------------------------|
| Python 3.10 | Backend runtime               |
| FastAPI     | Web framework                 |
| Jinja2      | Template rendering            |
| Docker      | Containerization              |
| Git         | Version control               |
| VS Code     | Code editor                   |
| WSL         | Linux development environment |

## 👩‍💻 Contributor

 **Sakshee Ujjwal Kumat**

## 📄 License

This project is licensed under the **MIT License**.
