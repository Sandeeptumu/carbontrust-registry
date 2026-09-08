package com.carbontrust.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class AdminStatsResponse {

    private Long totalUsers;
    private Map<String, Long> usersByRole;

    private Long totalProjects;
    private Map<String, Long> projectsByStatus;

    private Double totalCreditsIssued;
    private Double totalCreditsAvailable;
    private Double totalCreditsSold;
    private Double totalCreditsRetired;

    private Long totalPurchases;
    private Double totalRevenue;
    private Long totalRetirements;
}
