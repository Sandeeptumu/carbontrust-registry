# 🗄️ Database Design

## Overview

The CarbonTrust Registry database is designed to manage the complete lifecycle of Blue Carbon projects, from project registration to carbon credit purchase.

The database stores information about users, projects, MRV submissions, verification records, carbon credit batches, and buyer purchases.

---

# Database Tables

## 1. USER

| Column | Description |
|---------|-------------|
| user_id (PK) | Unique user identifier |
| full_name | User's full name |
| email | User email |
| phone_number | Contact number |
| password | Encrypted password |
| role | NGO / Buyer / Verifier / Admin |
| status | Active / Inactive |
| created_at | Registration date |

---

## 2. PROJECT

| Column | Description |
|---------|-------------|
| project_id (PK) | Unique project ID |
| user_id (FK) | NGO who owns the project |
| project_name | Name of project |
| description | Project description |
| ecosystem_type | Mangrove / Seagrass / Salt Marsh |
| location | Project location |
| area | Restoration area |
| start_date | Project start date |
| project_status | Current project status |
| created_at | Project creation date |
| updated_at | Last update |

---

## 3. MRV_SUBMISSION

| Column | Description |
|---------|-------------|
| mrv_id (PK) | Unique MRV ID |
| project_id (FK) | Related project |
| upload_date | Date of upload |
| mrv_status | Pending / Approved / Rejected |
| photo_verification | Evidence verification status |
| remarks | Additional remarks |

---

## 4. VERIFICATION

| Column | Description |
|---------|-------------|
| verification_id (PK) | Verification ID |
| mrv_id (FK) | Related MRV submission |
| verifier_id (FK) | Assigned verifier |
| verification_status | Approved / Rejected |
| comments | Verifier comments |
| verification_date | Verification completion date |

---

## 5. CARBON_CREDIT_BATCH

| Column | Description |
|---------|-------------|
| ccb_id (PK) | Carbon Credit Batch ID |
| project_id (FK) | Related project |
| original_quantity | Credits issued |
| available_quantity | Remaining credits |
| status | Active / Sold Out |
| issued_date | Credit issue date |

---

## 6. PURCHASE

| Column | Description |
|---------|-------------|
| purchase_id (PK) | Purchase ID |
| buyer_id (FK) | Buyer |
| ccb_id (FK) | Purchased credit batch |
| quantity | Credits purchased |
| price | Purchase price |
| payment_status | Payment status |
| payment_method | Payment method |
| purchase_date | Purchase date |

---

# Entity Relationships

- One User (NGO) can own many Projects.
- One Project can have many MRV Submissions.
- One MRV Submission can have many Verification records.
- One Project can generate many Carbon Credit Batches.
- One Buyer can make many Purchases.
- One Carbon Credit Batch can be purchased multiple times until all credits are exhausted.

---

# Database Summary

The database follows a relational design using Primary Keys (PK) and Foreign Keys (FK). This structure ensures data consistency, avoids duplication, and supports future scalability of the CarbonTrust Registry platform.