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

### POST /users/register

Registers a new user in the CarbonTrust Registry.

```http
POST /users/register

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