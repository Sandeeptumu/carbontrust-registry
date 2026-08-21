package com.carbontrust.backend.controller;

import com.carbontrust.backend.dto.CarbonCreditBatchRequest;
import com.carbontrust.backend.dto.CarbonCreditBatchResponse;
import com.carbontrust.backend.service.CarbonCreditBatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
public class CarbonCreditBatchController {

    private final CarbonCreditBatchService carbonCreditBatchService;

    public CarbonCreditBatchController(
            CarbonCreditBatchService carbonCreditBatchService
    ) {
        this.carbonCreditBatchService = carbonCreditBatchService;
    }

    @PostMapping("/{projectId}/carbon-credits")
    public ResponseEntity<CarbonCreditBatchResponse> issueCredits(
            @PathVariable Long projectId,
            @Valid @RequestBody CarbonCreditBatchRequest request
    ) {


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        carbonCreditBatchService.issueCredits(
                                projectId,
                                request
                        )
                );
    }

    @GetMapping("/{projectId}/carbon-credits")
    public ResponseEntity<List<CarbonCreditBatchResponse>> getProjectCredits(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                carbonCreditBatchService.getProjectCredits(projectId)
        );
    }
}