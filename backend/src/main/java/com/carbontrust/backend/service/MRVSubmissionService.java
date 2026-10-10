package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.MRVSubmissionRequest;
import com.carbontrust.backend.dto.MRVSubmissionResponse;
import com.carbontrust.backend.dto.VerifierSubmissionResponse;
import com.carbontrust.backend.entity.MRVSubmission;
import com.carbontrust.backend.entity.Project;
import com.carbontrust.backend.exception.BusinessException;
import com.carbontrust.backend.exception.ResourceNotFoundException;
import com.carbontrust.backend.repository.MRVSubmissionRepository;
import com.carbontrust.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class MRVSubmissionService {

    private final MRVSubmissionRepository mrvSubmissionRepository;
    private final ProjectRepository projectRepository;
    private final com.carbontrust.backend.repository.UserRepository userRepository;

    public MRVSubmissionService(
            MRVSubmissionRepository mrvSubmissionRepository,
            ProjectRepository projectRepository, com.carbontrust.backend.repository.UserRepository userRepository
    ) {
        this.mrvSubmissionRepository = mrvSubmissionRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @org.springframework.transaction.annotation.Transactional
    public MRVSubmissionResponse createMRVSubmission(
            Long projectId,
            MRVSubmissionRequest request, org.springframework.web.multipart.MultipartFile file,
            String email
    ) {

        requireRole(email, "NGO");
        Project project = projectRepository.findLockedById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );

        if (!project.getOwner().getEmail().equals(email)) {
            throw new BusinessException(
                    "You are not authorized to submit MRV for this project"
            );
        }

        MRVSubmission submission = new MRVSubmission();
        storeEvidence(submission, file);

        submission.setProject(project);
        submission.setPhotoVerification(
                request.getPhotoVerification()
        );
        submission.setRemarks(request.getRemarks());
        submission.setMrvStatus("PENDING");

        MRVSubmission savedSubmission =
                mrvSubmissionRepository.save(submission);

        return mapToResponse(savedSubmission);
    }

    public List<MRVSubmissionResponse> getProjectMRVSubmissions(
            Long projectId,
            String email
    ) {

        var actor = requireRole(email, "NGO", "ADMIN");
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found")
                );

        if (!"ADMIN".equals(actor.getRole()) && !project.getOwner().getEmail().equals(email)) {
            throw new BusinessException(
                    "You are not authorized to view MRV submissions"
            );
        }

        return mrvSubmissionRepository
                .findByProjectProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<VerifierSubmissionResponse> getAllSubmissions(
            String status, String email
    ) {

        var actor = requireRole(email, "VERIFIER", "ADMIN");
        List<MRVSubmission> submissions = "ADMIN".equals(actor.getRole())
                ? mrvSubmissionRepository.findAll() : mrvSubmissionRepository.findByAssignedVerifierEmail(email);
        submissions = submissions.stream().filter(m -> status == null || status.isBlank() || status.equals(m.getMrvStatus())).toList();

        return submissions
                .stream()
                .map(this::mapToVerifierResponse)
                .toList();
    }

    private com.carbontrust.backend.entity.User requireRole(String email, String... roles) {
        var user = userRepository.findByEmail(email).orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Account unavailable"));
        if (!Boolean.TRUE.equals(user.getStatus()) || java.util.Arrays.stream(roles).noneMatch(r -> r.equals(user.getRole())))
            throw new org.springframework.security.access.AccessDeniedException("Not authorized");
        return user;
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public MRVSubmission evidence(Long id, String email) {
        var actor = requireRole(email, "NGO", "VERIFIER", "ADMIN");
        var m = mrvSubmissionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        if (!"ADMIN".equals(actor.getRole()) && !("NGO".equals(actor.getRole()) && m.getProject().getOwner().getUserId().equals(actor.getUserId()))
            && !("VERIFIER".equals(actor.getRole()) && m.getAssignedVerifier() != null && m.getAssignedVerifier().getUserId().equals(actor.getUserId())))
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to view this evidence");
        if (m.getEvidence() == null) throw new ResourceNotFoundException("No file was stored with this historical submission");
        m.getEvidence().clone();
        return m;
    }

    @org.springframework.transaction.annotation.Transactional
    public VerifierSubmissionResponse assign(Long id, Long verifierId, String email) {
        requireRole(email, "ADMIN");
        var verifier = userRepository.findById(verifierId).orElseThrow(() -> new ResourceNotFoundException("Verifier not found"));
        if (!"VERIFIER".equals(verifier.getRole()) || !Boolean.TRUE.equals(verifier.getStatus())) throw new BusinessException("Choose an active verifier");
        var m = mrvSubmissionRepository.findLockedById(id).orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        if (!"PENDING".equals(m.getMrvStatus())) throw new BusinessException("Completed reviews cannot be reassigned");
        m.setAssignedVerifier(verifier);
        return mapToVerifierResponse(mrvSubmissionRepository.save(m));
    }

    static void storeEvidence(MRVSubmission m, org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > 10 * 1024 * 1024) throw new BusinessException("Evidence must be a nonempty PDF, JPEG or PNG of at most 10 MB");
        try {
            byte[] bytes = file.getBytes();
            String type = null;
            if (bytes.length >= 5 && bytes[0] == '%' && bytes[1] == 'P' && bytes[2] == 'D' && bytes[3] == 'F' && bytes[4] == '-') type = "application/pdf";
            if (bytes.length >= 3 && (bytes[0]&255)==255 && (bytes[1]&255)==216 && (bytes[2]&255)==255) type = "image/jpeg";
            if (bytes.length >= 8 && java.util.Arrays.equals(java.util.Arrays.copyOf(bytes,8),new byte[]{(byte)137,80,78,71,13,10,26,10})) type = "image/png";
            String name = file.getOriginalFilename() == null ? "evidence" : file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");
            String lower = name.toLowerCase(java.util.Locale.ROOT);
            if (type == null || !type.equals(file.getContentType()) || !(type.equals("application/pdf") && lower.endsWith(".pdf") || type.equals("image/png") && lower.endsWith(".png") || type.equals("image/jpeg") && (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))))
                throw new BusinessException("File contents, extension and media type must match PDF, JPEG or PNG");
            m.setEvidence(bytes); m.setContentType(type); m.setFileSize((long) bytes.length); m.setFileName(name.substring(0, Math.min(name.length(),200)));
            m.setSha256(java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(bytes)));
        } catch (java.io.IOException ex) { throw new BusinessException("Could not read evidence. Please retry the upload."); }
          catch (java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }

    private VerifierSubmissionResponse mapToVerifierResponse(
            MRVSubmission submission
    ) {

        VerifierSubmissionResponse response =
                new VerifierSubmissionResponse();

        response.setMrvId(submission.getMrvId());
        response.setFileName(submission.getFileName());
        response.setContentType(submission.getContentType());
        response.setFileSize(submission.getFileSize());
        response.setSha256(submission.getSha256());
        response.setAssignedVerifierId(submission.getAssignedVerifier() == null ? null : submission.getAssignedVerifier().getUserId());
        response.setUploadDate(submission.getUploadDate());
        response.setMrvStatus(submission.getMrvStatus());
        response.setPhotoVerification(
                submission.getPhotoVerification()
        );
        response.setRemarks(submission.getRemarks());

        Project project = submission.getProject();

        if (project != null) {

            response.setProjectId(project.getProjectId());
            response.setProjectName(project.getProjectName());
            response.setEcosystemType(
                    project.getEcosystemType()
            );
            response.setLocation(project.getLocation());
            response.setProjectStatus(
                    project.getProjectStatus()
            );

            if (project.getOwner() != null) {
                response.setOwnerUsername(
                        project.getOwner().getUsername()
                );
            }
        }

        return response;
    }

    private MRVSubmissionResponse mapToResponse(
            MRVSubmission submission
    ) {

        MRVSubmissionResponse response =
                new MRVSubmissionResponse();

        response.setMrvId(submission.getMrvId());
        response.setFileName(submission.getFileName());
        response.setContentType(submission.getContentType());
        response.setFileSize(submission.getFileSize());
        response.setSha256(submission.getSha256());
        response.setAssignedVerifierId(submission.getAssignedVerifier() == null ? null : submission.getAssignedVerifier().getUserId());

        if (submission.getProject() != null) {
            response.setProjectId(
                    submission.getProject().getProjectId()
            );
        }

        response.setUploadDate(
                submission.getUploadDate()
        );

        response.setMrvStatus(
                submission.getMrvStatus()
        );

        response.setPhotoVerification(
                submission.getPhotoVerification()
        );

        response.setRemarks(
                submission.getRemarks()
        );

        return response;
    }
}