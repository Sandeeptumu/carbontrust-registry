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
import java.security.Principal;
import jakarta.validation.Valid;
import com.carbontrust.backend.dto.AdminRoleUpdateRequest;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final com.carbontrust.backend.repository.AccountAuditRepository audits;
    private final ProjectService projectService;
    private final CarbonCreditBatchService carbonCreditBatchService;
    private final PurchaseService purchaseService;
    private final RetirementService retirementService;

    public AdminController(
            AdminService adminService,
            ProjectService projectService,
            CarbonCreditBatchService carbonCreditBatchService,
            PurchaseService purchaseService,
            RetirementService retirementService, com.carbontrust.backend.repository.AccountAuditRepository audits
    ) {
        this.adminService = adminService;
        this.audits=audits;
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

    @PutMapping("/users/{userId}/role")
    public AdminUserResponse updateRole(@PathVariable Long userId,
            @Valid @RequestBody AdminRoleUpdateRequest request, Principal principal) {
        return adminService.updateRole(userId, request.role(), request.expectedRole(), principal.getName());
    }

    public record StatusRequest(@jakarta.validation.constraints.NotBlank String status) {}
    public record EmailRequest(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Email @jakarta.validation.constraints.Size(max=254) String email) {}
    @PutMapping("/users/{userId}/status")
    public AdminUserResponse status(@PathVariable Long userId,@Valid @RequestBody StatusRequest body,Principal principal) {
        return adminService.updateStatus(userId,body.status(),principal.getName());
    }
    @PutMapping("/users/{userId}/email")
    public java.util.Map<String,String> email(@PathVariable Long userId,@Valid @RequestBody EmailRequest body,Principal principal) {
        adminService.requestEmailChange(userId,body.email(),principal.getName());
        return java.util.Map.of("message","Verification sent. The current address remains until confirmation.");
    }
    @GetMapping("/users/{userId}/audit")
    public java.util.List<com.carbontrust.backend.entity.AccountAudit> audit(@PathVariable Long userId) {
        return audits.findByUserIdOrderByCreatedAtDesc(userId);
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
