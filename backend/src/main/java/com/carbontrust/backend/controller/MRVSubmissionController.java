package com.carbontrust.backend.controller;

import com.carbontrust.backend.dto.MRVSubmissionRequest;
import com.carbontrust.backend.dto.MRVSubmissionResponse;
import com.carbontrust.backend.service.MRVSubmissionService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/mrv")
public class MRVSubmissionController {

    private final MRVSubmissionService mrvSubmissionService;

    public MRVSubmissionController(
            MRVSubmissionService mrvSubmissionService
    ) {
        this.mrvSubmissionService = mrvSubmissionService;
    }

    @PostMapping
    public MRVSubmissionResponse createMRVSubmission(
            @PathVariable Long projectId,
            @RequestBody @Valid MRVSubmissionRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return mrvSubmissionService.createMRVSubmission(
                projectId,
                request,
                email
        );
    }

    @GetMapping
    public List<MRVSubmissionResponse> getProjectMRVSubmissions(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return mrvSubmissionService.getProjectMRVSubmissions(
                projectId,
                email
        );
    }
}