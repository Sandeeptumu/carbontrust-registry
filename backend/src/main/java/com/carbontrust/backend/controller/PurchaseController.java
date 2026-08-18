package com.carbontrust.backend.controller;

import com.carbontrust.backend.dto.PurchaseRequest;
import com.carbontrust.backend.dto.PurchaseResponse;
import com.carbontrust.backend.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/buyer")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(
            PurchaseService purchaseService
    ) {
        this.purchaseService = purchaseService;
    }

    @PostMapping("/carbon-credits/{ccbId}/purchase")
    public ResponseEntity<PurchaseResponse> purchaseCredits(
            @PathVariable Long ccbId,
            @Valid @RequestBody PurchaseRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        purchaseService.purchaseCredits(
                                ccbId,
                                request,
                                email
                        )
                );
    }

    @GetMapping("/purchases")
    public ResponseEntity<List<PurchaseResponse>> getBuyerPurchases(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                purchaseService.getBuyerPurchases(email)
        );
    }
}