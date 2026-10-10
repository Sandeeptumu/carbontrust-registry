package com.carbontrust.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class VerifierSubmissionResponse {

    private String fileName;
    private String contentType;
    private Long fileSize;
    private String sha256;
    private Long assignedVerifierId;
    private Long mrvId;
    private Long projectId;
    private String projectName;
    private String ecosystemType;
    private String location;
    private String ownerUsername;
    private String projectStatus;
    private LocalDateTime uploadDate;
    private String mrvStatus;
    private Boolean photoVerification;
    private String remarks;
}
