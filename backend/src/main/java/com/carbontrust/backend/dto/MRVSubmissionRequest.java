package com.carbontrust.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MRVSubmissionRequest {

    @NotNull(message = "Photo verification status is required")
    private Boolean photoVerification;

    @Size(max = 2000, message = "Remarks cannot exceed 2000 characters")
    private String remarks;
}