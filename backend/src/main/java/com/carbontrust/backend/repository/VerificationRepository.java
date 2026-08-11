package com.carbontrust.backend.repository;

import com.carbontrust.backend.entity.Verification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationRepository
        extends JpaRepository<Verification, Long> {

    List<Verification> findByMrvSubmissionMrvId(Long mrvId);

    List<Verification> findByVerifierUserId(Long verifierId);

    List<Verification> findByVerificationStatus(String verificationStatus);
}