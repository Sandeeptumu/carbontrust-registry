package com.carbontrust.backend.controller;

import com.carbontrust.backend.dto.VerifierSubmissionResponse;
import com.carbontrust.backend.dto.VerifierVerificationResponse;
import com.carbontrust.backend.service.MRVSubmissionService;
import com.carbontrust.backend.service.VerificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/verifier")
public class VerifierWorkspaceController {

    private final MRVSubmissionService mrvSubmissionService;
    private final VerificationService verificationService;

    public VerifierWorkspaceController(
            MRVSubmissionService mrvSubmissionService,
            VerificationService verificationService
    ) {
        this.mrvSubmissionService = mrvSubmissionService;
        this.verificationService = verificationService;
    }

    @GetMapping("/mrv")
    public List<VerifierSubmissionResponse> getMRVSubmissions(
            @RequestParam(required = false) String status
    ) {
        return mrvSubmissionService.getAllSubmissions(status);
    }

    @GetMapping("/verifications")
    public List<VerifierVerificationResponse> getMyVerifications(
            Authentication authentication
    ) {
        String email = authentication.getName();
        return verificationService.getVerificationHistory(email);
    }
}
