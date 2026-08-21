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

        if (!"BUYER".equals(buyer.getRole())) {
            throw new BusinessException(
                    "Only buyers can purchase carbon credits"
            );
        }

        CarbonCreditBatch batch =
                carbonCreditBatchRepository.findById(ccbId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Carbon credit batch not found"
                                )
                        );

        if (!"ACTIVE".equals(batch.getStatus())) {
            throw new BusinessException(
                    "Carbon credit batch is not active"
            );
        }

        if (request.getQuantity() >
                batch.getAvailableQuantity()) {

            throw new BusinessException(
                    "Not enough carbon credits available"
            );
        }

        Double price =
                request.getQuantity() * 10.0;

        Purchase purchase = new Purchase();

        purchase.setBuyer(buyer);
        purchase.setCarbonCreditBatch(batch);
        purchase.setQuantity(request.getQuantity());
        purchase.setPrice(price);
        purchase.setPaymentStatus("COMPLETED");
        purchase.setPaymentMethod(
                request.getPaymentMethod()
        );

        Purchase savedPurchase =
                purchaseRepository.save(purchase);

        Double remainingQuantity =
                batch.getAvailableQuantity()
                        - request.getQuantity();

        batch.setAvailableQuantity(remainingQuantity);

        if (remainingQuantity == 0) {
            batch.setStatus("SOLD_OUT");
        }

        carbonCreditBatchRepository.save(batch);

        return mapToResponse(savedPurchase);
    }

    public List<PurchaseResponse> getBuyerPurchases(
            String email
    ) {

        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Buyer not found")
                );

        if (!"BUYER".equals(buyer.getRole())) {
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