package com.carbontrust.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChangePasswordRequest {
    @NotBlank
    @Size(max = 64)
    private String currentPassword;

    @NotBlank
    @Size(min = 12, max = 64)
    private String newPassword;

    @NotBlank
    private String passwordConfirmation;
}
