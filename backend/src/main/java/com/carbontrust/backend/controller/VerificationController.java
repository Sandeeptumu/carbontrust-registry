package com.carbontrust.backend.controller;

import com.carbontrust.backend.dto.VerificationRequest;
import com.carbontrust.backend.dto.VerificationResponse;
import com.carbontrust.backend.service.VerificationService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/verifier")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(
            VerificationService verificationService
    ) {
        this.verificationService = verificationService;
    }

    @PostMapping("/mrv/{mrvId}/verify")
    public VerificationResponse verifyMRV(
            @PathVariable Long mrvId,
            @RequestBody @Valid VerificationRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return verificationService.verifyMRV(
                mrvId,
                request,
                email
        );
    }

    @GetMapping("/mrv/{mrvId}/verifications")
    public List<VerificationResponse> getMRVVerifications(
            @PathVariable Long mrvId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return verificationService.getMRVVerifications(
                mrvId,
                email
        );
    }
}