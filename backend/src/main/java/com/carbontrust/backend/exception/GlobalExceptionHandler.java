package com.carbontrust.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.mail.MailException.class)
    public ResponseEntity<Map<String,Object>> mailUnavailable(org.springframework.mail.MailException e) {
        return buildResponse(HttpStatus.SERVICE_UNAVAILABLE,"Email delivery is temporarily unavailable. Please try again later.");
    }
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String,Object>> denied(org.springframework.security.access.AccessDeniedException e) {
        return buildResponse(HttpStatus.FORBIDDEN,"You do not have permission for this action");
    }
    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String,Object>> tooLarge(org.springframework.web.multipart.MaxUploadSizeExceededException e) {
        return buildResponse(HttpStatus.PAYLOAD_TOO_LARGE,"File must not exceed 10 MB");
    }
    @ExceptionHandler({org.springframework.http.converter.HttpMessageNotReadableException.class, org.springframework.web.bind.MissingServletRequestParameterException.class,org.springframework.web.multipart.support.MissingServletRequestPartException.class})
    public ResponseEntity<Map<String,Object>> malformed(Exception e) {
        return buildResponse(HttpStatus.BAD_REQUEST,"Invalid request data");
    }

    @ExceptionHandler(ExternalAuthException.class)
    public ResponseEntity<Map<String, Object>> handleExternalAuth(ExternalAuthException exception) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", exception.getStatus()); body.put("code", exception.getCode());
        body.put("message", exception.getMessage());
        return ResponseEntity.status(exception.getStatus()).body(body);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleIdentityConflict(org.springframework.dao.DataIntegrityViolationException exception) {
        return buildResponse(HttpStatus.CONFLICT, "The request conflicts with an existing record. Refresh and try again.");
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            ResourceNotFoundException exception
    ) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage()
        );
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(
            DuplicateResourceException exception
    ) {

        return buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage()
        );
    }

    @ExceptionHandler(RoleConflictException.class)
    public ResponseEntity<Map<String, Object>> handleRoleConflict(RoleConflictException exception) {
        return buildResponse(HttpStatus.CONFLICT, exception.getMessage());
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessException(
            BusinessException exception
    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                exception.getMessage()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException exception
    ) {

        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        Map<String, Object> response = new HashMap<>();

        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Validation Failed");
        response.put("message", "Invalid request data");
        response.put("errors", errors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(
            Exception exception
    ) {

        org.slf4j.LoggerFactory.getLogger(getClass()).error("Unhandled request failure: {}",exception.getClass().getSimpleName());

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred"
        );
    }

    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status,
            String message
    ) {

        Map<String, Object> response = new HashMap<>();

        response.put("timestamp", LocalDateTime.now());
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put("message", message);

        return ResponseEntity
                .status(status)
                .body(response);
    }
}