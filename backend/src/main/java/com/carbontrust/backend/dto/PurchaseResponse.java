package com.carbontrust.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class PurchaseResponse {

    private Long purchaseId;

    private Long buyerId;

    private String buyerUsername;

    private Long ccbId;

    private Long projectId;

    private String projectName;

    private Double quantity;

    private Double price;

    private String paymentStatus;

    private String paymentMethod;

    private LocalDateTime purchaseDate;
}