package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.RetirementRequest;
import com.carbontrust.backend.dto.RetirementResponse;
import com.carbontrust.backend.entity.CarbonCreditRetirement;
import com.carbontrust.backend.entity.Purchase;
import com.carbontrust.backend.entity.User;
import com.carbontrust.backend.exception.BusinessException;
import com.carbontrust.backend.exception.ResourceNotFoundException;
import com.carbontrust.backend.repository.CarbonCreditRetirementRepository;
import com.carbontrust.backend.repository.PurchaseRepository;
import com.carbontrust.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RetirementService {

    private final CarbonCreditRetirementRepository retirementRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;

    public RetirementService(
            CarbonCreditRetirementRepository retirementRepository,
            PurchaseRepository purchaseRepository,
            UserRepository userRepository
    ) {
        this.retirementRepository = retirementRepository;
        this.purchaseRepository = purchaseRepository;
        this.userRepository = userRepository;
    }

    public RetirementResponse retireCredits(
            Long purchaseId,
            RetirementRequest request,
            String email
    ) {

        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Buyer not found")
                );

        if (!"BUYER".equals(buyer.getRole())) {
            throw new BusinessException(
                    "Only buyers can retire carbon credits"
            );
        }

        Purchase purchase =
                purchaseRepository.findById(purchaseId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Purchase not found"
                                )
                        );

        if (!purchase.getBuyer().getUserId()
                .equals(buyer.getUserId())) {

            throw new BusinessException(
                    "You can only retire credits from your own purchase"
            );
        }

        Double alreadyRetired =
                retirementRepository
                        .findByPurchasePurchaseId(purchaseId)
                        .stream()
                        .mapToDouble(
                                CarbonCreditRetirement::getQuantity
                        )
                        .sum();

        Double remainingCredits =
                purchase.getQuantity() - alreadyRetired;

        if (request.getQuantity() > remainingCredits) {
            throw new BusinessException(
                    "You cannot retire more credits than you own"
            );
        }

        CarbonCreditRetirement retirement =
                new CarbonCreditRetirement();

        retirement.setPurchase(purchase);
        retirement.setQuantity(request.getQuantity());
        retirement.setReason(request.getReason());

        CarbonCreditRetirement savedRetirement =
                retirementRepository.save(retirement);

        return mapToResponse(savedRetirement);
    }

    public List<RetirementResponse> getBuyerRetirements(
            String email
    ) {

        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Buyer not found")
                );

        if (!"BUYER".equals(buyer.getRole())) {
            throw new BusinessException(
                    "Only buyers can view retirement records"
            );
        }

        return retirementRepository
                .findByPurchaseBuyerUserId(buyer.getUserId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private RetirementResponse mapToResponse(
            CarbonCreditRetirement retirement
    ) {

        RetirementResponse response =
                new RetirementResponse();

        response.setRetirementId(
                retirement.getRetirementId()
        );

        Purchase purchase =
                retirement.getPurchase();

        if (purchase != null) {

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

                response.setCcbId(
                        purchase.getCarbonCreditBatch()
                                .getCcbId()
                );

                if (purchase.getCarbonCreditBatch()
                        .getProject() != null) {

                    response.setProjectId(
                            purchase.getCarbonCreditBatch()
                                    .getProject()
                                    .getProjectId()
                    );

                    response.setProjectName(
                            purchase.getCarbonCreditBatch()
                                    .getProject()
                                    .getProjectName()
                    );
                }
            }
        }

        response.setQuantity(
                retirement.getQuantity()
        );

        response.setReason(
                retirement.getReason()
        );

        response.setRetirementDate(
                retirement.getRetirementDate()
        );

        return response;
    }
}