package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.MRVSubmissionRequest;
import com.carbontrust.backend.dto.MRVSubmissionResponse;
import com.carbontrust.backend.entity.MRVSubmission;
import com.carbontrust.backend.entity.Project;
import com.carbontrust.backend.repository.MRVSubmissionRepository;
import com.carbontrust.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MRVSubmissionService {

    private final MRVSubmissionRepository mrvSubmissionRepository;
    private final ProjectRepository projectRepository;

    public MRVSubmissionService(
            MRVSubmissionRepository mrvSubmissionRepository,
            ProjectRepository projectRepository
    ) {
        this.mrvSubmissionRepository = mrvSubmissionRepository;
        this.projectRepository = projectRepository;
    }

    public MRVSubmissionResponse createMRVSubmission(
            Long projectId,
            MRVSubmissionRequest request,
            String email
    ) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found")
                );

        if (!project.getOwner().getEmail().equals(email)) {
            throw new RuntimeException(
                    "You are not authorized to submit MRV for this project"
            );
        }

        MRVSubmission submission = new MRVSubmission();

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

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found")
                );

        if (!project.getOwner().getEmail().equals(email)) {
            throw new RuntimeException(
                    "You are not authorized to view MRV submissions"
            );
        }

        return mrvSubmissionRepository
                .findByProjectProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private MRVSubmissionResponse mapToResponse(
            MRVSubmission submission
    ) {

        MRVSubmissionResponse response =
                new MRVSubmissionResponse();

        response.setMrvId(submission.getMrvId());

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