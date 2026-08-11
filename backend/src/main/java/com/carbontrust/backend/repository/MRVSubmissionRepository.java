package com.carbontrust.backend.repository;

import com.carbontrust.backend.entity.MRVSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MRVSubmissionRepository
        extends JpaRepository<MRVSubmission, Long> {

    List<MRVSubmission> findByProjectProjectId(Long projectId);
}

