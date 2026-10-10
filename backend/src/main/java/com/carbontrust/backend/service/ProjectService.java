package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.ProjectRequest;
import com.carbontrust.backend.dto.ProjectResponse;
import com.carbontrust.backend.entity.Project;
import com.carbontrust.backend.entity.User;
import com.carbontrust.backend.exception.BusinessException;
import com.carbontrust.backend.exception.ResourceNotFoundException;
import com.carbontrust.backend.repository.ProjectRepository;
import com.carbontrust.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final com.carbontrust.backend.repository.MRVSubmissionRepository submissions;

    private final com.carbontrust.backend.repository.CarbonCreditBatchRepository batches;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository, com.carbontrust.backend.repository.MRVSubmissionRepository submissions, com.carbontrust.backend.repository.CarbonCreditBatchRepository batches
    ) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.submissions = submissions;
        this.batches=batches;
    }

    @org.springframework.transaction.annotation.Transactional
    public ProjectResponse createProject(
            ProjectRequest request,
            String email
    ) {

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        if (!"NGO".equals(owner.getRole()) || !Boolean.TRUE.equals(owner.getStatus())) throw new org.springframework.security.access.AccessDeniedException("Only active NGOs can register projects");
        Project project = new Project();

        project.setOwner(owner);
        project.setProjectName(request.getProjectName());
        project.setDescription(request.getDescription());
        project.setEcosystemType(request.getEcosystemType());
        project.setLocation(request.getLocation());
        project.setArea(request.getArea());
        project.setStartDate(request.getStartDate());
        project.setProjectStatus("DRAFT");

        Project savedProject = projectRepository.save(project);

        return mapToResponse(savedProject);
    }

    public List<ProjectResponse> getMyProjects(String email) {
        return projectRepository.findAll().stream().filter(p -> p.getOwner().getEmail().equals(email)).map(this::mapToResponse).toList();
    }
    public ProjectResponse getOwnedProject(Long id, String email) {
        var p = projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        var actor = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!"ADMIN".equals(actor.getRole()) && !p.getOwner().getEmail().equals(email)) throw new org.springframework.security.access.AccessDeniedException("Not your project");
        return mapToResponse(p);
    }

    public List<ProjectResponse> getAllProjects() {

        return projectRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProjectResponse getMarketplaceProject(Long id) {
        if (!batches.existsByProjectProjectId(id)) throw new ResourceNotFoundException("Project is not listed in the marketplace");
        return getProjectById(id);
    }

    public ProjectResponse getProjectById(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );

        return mapToResponse(project);
    }

    @org.springframework.transaction.annotation.Transactional
    public ProjectResponse updateProject(
            Long projectId,
            ProjectRequest request,
            String email
    ) {

        Project project = projectRepository.findLockedById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );

        var actor = userRepository.findByEmail(email).orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Account unavailable"));
        if (!"NGO".equals(actor.getRole()) || !Boolean.TRUE.equals(actor.getStatus()) || !project.getOwner().getEmail().equals(email)) {
            throw new BusinessException(
                    "You are not authorized to update this project"
            );
        }

        if (submissions.existsByProjectProjectId(projectId)) throw new BusinessException("Projects with submitted evidence cannot be edited without a documented amendment process");
        project.setProjectName(request.getProjectName());
        project.setDescription(request.getDescription());
        project.setEcosystemType(request.getEcosystemType());
        project.setLocation(request.getLocation());
        project.setArea(request.getArea());
        project.setStartDate(request.getStartDate());

        Project updatedProject = projectRepository.save(project);

        return mapToResponse(updatedProject);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteProject(
            Long projectId,
            String email
    ) {

        Project project = projectRepository.findLockedById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );

        var actor = userRepository.findByEmail(email).orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Account unavailable"));
        if (!"NGO".equals(actor.getRole()) || !Boolean.TRUE.equals(actor.getStatus()) || !project.getOwner().getEmail().equals(email)) {
            throw new BusinessException(
                    "You are not authorized to delete this project"
            );
        }

        if (submissions.existsByProjectProjectId(projectId)) throw new BusinessException("Projects with MRV history cannot be deleted; refund and archival policies are not specified");
        projectRepository.delete(project);
    }

    private ProjectResponse mapToResponse(Project project) {

        ProjectResponse response = new ProjectResponse();

        response.setProjectId(project.getProjectId());
        response.setProjectName(project.getProjectName());
        response.setDescription(project.getDescription());
        response.setEcosystemType(project.getEcosystemType());
        response.setLocation(project.getLocation());
        response.setArea(project.getArea());
        response.setStartDate(project.getStartDate());
        response.setProjectStatus(project.getProjectStatus());
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());

        if (project.getOwner() != null) {
            response.setOwnerId(project.getOwner().getUserId());
            response.setOwnerUsername(project.getOwner().getUsername());
        }

        return response;
    }
}