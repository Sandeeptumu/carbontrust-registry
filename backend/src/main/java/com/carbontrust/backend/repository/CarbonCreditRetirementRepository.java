package com.carbontrust.backend.repository;

import com.carbontrust.backend.entity.CarbonCreditRetirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarbonCreditRetirementRepository
        extends JpaRepository<CarbonCreditRetirement, Long> {

    List<CarbonCreditRetirement> findByPurchasePurchaseId(
            Long purchaseId
    );

    List<CarbonCreditRetirement> findByPurchaseBuyerUserId(
            Long buyerId
    );
}