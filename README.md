# CarbonTrust Registry

A role-based carbon registry platform for managing NGO projects, Monitoring, Reporting and Verification (MRV) submissions, verifier reviews, carbon-credit records, and retirement history.

CarbonTrust Registry combines a React frontend, Spring Boot backend, and MySQL database to support secure account management, project registration, evidence submission, verification workflows, and carbon registry operations.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Security](#security)
- [Current Scope and Limitations](#current-scope-and-limitations)
- [Documentation](#documentation)

## Overview

CarbonTrust Registry is designed to organize the lifecycle of carbon-related projects through a centralized digital platform.

The system connects NGOs, administrators, and verifiers through a structured workflow:

1. Users register and verify their email addresses.
2. Administrators manage user accounts and assign roles.
3. NGOs register and manage their projects.
4. NGOs submit MRV documentation and supporting evidence.
5. Administrators assign submissions to verifiers.
6. Verifiers review submissions and record their decisions.
7. Administrators can issue carbon-credit quantities for verified projects.
8. Users can explore registry information and view their purchase and retirement history.

The platform maintains submission and verification history to support accountability and data traceability.

## Key Features

### Authentication and Account Management

- Email and password registration.
- Email verification.
- Secure login and logout.
- Password recovery and reset.
- Role-based access control.
- Admin-managed user accounts.
- Account approval, suspension, and reactivation.
- Audit records for important account changes.

### NGO Project Management

- Register and manage NGO projects.
- View project information and status.
- Submit MRV documentation.
- Upload supporting evidence.
- Access project verification history.
- Enforce project ownership permissions.

### MRV Verification System

- Upload PDF, JPEG, and PNG evidence files.
- Private evidence storage.
- File type and signature validation.
- Admin-controlled verifier assignment.
- Verifier approval and rejection workflows.
- Mandatory reviewer comments.
- Verification history and submission records.

### Carbon Registry

- View registered projects.
- View issued carbon-credit batches.
- Support administrator-managed credit issuance for verified projects.
- Browse marketplace registry information.
- View purchase and retirement history.
- Retire eligible credits based on ownership and available balance.

### Administration Dashboard

- Manage registered users.
- Assign and update user roles.
- Monitor project information.
- Assign MRV submissions to verifiers.
- Review registry activity.
- Manage eligible credit issuance.

## User Roles

| Role | Responsibilities |
|---|---|
| Admin | Manage accounts, assign verifiers, monitor registry operations, and issue credits. |
| NGO | Register projects, upload MRV evidence, and track verification status. |
| Verifier | Review assigned submissions and approve or reject them with comments. |
| User | Browse registry information and access personal purchase and retirement history. |
| Healthcare Assistant | Account role is supported; healthcare-specific workflows are not yet implemented. |

All important permissions are enforced by the backend rather than relying only on frontend visibility.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| UI and Styling | Tailwind CSS 4, Lucide React, Framer Motion |
| Routing | React Router |
| Charts | Recharts |
| Backend | Java 17, Spring Boot 4.1 |
| API | Spring Web MVC |
| Database | MySQL 8 |
| ORM | Spring Data JPA, Hibernate |
| Security | Spring Security, BCrypt, CSRF protection |
| Database Migration | Flyway |
| Email Services | Spring Mail, SMTP |
| Deployment | Docker, Docker Compose, Nginx |

## Project Architecture

The application follows a frontend-backend architecture.

```text
             CarbonTrust Registry
                      |
          +-----------+-----------+
          |                       |
     React Frontend          REST API
       (Vite)                     |
                           Spring Boot Backend
                                  |
              +-------------------+------------------+
              |                   |                  |
        Authentication       Project Module       MRV Module
              |                   |                  |
              +-------------------+------------------+
                                  |
                              MySQL 8
                                  |
                       Persistent Registry Data
```

## Project Structure

```text
carbontrust-registry/
│
├── backend/
│   ├── src/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── mobile/
│
├── deploy/
│
├── docs/
│
├── docker-compose.yml
├── docker-compose.local.yml
├── render.yaml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

Install the following tools before running the application:

- Java JDK 17
- Node.js and npm
- MySQL 8
- Git
- Docker and Docker Compose (for containerized setup)

### Clone the Repository

```bash
git clone https://github.com/Sandeeptumu/carbontrust-registry.git

cd carbontrust-registry
```

### Configure Environment Variables

Create a local environment configuration file:

```bash
cp .env.example .env
```

Configure the following:

- Database credentials
- SMTP host and credentials
- Application URL
- Cookie security settings

Never commit `.env` or expose production credentials in the repository.

## Running the Project

### Option 1: Docker Compose

After configuring `.env`, run:

```bash
docker compose up --build -d
```

The application uses separate migration and runtime services.

The frontend is published on localhost port 3000.

Open:

```text
http://localhost:3000
```

For local email testing, refer to the local Docker configuration in the deployment documentation.

### Option 2: Manual Development Setup

Start MySQL and configure the backend environment variables.

Run the backend from the repository root:

```bash
./backend/mvnw -f backend/pom.xml spring-boot:run
```

The backend is configured for:

```text
http://localhost:8080
```

Open another terminal and start the frontend:

```bash
cd frontend

npm ci

npm run dev
```

Open the development URL printed by Vite, typically:

```text
http://localhost:5173
```

The Vite development server proxies API requests to the backend.

## Testing

### Backend Testing

```bash
JAVA_HOME=/path/to/jdk17 ./backend/mvnw -f backend/pom.xml clean verify
```

### Frontend Testing

```bash
cd frontend

npm ci

npm test

npm run lint

npm run typecheck

npm run build
```

The repository's verification documentation records automated tests for authentication, account management, MRV evidence handling, review workflows, and credit retirement.

## Security

Security is an important part of CarbonTrust Registry.

The application includes:

- BCrypt password hashing.
- Database-backed and revocable sessions.
- HttpOnly authentication cookies.
- CSRF protection for state-changing requests.
- Persistent authentication rate limiting.
- Backend role and ownership validation.
- Private MRV evidence storage.
- Single-use and time-limited verification and reset links.
- Audit records for important account operations.

Production deployment requires HTTPS, secure cookie configuration, trusted proxy settings, SMTP configuration, restricted database permissions, and backup validation.

## Current Scope and Limitations

Some features require additional business specifications before they can be implemented safely.

- **Payment Processing:** Payment checkout is currently unavailable pending payment-provider integration, pricing, settlement, and refund specifications.
- **Healthcare Workflows:** Healthcare-specific operations require approved requirements for consent, access, and data retention.
- **Carbon Quantification:** Credit quantities can be issued by administrators for verified projects, but scientific carbon quantification requires a defined methodology.
- **MRV Amendments:** Submission correction and replacement workflows require a documented versioning policy.
- **Native Mobile:** Native-device cookie persistence and MRV file operations still require device-level verification.

The application avoids displaying simulated payment success or inventing unsupported business workflows.

## Documentation

For additional technical information:

- [Deployment and First Admin Setup](docs/07_DEPLOYMENT.md)
- [Requirements and Verification](docs/08_REQUIREMENTS_AND_VERIFICATION.md)
- [API Contract](docs/05_API_CONTRACT.md)
- [Mobile Project Documentation](mobile/README.md)

## Contributing

Contributions and improvements are welcome.

1. Create a branch for your changes.
2. Follow the existing project structure.
3. Test your changes before submitting.
4. Submit a pull request with a clear explanation of the implementation.

Do not commit passwords, API keys, SMTP credentials, or private evidence files.

## License

No license is currently specified for this repository. Contact the repository owner before reusing or distributing the project.
