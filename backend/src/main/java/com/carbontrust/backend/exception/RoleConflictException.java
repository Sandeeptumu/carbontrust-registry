package com.carbontrust.backend.exception;

public class RoleConflictException extends RuntimeException {
    public RoleConflictException(String message) { super(message); }
}
