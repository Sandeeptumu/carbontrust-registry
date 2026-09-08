package com.carbontrust.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class MarketplaceCreditResponse {

    private Long ccbId;
    private Long projectId;
    private String projectName;
    private String description;
    private String ecosystemType;
    private String location;
    private String ownerUsername;
    private Double originalQuantity;
    private Double availableQuantity;
    private String status;
    private LocalDateTime issuedDate;
    private Double pricePerCredit;
}
