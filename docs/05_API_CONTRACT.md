# API Contract

## Introduction

The CarbonTrust Registry backend provides a set of REST APIs that support user registration, authentication, and secure access to protected resources.

The API is built using Spring Boot, Spring Security, Spring Data JPA, MySQL, BCrypt password hashing, and JWT-based authentication.

---

## API Base URL

The backend API is currently available at:

http://localhost:8080

All API endpoints are accessed relative to this base URL.

---

## User Registration

The user registration API allows new users to create an account in the CarbonTrust Registry.

---

## API Endpoints

The CarbonTrust Registry backend currently provides the following REST API endpoints:

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/users/register` | Register a new user | Public |
| POST | `/users/login` | Authenticate a user and generate a JWT token | Public |
| GET | `/users/me` | Access a protected user endpoint | JWT Required |


````markdown
### POST /users/register

Registers a new user in the CarbonTrust Registry.

```http
POST /users/register
```

### Purpose

The registration API:

- Accepts user registration details
- Validates the submitted information
- Checks whether the email is already registered
- Checks whether the username is already taken
- Encrypts the user's password using BCrypt
- Creates the user in the database
- Assigns the default `BUYER` role

### Request Body

```json
{
  "firstName": "Sandeep",
  "lastName": "Test",
  "username": "valid_user_001",
  "email": "valid.user001@carbontrust.com",
  "phoneNumber": "9999999999",
  "address": "Hyderabad",
  "password": "Test@123",
  "dateOfBirth": "2005-01-01"
}
```
---

### POST /users/login

Authenticates an existing user and generates a JWT token.

```http
POST /users/login
```

### Purpose

The login API:

- Accepts the user's email and password
- Checks whether the user exists
- Verifies the password using BCrypt
- Generates a JWT token after successful authentication
- Returns the user's basic information along with the JWT token

### Request Body

```json
{
  "email": "valid.user001@carbontrust.com",
  "password": "Test@123"
}
```

### Authentication

No authentication is required for login.

### Successful Response

```text
200 OK
```

Example response:

```json
{
  "userId": 8,
  "username": "valid_user_001",
  "email": "valid.user001@carbontrust.com",
  "role": "BUYER",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

The JWT token returned by the login API is used to access protected endpoints.

### Invalid Credentials

If the email or password is incorrect:

```text
401 Unauthorized
```

```json
{
  "message": "Invalid email or password"
}
```

---

### GET /users/me

Accesses a protected user endpoint and verifies JWT authentication.

```http
GET /users/me
```

### Purpose

The `/users/me` endpoint is currently used to verify that:

- A JWT token is provided
- The JWT token is valid
- The JWT authentication filter processes the token
- Spring Security authenticates the request
- The protected endpoint can be accessed

### Authentication

A valid JWT token is required.

The token must be sent using the `Authorization` header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Successful Response

```text
200 OK
```

```text
You are authenticated!
```

### Without Authentication

If the request does not contain a valid JWT token:

```text
403 Forbidden
```

The request is rejected by Spring Security.

### Authentication Flow

```text
POST /users/login
        |
        v
JWT Token Generated
        |
        v
Client sends JWT
        |
        v
GET /users/me
        |
        v
JwtAuthenticationFilter
        |
        v
JWT Validation
        |
        v
Spring Security
        |
        v
Access Granted
```