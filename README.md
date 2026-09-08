# 🌱 CarbonTrust Registry

An AI-powered Carbon Credit Registry for Blue Carbon Ecosystems built using Spring Boot, React, and MySQL — with a React Native (Expo) mobile app that reuses the same backend and authentication.

---

## 📖 About the Project

CarbonTrust Registry is a web application designed to improve trust and transparency in carbon credit issuance for Blue Carbon ecosystems such as mangroves, seagrass, and salt marshes.

The system provides an end-to-end workflow where NGOs can register restoration projects, upload MRV (Measurement, Reporting and Verification) evidence, undergo verification, receive carbon credits, and allow buyers to purchase verified carbon credits through a secure marketplace.

---

## 🎯 Project Objectives

- Improve trust in Blue Carbon projects
- Digitalize the MRV process
- Provide transparent verification
- Generate carbon credits after successful verification
- Build a marketplace for verified carbon credits

---

## 👥 User Roles

- NGO
- Verifier
- Buyer
- Administrator

---


## ✨ Key Features

- User Authentication & Role Management
- NGO Project Registration
- MRV (Measurement, Reporting and Verification) Upload
- Multi-Verifier Approval Workflow
- Carbon Credit Batch Generation
- Carbon Credit Marketplace
- Buyer Purchase Management
- Admin Dashboard

---

## 🛠 Tech Stack

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- MySQL

### Frontend
- React
- HTML
- CSS
- JavaScript

### Tools
- Git
- GitHub
- Postman
- IntelliJ IDEA
- VS Code

---

## 📂 Project Structure

```
carbontrust-registry/

backend/
frontend/
mobile/     ← React Native + Expo mobile app (reuses this backend)
docs/

README.md
```

---

## 🚀 Getting Started

### Backend (Spring Boot + MySQL)

1. Create a MySQL database named `carbontrust`.
2. Adjust credentials in `backend/src/main/resources/application.yaml` if needed.
3. Run the app: `cd backend && ./mvnw spring-boot:run` (serves on `http://localhost:8080`).

### Frontend (React + Vite)

1. `cd frontend && npm install`
2. `npm run dev` (serves on `http://localhost:5173` and proxies API calls to the backend).
3. Open http://localhost:5173 — new sign-ups get the **BUYER** role; see `frontend/README.md`
   for how to seed NGO / Verifier / Admin demo accounts.

### Mobile App (React Native + Expo)

1. `cd mobile && npm install`
2. With the backend running, start Expo: `npx expo start` and press `a` (Android emulator),
   `i` (iOS simulator) or scan the QR with Expo Go.
3. The app reuses the existing REST API + JWT auth — no separate backend or database.
   API/base-URL config lives in `mobile/src/constants/config.js`.
4. See `mobile/README.md` for the full guide (roles, screens, endpoints, security).

---

## 📚 Documentation

- Project Context
- Requirements
- Architecture
- Database Design
- API Design
- Frontend Guide (`frontend/README.md`)

---

## 🚀 Current Progress

- [x] Business Analysis
- [x] Requirement Analysis
- [x] Architecture Design
- [x] Database Design
- [x] API Design
- [x] Backend Development
- [x] Frontend Development
- [x] Mobile Application (Expo)
- [ ] Testing
- [ ] Deployment

---

## 🚀 Future Enhancements

- AI-assisted MRV analysis
- Blockchain integration for immutable carbon credits
- Interactive analytics dashboard
- Real-time notifications
- Mobile application support

## 👨‍💻 Developed By

Sandeep
