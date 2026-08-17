package com.carbontrust.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PurchaseRequest {

    @NotNull(message = "Purchase quantity is required")
    @DecimalMin(
            value = "0.01",
            message = "Purchase quantity must be greater than zero"
    )
    private Double quantity;

    @NotNull(message = "Payment method is required")
    private String paymentMethod;
}