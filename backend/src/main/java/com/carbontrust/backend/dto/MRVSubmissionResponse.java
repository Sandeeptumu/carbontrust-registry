package com.carbontrust.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class MRVSubmissionResponse {

    private Long mrvId;

    private Long projectId;

    private LocalDateTime uploadDate;

    private String mrvStatus;

    private Boolean photoVerification;

    private String remarks;
}