package com.carbontrust.backend.controller;

import com.carbontrust.backend.dto.AdminStatsResponse;
import com.carbontrust.backend.dto.AdminUserResponse;
import com.carbontrust.backend.dto.CarbonCreditBatchResponse;
import com.carbontrust.backend.dto.ProjectResponse;
import com.carbontrust.backend.dto.PurchaseResponse;
import com.carbontrust.backend.dto.RetirementResponse;
import com.carbontrust.backend.service.AdminService;
import com.carbontrust.backend.service.CarbonCreditBatchService;
import com.carbontrust.backend.service.ProjectService;
import com.carbontrust.backend.service.PurchaseService;
import com.carbontrust.backend.service.RetirementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final ProjectService projectService;
    private final CarbonCreditBatchService carbonCreditBatchService;
    private final PurchaseService purchaseService;
    private final RetirementService retirementService;

    public AdminController(
            AdminService adminService,
            ProjectService projectService,
            CarbonCreditBatchService carbonCreditBatchService,
            PurchaseService purchaseService,
            RetirementService retirementService
    ) {
        this.adminService = adminService;
        this.projectService = projectService;
        this.carbonCreditBatchService = carbonCreditBatchService;
        this.purchaseService = purchaseService;
        this.retirementService = retirementService;
    }

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminService.getStats();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/projects")
    public List<ProjectResponse> getProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/credits")
    public List<CarbonCreditBatchResponse> getCredits() {
        return carbonCreditBatchService.getAllBatches();
    }

    @GetMapping("/purchases")
    public List<PurchaseResponse> getPurchases() {
        return purchaseService.getAllPurchases();
    }

    @GetMapping("/retirements")
    public List<RetirementResponse> getRetirements() {
        return retirementService.getAllRetirements();
    }
}
