package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.VerificationRequest;
import com.carbontrust.backend.dto.VerificationResponse;
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

    public VerificationResponse verifyMRV(
            Long mrvId,
            VerificationRequest request,
            String email
    ) {

        User verifier = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Verifier not found")
                );

        if (!"VERIFIER".equals(verifier.getRole())) {
            throw new BusinessException(
                    "Only verifiers can verify MRV submissions"
            );
        }

        MRVSubmission mrvSubmission =
                mrvSubmissionRepository.findById(mrvId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "MRV submission not found"
                                )
                        );

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

        Project project = mrvSubmission.getProject();

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

        if (!"VERIFIER".equals(user.getRole()) &&
                !"ADMIN".equals(user.getRole())) {

            throw new BusinessException(
                    "Only verifiers or admins can view verification records"
            );
        }

        if (!mrvSubmissionRepository.existsById(mrvId)) {
            throw new ResourceNotFoundException(
                    "MRV submission not found"
            );
        }

        return verificationRepository
                .findByMrvSubmissionMrvId(mrvId)
                .stream()
                .map(this::mapToResponse)
                .toList();
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