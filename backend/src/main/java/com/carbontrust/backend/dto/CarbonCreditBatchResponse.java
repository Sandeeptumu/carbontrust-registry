package com.carbontrust.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CarbonCreditBatchResponse {

    private Long ccbId;

    private Long projectId;

    private String projectName;

    private Double originalQuantity;

    private Double availableQuantity;

    private String status;

    private LocalDateTime issuedDate;
}