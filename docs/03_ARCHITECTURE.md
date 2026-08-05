# 🏗️ System Architecture

## Overview

CarbonTrust Registry follows a three-tier architecture consisting of the Presentation Layer, Business Logic Layer, and Data Layer. This architecture ensures modularity, scalability, and maintainability.

The application enables NGOs to register Blue Carbon projects, upload MRV evidence, undergo project verification, receive carbon credit batches, and allow buyers to purchase verified carbon credits through a centralized platform.

---

# Architecture Overview

```
+----------------------+
|   React Frontend     |
| (User Interface)     |
+----------+-----------+
           |
           | REST APIs
           |
+----------v-----------+
|  Spring Boot Backend |
| (Business Logic)     |
+----------+-----------+
           |
           |
+----------v-----------+
|     MySQL Database   |
|   (Persistent Data)  |
+----------------------+
```

---

# System Modules

## 1. Authentication Module

Responsibilities:

- User Registration
- User Login
- Role-Based Authentication
- User Authorization

Supported Roles:

- NGO
- Verifier
- Buyer
- Administrator

---

## 2. Project Management Module

Responsibilities:

- Register Project
- View Projects
- Delete Project
- View Carbon Credit Status

Used By:

- NGO

---

## 3. MRV Management Module

Responsibilities:

- Upload MRV Evidence
- Store Uploaded Data
- Track Submission Status

Used By:

- NGO

---

## 4. Verification Module

Responsibilities:

- View Assigned MRV
- Review Submitted Evidence
- Approve MRV
- Reject MRV
- Add Verification Comments

Used By:

- Verifier

---

## 5. Carbon Credit Module

Responsibilities:

- Generate Carbon Credit Batch
- Store Carbon Credit Information
- Manage Available Credits

Used By:

- Administrator

---

## 6. Marketplace Module

Responsibilities:

- Browse Carbon Credits
- Purchase Carbon Credits
- View Purchase History

Used By:

- Buyer

---

## 7. Administration Module

Responsibilities:

- Manage Users
- Manage Projects
- Monitor Verification
- Manage Carbon Credit Issuance
- View System Dashboard

Used By:

- Administrator

---

# System Workflow

```
NGO
    │
    ▼
Register Account
    │
    ▼
Login
    │
    ▼
Register Project
    │
    ▼
Upload MRV
    │
    ▼
Verification
    │
    ▼
Approved
    │
    ▼
Carbon Credit Batch Created
    │
    ▼
Marketplace
    │
    ▼
Buyer Purchases Credits
```

---

# Technology Stack

## Frontend

- React
- HTML
- CSS
- JavaScript

## Backend

- Java
- Spring Boot
- Spring Data JPA
- Spring Security

## Database

- MySQL

## Development Tools

- IntelliJ IDEA
- VS Code
- Git
- GitHub
- Postman

---

# Design Principles

The CarbonTrust Registry is designed using the following principles:

- Modular Architecture
- Layered Design
- Role-Based Access Control
- Scalability
- Maintainability
- Secure Authentication
- Separation of Concerns

---

# Conclusion

The architecture provides a scalable and maintainable foundation for the CarbonTrust Registry platform. By separating the frontend, backend, and database into independent layers, the system becomes easier to develop, test, and extend in the future.