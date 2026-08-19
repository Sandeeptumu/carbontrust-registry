package com.carbontrust.backend.controller;

import com.carbontrust.backend.dto.RetirementRequest;
import com.carbontrust.backend.dto.RetirementResponse;
import com.carbontrust.backend.service.RetirementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/buyer")
public class RetirementController {

    private final RetirementService retirementService;

    public RetirementController(
            RetirementService retirementService
    ) {
        this.retirementService = retirementService;
    }

    @PostMapping("/purchases/{purchaseId}/retire")
    public ResponseEntity<RetirementResponse> retireCredits(
            @PathVariable Long purchaseId,
            @Valid @RequestBody RetirementRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        retirementService.retireCredits(
                                purchaseId,
                                request,
                                email
                        )
                );
    }

    @GetMapping("/retirements")
    public ResponseEntity<List<RetirementResponse>> getBuyerRetirements(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                retirementService.getBuyerRetirements(email)
        );
    }
}