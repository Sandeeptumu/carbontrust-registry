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

    @PostMapping(consumes = "multipart/form-data")
    public MRVSubmissionResponse createMRVSubmission(
            @PathVariable Long projectId,
            @ModelAttribute @Valid MRVSubmissionRequest request,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return mrvSubmissionService.createMRVSubmission(
                projectId,
                request, file,
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