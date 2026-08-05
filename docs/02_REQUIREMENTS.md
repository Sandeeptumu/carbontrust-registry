#  Requirements Specification

## Functional Requirements

The system shall provide the following functionalities:

### User Management

- User Registration
- User Login
- Role-based Authentication
- Profile Management

---

### NGO Module

The NGO user shall be able to:

- Register a new project
- View registered projects
- Delete a project (refund policy applies if applicable)
- Upload MRV (Measurement, Reporting and Verification) evidence
- View verification status
- View issued carbon credit batches

---

### Verifier Module

The Verifier shall be able to:

- Login to the platform
- View assigned MRV submissions
- Review uploaded MRV evidence
- Approve or reject submissions
- Provide comments for every verification
- View previous verification history

---

### Buyer Module

The Buyer shall be able to:

- Register and Login
- Browse available carbon credit batches
- View project details
- Purchase carbon credits
- View purchase history

---

### Administrator Module

The Administrator shall be able to:

- Manage all users
- View all registered projects
- Manage verifiers
- Monitor project approvals
- Monitor carbon credit issuance
- Manage buyer information
- View system dashboard

---

## Non-Functional Requirements

The system should satisfy the following quality requirements:

### Security

- Secure authentication
- Password encryption
- Role-based authorization

### Performance

- Fast response time
- Efficient database operations

### Reliability

- Accurate storage of project and verification data
- Consistent transaction handling

### Scalability

- Support future expansion
- Support additional project types

### Usability

- User-friendly interface
- Easy navigation
- Simple project registration process

---

## User Roles

| Role | Responsibilities |
|------|-------------------|
| NGO | Register projects and upload MRV evidence |
| Verifier | Verify submitted MRV and approve/reject projects |
| Buyer | Purchase verified carbon credits |
| Administrator | Manage the complete platform |

---

## Business Rules

- Every user must register before accessing the platform.
- Every project belongs to exactly one NGO.
- Every project can have multiple MRV submissions.
- Every MRV submission can have multiple verification records.
- Carbon credits are issued only after successful verification.
- Buyers can purchase only available carbon credit batches.
- Every purchase must be recorded in the system.
- Every rejected verification must contain comments.
- Administrators have complete control over platform management.
