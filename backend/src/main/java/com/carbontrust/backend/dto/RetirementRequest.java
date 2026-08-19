package com.carbontrust.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RetirementRequest {

    @NotNull(message = "Retirement quantity is required")
    @DecimalMin(
            value = "0.01",
            message = "Retirement quantity must be greater than zero"
    )
    private Double quantity;

    @NotNull(message = "Retirement reason is required")
    private String reason;
}