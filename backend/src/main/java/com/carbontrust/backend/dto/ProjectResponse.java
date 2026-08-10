package com.carbontrust.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class ProjectResponse {

    private Long projectId;
    private String projectName;
    private String description;
    private String ecosystemType;
    private String location;
    private Double area;
    private LocalDate startDate;
    private String projectStatus;

    private Long ownerId;
    private String ownerUsername;
}