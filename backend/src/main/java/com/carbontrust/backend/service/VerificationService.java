package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.VerificationRequest;
import com.carbontrust.backend.dto.VerificationResponse;
import com.carbontrust.backend.dto.VerifierVerificationResponse;
import com.carbontrust.backend.entity.MRVSubmission;
import com.carbontrust.backend.entity.Project;
import com.carbontrust.backend.entity.User;
import com.carbontrust.backend.entity.Verification;
import com.carbontrust.backend.exception.BusinessException;
import com.carbontrust.backend.exception.ResourceNotFoundException;
import com.carbontrust.backend.repository.MRVSubmissionRepository;
import com.carbontrust.backend.repository.ProjectRepository;
import com.carbontrust.backend.repository.UserRepository;
import com.carbontrust.backend.repository.VerificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class VerificationService {

    private final VerificationRepository verificationRepository;
    private final MRVSubmissionRepository mrvSubmissionRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public VerificationService(
            VerificationRepository verificationRepository,
            MRVSubmissionRepository mrvSubmissionRepository,
            UserRepository userRepository,
            ProjectRepository projectRepository
    ) {
        this.verificationRepository = verificationRepository;
        this.mrvSubmissionRepository = mrvSubmissionRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    @org.springframework.transaction.annotation.Transactional
    public VerificationResponse verifyMRV(
            Long mrvId,
            VerificationRequest request,
            String email
    ) {

        if (request.getComments() == null || request.getComments().isBlank() || request.getComments().length() > 2000 || !("APPROVED".equals(request.getVerificationStatus()) || "REJECTED".equals(request.getVerificationStatus()))) throw new BusinessException("A valid decision and comments are required");
        User verifier = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Verifier not found")
                );

        if (!"VERIFIER".equals(verifier.getRole()) || !Boolean.TRUE.equals(verifier.getStatus())) {
            throw new BusinessException(
                    "Only verifiers can verify MRV submissions"
            );
        }

        MRVSubmission mrvSubmission =
                mrvSubmissionRepository.findLockedById(mrvId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "MRV submission not found"
                                )
                        );

        if (mrvSubmission.getAssignedVerifier() == null || !mrvSubmission.getAssignedVerifier().getUserId().equals(verifier.getUserId())) throw new org.springframework.security.access.AccessDeniedException("This submission is not assigned to you");

        if (!"PENDING".equals(mrvSubmission.getMrvStatus())) {
            throw new BusinessException(
                    "Only pending MRV submissions can be verified"
            );
        }

        Verification verification = new Verification();

        verification.setMrvSubmission(mrvSubmission);
        verification.setVerifier(verifier);
        verification.setVerificationStatus(
                request.getVerificationStatus()
        );
        verification.setComments(request.getComments());

        Verification savedVerification =
                verificationRepository.save(verification);

        mrvSubmission.setMrvStatus(
                request.getVerificationStatus()
        );

        mrvSubmissionRepository.save(mrvSubmission);

        Project project = projectRepository.findLockedById(mrvSubmission.getProject().getProjectId()).orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if ("APPROVED".equals(request.getVerificationStatus())) {
            project.setProjectStatus("VERIFIED");
        } else if ("REJECTED".equals(request.getVerificationStatus())) {
            project.setProjectStatus("REJECTED");
        }

        projectRepository.save(project);

        return mapToResponse(savedVerification);
    }

    public List<VerificationResponse> getMRVVerifications(
            Long mrvId,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        var submission = mrvSubmissionRepository.findById(mrvId).orElseThrow(() -> new ResourceNotFoundException("MRV submission not found"));
        boolean allowed = "ADMIN".equals(user.getRole())
            || ("NGO".equals(user.getRole()) && submission.getProject().getOwner().getUserId().equals(user.getUserId()))
            || ("VERIFIER".equals(user.getRole()) && submission.getAssignedVerifier() != null && submission.getAssignedVerifier().getUserId().equals(user.getUserId()));
        if (!Boolean.TRUE.equals(user.getStatus()) || !allowed) throw new org.springframework.security.access.AccessDeniedException("Not authorized to view this review");

        return verificationRepository
                .findByMrvSubmissionMrvId(mrvId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<VerifierVerificationResponse> getVerificationHistory(
            String email
    ) {

        User verifier = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Verifier not found"
                        )
                );

        if (!"VERIFIER".equals(verifier.getRole()) || !Boolean.TRUE.equals(verifier.getStatus())) {
            throw new BusinessException(
                    "Only verifiers can view verification history"
            );
        }

        return verificationRepository
                .findByVerifierUserId(verifier.getUserId())
                .stream()
                .map(this::mapToHistoryResponse)
                .toList();
    }

    private VerifierVerificationResponse mapToHistoryResponse(
            Verification verification
    ) {

        VerifierVerificationResponse response =
                new VerifierVerificationResponse();

        response.setVerificationId(
                verification.getVerificationId()
        );
        response.setVerificationStatus(
                verification.getVerificationStatus()
        );
        response.setComments(verification.getComments());
        response.setVerificationDate(
                verification.getVerificationDate()
        );

        if (verification.getVerifier() != null) {
            response.setVerifierUsername(
                    verification.getVerifier().getUsername()
            );
        }

        MRVSubmission submission =
                verification.getMrvSubmission();

        if (submission != null) {

            response.setMrvId(submission.getMrvId());

            Project project = submission.getProject();

            if (project != null) {
                response.setProjectId(project.getProjectId());
                response.setProjectName(project.getProjectName());
            }
        }

        return response;
    }

    private VerificationResponse mapToResponse(
            Verification verification
    ) {

        VerificationResponse response =
                new VerificationResponse();

        response.setVerificationId(
                verification.getVerificationId()
        );

        if (verification.getMrvSubmission() != null) {
            response.setMrvId(
                    verification.getMrvSubmission().getMrvId()
            );
        }

        if (verification.getVerifier() != null) {
            response.setVerifierId(
                    verification.getVerifier().getUserId()
            );

            response.setVerifierUsername(
                    verification.getVerifier().getUsername()
            );
        }

        response.setVerificationStatus(
                verification.getVerificationStatus()
        );

        response.setComments(
                verification.getComments()
        );

        response.setVerificationDate(
                verification.getVerificationDate()
        );

        return response;
    }
}