package com.carbontrust.backend.controller;

import com.carbontrust.backend.dto.ProjectRequest;
import com.carbontrust.backend.dto.ProjectResponse;
import com.carbontrust.backend.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ProjectResponse createProject(
            @RequestBody @Valid ProjectRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        return projectService.createProject(request, email);
    }

    @GetMapping
    public List<ProjectResponse> getAllProjects(Authentication authentication) {
        return projectService.getMyProjects(authentication.getName());
    }

    @GetMapping("/{projectId}")
    public ProjectResponse getProjectById(
            @PathVariable Long projectId, Authentication authentication
    ) {
        return projectService.getOwnedProject(projectId, authentication.getName());
    }

    @PutMapping("/{projectId}")
    public ProjectResponse updateProject(
            @PathVariable Long projectId,
            @RequestBody @Valid ProjectRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        return projectService.updateProject(
                projectId,
                request,
                email
        );
    }

    @DeleteMapping("/{projectId}")
    public void deleteProject(
            @PathVariable Long projectId,
            Authentication authentication
    ) {
        String email = authentication.getName();

        projectService.deleteProject(
                projectId,
                email
        );
    }
}