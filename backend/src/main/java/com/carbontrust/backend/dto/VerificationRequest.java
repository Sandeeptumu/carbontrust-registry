package com.carbontrust.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VerificationRequest {

    @NotBlank(message = "Verification status is required")
    @Pattern(
            regexp = "APPROVED|REJECTED",
            message = "Verification status must be APPROVED or REJECTED"
    )
    private String verificationStatus;

    @Size(
            max = 2000,
            message = "Comments cannot exceed 2000 characters"
    )
    private String comments;
}