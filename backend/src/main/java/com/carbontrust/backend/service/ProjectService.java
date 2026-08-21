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
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository
    ) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public ProjectResponse createProject(
            ProjectRequest request,
            String email
    ) {

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

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

    public List<ProjectResponse> getAllProjects() {

        return projectRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProjectResponse getProjectById(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );

        return mapToResponse(project);
    }

    public ProjectResponse updateProject(
            Long projectId,
            ProjectRequest request,
            String email
    ) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );

        if (!project.getOwner().getEmail().equals(email)) {
            throw new BusinessException(
                    "You are not authorized to update this project"
            );
        }

        project.setProjectName(request.getProjectName());
        project.setDescription(request.getDescription());
        project.setEcosystemType(request.getEcosystemType());
        project.setLocation(request.getLocation());
        project.setArea(request.getArea());
        project.setStartDate(request.getStartDate());

        Project updatedProject = projectRepository.save(project);

        return mapToResponse(updatedProject);
    }

    public void deleteProject(
            Long projectId,
            String email
    ) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );

        if (!project.getOwner().getEmail().equals(email)) {
            throw new BusinessException(
                    "You are not authorized to delete this project"
            );
        }

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

        if (project.getOwner() != null) {
            response.setOwnerId(project.getOwner().getUserId());
            response.setOwnerUsername(project.getOwner().getUsername());
        }

        return response;
    }
}