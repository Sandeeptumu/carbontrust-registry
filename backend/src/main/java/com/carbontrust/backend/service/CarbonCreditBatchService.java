package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.CarbonCreditBatchRequest;
import com.carbontrust.backend.dto.CarbonCreditBatchResponse;
import com.carbontrust.backend.dto.MarketplaceCreditResponse;
import com.carbontrust.backend.entity.CarbonCreditBatch;
import com.carbontrust.backend.entity.Project;
import com.carbontrust.backend.exception.BusinessException;
import com.carbontrust.backend.exception.ResourceNotFoundException;
import com.carbontrust.backend.repository.CarbonCreditBatchRepository;
import com.carbontrust.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarbonCreditBatchService {

    private final CarbonCreditBatchRepository carbonCreditBatchRepository;
    private final ProjectRepository projectRepository;

    public CarbonCreditBatchService(
            CarbonCreditBatchRepository carbonCreditBatchRepository,
            ProjectRepository projectRepository
    ) {
        this.carbonCreditBatchRepository = carbonCreditBatchRepository;
        this.projectRepository = projectRepository;
    }

    public CarbonCreditBatchResponse issueCredits(
            Long projectId,
            CarbonCreditBatchRequest request
    ) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );

        if (!"VERIFIED".equals(project.getProjectStatus())) {
            throw new BusinessException(
                    "Carbon credits can only be issued for verified projects"
            );
        }

        CarbonCreditBatch batch = new CarbonCreditBatch();

        batch.setProject(project);
        batch.setOriginalQuantity(request.getQuantity());
        batch.setAvailableQuantity(request.getQuantity());
        batch.setStatus("ACTIVE");

        CarbonCreditBatch savedBatch =
                carbonCreditBatchRepository.save(batch);

        return mapToResponse(savedBatch);
    }

    public List<CarbonCreditBatchResponse> getProjectCredits(
            Long projectId
    ) {

        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found");
        }

        return carbonCreditBatchRepository
                .findByProjectProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CarbonCreditBatchResponse> getActiveCredits() {

        return carbonCreditBatchRepository
                .findByStatus("ACTIVE")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CarbonCreditBatchResponse> getAllBatches() {

        return carbonCreditBatchRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<MarketplaceCreditResponse> getMarketplaceCredits() {

        return carbonCreditBatchRepository
                .findByStatus("ACTIVE")
                .stream()
                .map(this::mapToMarketplaceResponse)
                .toList();
    }

    private MarketplaceCreditResponse mapToMarketplaceResponse(
            CarbonCreditBatch batch
    ) {

        MarketplaceCreditResponse response =
                new MarketplaceCreditResponse();

        response.setCcbId(batch.getCcbId());
        response.setOriginalQuantity(
                batch.getOriginalQuantity()
        );
        response.setAvailableQuantity(
                batch.getAvailableQuantity()
        );
        response.setStatus(batch.getStatus());
        response.setIssuedDate(batch.getIssuedDate());
        response.setPricePerCredit(10.0);

        if (batch.getProject() != null) {

            Project project = batch.getProject();

            response.setProjectId(project.getProjectId());
            response.setProjectName(project.getProjectName());
            response.setDescription(project.getDescription());
            response.setEcosystemType(
                    project.getEcosystemType()
            );
            response.setLocation(project.getLocation());

            if (project.getOwner() != null) {
                response.setOwnerUsername(
                        project.getOwner().getUsername()
                );
            }
        }

        return response;
    }

    private CarbonCreditBatchResponse mapToResponse(
            CarbonCreditBatch batch
    ) {

        CarbonCreditBatchResponse response =
                new CarbonCreditBatchResponse();

        response.setCcbId(batch.getCcbId());

        if (batch.getProject() != null) {
            response.setProjectId(
                    batch.getProject().getProjectId()
            );

            response.setProjectName(
                    batch.getProject().getProjectName()
            );
        }

        response.setOriginalQuantity(
                batch.getOriginalQuantity()
        );

        response.setAvailableQuantity(
                batch.getAvailableQuantity()
        );

        response.setStatus(
                batch.getStatus()
        );

        response.setIssuedDate(
                batch.getIssuedDate()
        );

        return response;
    }
}