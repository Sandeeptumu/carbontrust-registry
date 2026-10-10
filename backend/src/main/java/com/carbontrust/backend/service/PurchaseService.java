package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.PurchaseRequest;
import com.carbontrust.backend.dto.PurchaseResponse;
import com.carbontrust.backend.entity.CarbonCreditBatch;
import com.carbontrust.backend.entity.Purchase;
import com.carbontrust.backend.entity.User;
import com.carbontrust.backend.exception.BusinessException;
import com.carbontrust.backend.exception.ResourceNotFoundException;
import com.carbontrust.backend.repository.CarbonCreditBatchRepository;
import com.carbontrust.backend.repository.PurchaseRepository;
import com.carbontrust.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final CarbonCreditBatchRepository carbonCreditBatchRepository;
    private final UserRepository userRepository;

    public PurchaseService(
            PurchaseRepository purchaseRepository,
            CarbonCreditBatchRepository carbonCreditBatchRepository,
            UserRepository userRepository
    ) {
        this.purchaseRepository = purchaseRepository;
        this.carbonCreditBatchRepository = carbonCreditBatchRepository;
        this.userRepository = userRepository;
    }

    public PurchaseResponse purchaseCredits(
            Long ccbId,
            PurchaseRequest request,
            String email
    ) {

        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Buyer not found")
                );

        if (!"USER".equals(buyer.getRole()) || !Boolean.TRUE.equals(buyer.getStatus())) {
            throw new BusinessException(
                    "Only buyers can purchase carbon credits"
            );
        }

        throw new BusinessException("Purchases are unavailable until pricing, payment processing and settlement rules are configured. No payment has been taken.");
    }

    public List<PurchaseResponse> getBuyerPurchases(
            String email
    ) {

        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Buyer not found")
                );

        if (!"USER".equals(buyer.getRole()) || !Boolean.TRUE.equals(buyer.getStatus())) {
            throw new BusinessException(
                    "Only buyers can view purchase history"
            );
        }

        return purchaseRepository
                .findByBuyerUserId(buyer.getUserId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<PurchaseResponse> getAllPurchases() {

        return purchaseRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PurchaseResponse mapToResponse(
            Purchase purchase
    ) {

        PurchaseResponse response =
                new PurchaseResponse();

        response.setPurchaseId(
                purchase.getPurchaseId()
        );

        if (purchase.getBuyer() != null) {

            response.setBuyerId(
                    purchase.getBuyer().getUserId()
            );

            response.setBuyerUsername(
                    purchase.getBuyer().getUsername()
            );
        }

        if (purchase.getCarbonCreditBatch() != null) {

            CarbonCreditBatch batch =
                    purchase.getCarbonCreditBatch();

            response.setCcbId(
                    batch.getCcbId()
            );

            if (batch.getProject() != null) {

                response.setProjectId(
                        batch.getProject().getProjectId()
                );

                response.setProjectName(
                        batch.getProject().getProjectName()
                );
            }
        }

        response.setQuantity(
                purchase.getQuantity()
        );

        response.setPrice(
                purchase.getPrice()
        );

        response.setPaymentStatus(
                purchase.getPaymentStatus()
        );

        response.setPaymentMethod(
                purchase.getPaymentMethod()
        );

        response.setPurchaseDate(
                purchase.getPurchaseDate()
        );

        return response;


    }
}