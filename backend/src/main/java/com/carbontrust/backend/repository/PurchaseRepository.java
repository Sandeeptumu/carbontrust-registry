package com.carbontrust.backend.repository;

import com.carbontrust.backend.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByBuyerUserId(Long buyerId);

    List<Purchase> findByCarbonCreditBatchCcbId(Long ccbId);

    List<Purchase> findByPaymentStatus(String paymentStatus);
}