package com.carbontrust.backend.repository;

import com.carbontrust.backend.entity.CarbonCreditBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarbonCreditBatchRepository
        extends JpaRepository<CarbonCreditBatch, Long> {

    List<CarbonCreditBatch> findByProjectProjectId(Long projectId);

    List<CarbonCreditBatch> findByStatus(String status);
}