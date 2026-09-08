# 📱 CarbonTrust Registry — Mobile App

React Native + Expo mobile frontend for the **existing** CarbonTrust Registry Spring Boot backend.
No separate backend, no separate database — the app consumes the same REST APIs and JWT
authentication as the web frontend.

```
Mobile App (React Native + Expo)
        ↓
Existing Spring Boot REST API  (http://localhost:8080)
        ↓
Existing MySQL Database
```

---

## 🚀 Getting Started

```bash
cd mobile
npm install

# with the backend running (backend/ ./mvnw spring-boot:run)
npx expo start
```

- Press `a` for Android emulator, `i` for iOS simulator, or scan the QR with **Expo Go**.
- Backend URL is centralized in `src/constants/config.js`:
  - Android emulator → `http://10.0.2.2:8080` (handled automatically)
  - iOS simulator / web → `http://localhost:8080`
  - Physical phone → set your machine's LAN IP in `config.js` (`DEV_PHYSICAL_DEVICE`)

---

## 👥 Roles & Navigation

The app detects the role returned by `/users/login` and renders a role-specific shell.
Nothing is hard-coded client-side; protected areas rely on the backend's role checks
(`/projects/**` → NGO, `/verifier/**` → VERIFIER, `/buyer/**` → BUYER, `/admin/**` → ADMIN).

| Role | Tabs | Highlights |
|---|---|---|
| BUYER | Home · Marketplace · Health · Alerts · Profile | Portfolio hero, purchase flow, retirement |
| USER | Home · Market · Health · Alerts · Profile | Read-mostly snapshot, personal health |
| NGO | Home · Projects · Health · Alerts · Profile | 5-step project wizard, MRV submit, issue credits |
| VERIFIER | Home · Health · Alerts · Profile | Verification queue, approve/reject review |
| ADMIN | Control · Users · Credits · Alerts · Profile | Stats, directory, ledger, batches |
| HEALTHCARE_ADVISOR | Home · Health · Alerts · Profile | Environmental-health desk (privacy-first) |

> Registration always creates BUYER accounts — matching `UserService.registerUser()`.
> NGO / VERIFIER / ADMIN accounts are seeded server-side (see `frontend/README.md` for demo seeds).

---

## 🔌 API Endpoints Used (all existing)

- `POST /users/register` · `POST /users/login` · `GET /users/me`
- `GET/POST/PUT/DELETE /projects` (+ `/projects/{id}`)
- `POST/GET /projects/{id}/mrv`
- `GET /verifier/mrv` · `GET /verifier/verifications` · `POST /verifier/mrv/{id}/verify`
- `POST/GET /projects/{id}/carbon-credits`
- `GET /marketplace/credits`
- `POST /buyer/carbon-credits/{ccbId}/purchase` · `GET /buyer/purchases`
- `POST /buyer/purchases/{id}/retire` · `GET /buyer/retirements`
- `GET /admin/stats|users|projects|credits|purchases|retirements`

All requests attach `Authorization: Bearer <token>` automatically (`src/services/api.js`).

---

## 🔐 Security

- JWT stored with **expo-secure-store** (iOS Keychain / Android Keystore); web demo uses localStorage.
- Session bootstrap validates the stored token against `/users/me` on startup.
- Any 401 response clears the session globally and returns the user to sign-in.
- No sensitive values are logged.

---

## 📁 Structure

```
mobile/
├── App.js                    # providers + auth gate + navigation theme
├── src/
│   ├── constants/            # config.js (API base/URLs) · theme.js (design system)
│   ├── services/             # api.js · authService · registryService · healthService · notificationService
│   ├── context/              # AuthContext (JWT session)
│   ├── hooks/                # useNotifications
│   ├── components/           # ui/ · animated/ · registry/ · layout/
│   └── screens/
│       ├── auth/             # Splash · Login · Register
│       ├── buyer/            # Dashboard · Marketplace · Purchase · Credits · Retire · Retirements
│       ├── ngo/              # Dashboard · Projects · Wizard · ProjectDetail · MRV · Issue credits
│       ├── verifier/         # Dashboard · Review (approve/reject)
│       ├── admin/            # Dashboard · Users · Credits · Ledger
│       ├── advisor/          # Dashboard
│       ├── user/             # Dashboard
│       ├── health/           # Personal (on-device) · Environmental
│       ├── notifications/    # Notification center
│       └── profile/          # Profile + logout
```

---

## 🧪 Notes on Health Modules

The current backend does not expose Personal/Environmental Health REST endpoints.
Per project rules, **no backend behavior was invented**:

- **Personal Health** is stored **on-device only** (AsyncStorage) with explicit privacy messaging.
- **Environmental Health** shows clearly-labeled placeholder readings; wire a real endpoint in
  `src/services/healthService.js` when available — UI code stays unchanged.

---

## ✨ Design & Motion

Deep-forest/emerald/lime palette on off-white surfaces; restrained gradients.
Animations: particle splash, staggered card entrances, animated counters, progress rings/bars,
skeleton shimmer, success checkmarks, bottom-tab indicator dot, button press springs, pull-to-refresh.
