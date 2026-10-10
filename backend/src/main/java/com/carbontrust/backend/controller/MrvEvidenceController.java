package com.carbontrust.backend.controller;

import com.carbontrust.backend.service.*;
import com.carbontrust.backend.dto.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
public class MrvEvidenceController {
    private final MRVSubmissionService submissions;
    private final VerificationService verifications;
    public MrvEvidenceController(MRVSubmissionService submissions, VerificationService verifications) {
        this.submissions = submissions; this.verifications = verifications;
    }
    @GetMapping("/mrv/{id}/evidence")
    public ResponseEntity<byte[]> download(@PathVariable Long id, Authentication auth) {
        var file = submissions.evidence(id, auth.getName());
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(file.getContentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(file.getFileName()).build().toString())
            .header("X-Content-Type-Options", "nosniff").header(HttpHeaders.CACHE_CONTROL, "private, no-store")
            .contentLength(file.getFileSize()).body(file.getEvidence());
    }
    @GetMapping("/mrv/{id}/verifications")
    public List<VerificationResponse> history(@PathVariable Long id, Authentication auth) {
        return verifications.getMRVVerifications(id, auth.getName());
    }
    @GetMapping("/admin/mrv")
    public List<VerifierSubmissionResponse> list(Authentication auth) { return submissions.getAllSubmissions(null, auth.getName()); }
    public record Assignment(@jakarta.validation.constraints.NotNull Long verifierId) {}
    @PutMapping("/admin/mrv/{id}/assignment")
    public VerifierSubmissionResponse assign(@PathVariable Long id, @jakarta.validation.Valid @RequestBody Assignment request, Authentication auth) {
        return submissions.assign(id, request.verifierId(), auth.getName());
    }
}
