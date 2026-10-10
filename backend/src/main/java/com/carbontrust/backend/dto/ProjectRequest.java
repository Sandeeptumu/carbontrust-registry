package com.carbontrust.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    @jakarta.validation.constraints.Size(max=255)
    private String projectName;

    @jakarta.validation.constraints.Size(max=2000)
    private String description;

    @NotBlank(message = "Ecosystem type is required")
    @jakarta.validation.constraints.Size(max=255)
    private String ecosystemType;

    @NotBlank(message = "Location is required")
    @jakarta.validation.constraints.Size(max=255)
    private String location;

    @NotNull(message = "Area is required")
    @jakarta.validation.constraints.Positive
    private Double area;

    @jakarta.validation.constraints.AssertTrue(message="Area must be finite")
    public boolean isAreaFinite() { return area == null || Double.isFinite(area); }

    @NotNull(message = "Start date is required")
    private LocalDate startDate;
}