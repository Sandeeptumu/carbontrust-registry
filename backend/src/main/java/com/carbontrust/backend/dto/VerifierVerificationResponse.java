package com.carbontrust.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class VerifierVerificationResponse {

    private Long verificationId;
    private Long mrvId;
    private Long projectId;
    private String projectName;
    private String verifierUsername;
    private String verificationStatus;
    private String comments;
    private LocalDateTime verificationDate;
}
