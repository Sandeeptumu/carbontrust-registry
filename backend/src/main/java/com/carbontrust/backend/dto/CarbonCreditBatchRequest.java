package com.carbontrust.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CarbonCreditBatchRequest {

    @NotNull(message = "Credit quantity is required")
    @DecimalMin(
            value = "0.01",
            message = "Credit quantity must be greater than zero"
    )
    private Double quantity;
}