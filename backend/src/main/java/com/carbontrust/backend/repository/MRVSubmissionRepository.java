package com.carbontrust.backend.repository;

import com.carbontrust.backend.entity.MRVSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MRVSubmissionRepository
        extends JpaRepository<MRVSubmission, Long> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select m from MRVSubmission m where m.mrvId = :id")
    java.util.Optional<MRVSubmission> findLockedById(@org.springframework.data.repository.query.Param("id") Long id);
    List<MRVSubmission> findByAssignedVerifierEmail(String email);
    boolean existsByProjectProjectId(Long projectId);

    List<MRVSubmission> findByProjectProjectId(Long projectId);

    List<MRVSubmission> findAllByMrvStatus(String mrvStatus);
}

