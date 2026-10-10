package com.carbontrust.backend.repository;

import com.carbontrust.backend.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from Purchase p where p.purchaseId = :id")
    java.util.Optional<Purchase> findLockedById(@org.springframework.data.repository.query.Param("id") Long id);

    List<Purchase> findByBuyerUserId(Long buyerId);

    List<Purchase> findByCarbonCreditBatchCcbId(Long ccbId);

    List<Purchase> findByPaymentStatus(String paymentStatus);
}