package com.carbontrust.backend.controller;

import com.carbontrust.backend.dto.MarketplaceCreditResponse;
import com.carbontrust.backend.dto.ProjectResponse;
import com.carbontrust.backend.service.CarbonCreditBatchService;
import com.carbontrust.backend.service.ProjectService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/marketplace")
public class MarketplaceController {

    private final CarbonCreditBatchService carbonCreditBatchService;
    private final ProjectService projectService;

    public MarketplaceController(
            CarbonCreditBatchService carbonCreditBatchService,
            ProjectService projectService
    ) {
        this.carbonCreditBatchService = carbonCreditBatchService;
        this.projectService = projectService;
    }

    @GetMapping("/credits")
    public List<MarketplaceCreditResponse> getAvailableCredits() {
        return carbonCreditBatchService.getMarketplaceCredits();
    }

    @GetMapping("/projects/{projectId}")
    public ProjectResponse getProject(
            @PathVariable Long projectId
    ) {
        return projectService.getProjectById(projectId);
    }
}
