package com.carbontrust.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminRoleUpdateRequest(
        @NotBlank(message = "Role is required") String role,
        @NotBlank(message = "Current role is required") String expectedRole
) {}
