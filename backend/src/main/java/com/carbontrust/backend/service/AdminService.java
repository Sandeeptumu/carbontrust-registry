package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.AdminStatsResponse;
import com.carbontrust.backend.dto.AdminUserResponse;
import com.carbontrust.backend.entity.CarbonCreditBatch;
import com.carbontrust.backend.entity.CarbonCreditRetirement;
import com.carbontrust.backend.entity.Project;
import com.carbontrust.backend.entity.Purchase;
import com.carbontrust.backend.entity.User;
import com.carbontrust.backend.repository.CarbonCreditBatchRepository;
import com.carbontrust.backend.repository.CarbonCreditRetirementRepository;
import com.carbontrust.backend.repository.ProjectRepository;
import com.carbontrust.backend.repository.PurchaseRepository;
import com.carbontrust.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final CarbonCreditBatchRepository carbonCreditBatchRepository;
    private final PurchaseRepository purchaseRepository;
    private final CarbonCreditRetirementRepository carbonCreditRetirementRepository;

    public AdminService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            CarbonCreditBatchRepository carbonCreditBatchRepository,
            PurchaseRepository purchaseRepository,
            CarbonCreditRetirementRepository carbonCreditRetirementRepository
    ) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.carbonCreditBatchRepository = carbonCreditBatchRepository;
        this.purchaseRepository = purchaseRepository;
        this.carbonCreditRetirementRepository = carbonCreditRetirementRepository;
    }

    public AdminStatsResponse getStats() {

        AdminStatsResponse stats = new AdminStatsResponse();

        stats.setTotalUsers(userRepository.count());

        stats.setUsersByRole(
                countBy(
                        userRepository.findAll().stream()
                                .map(User::getRole)
                                .toList()
                )
        );

        stats.setTotalProjects(projectRepository.count());

        stats.setProjectsByStatus(
                countBy(
                        projectRepository.findAll().stream()
                                .map(Project::getProjectStatus)
                                .toList()
                )
        );

        List<CarbonCreditBatch> batches =
                carbonCreditBatchRepository.findAll();

        stats.setTotalCreditsIssued(
                batches.stream()
                        .mapToDouble(
                                CarbonCreditBatch::getOriginalQuantity
                        )
                        .sum()
        );

        stats.setTotalCreditsAvailable(
                batches.stream()
                        .mapToDouble(
                                CarbonCreditBatch::getAvailableQuantity
                        )
                        .sum()
        );

        List<Purchase> purchases = purchaseRepository.findAll();

        stats.setTotalPurchases((long) purchases.size());

        stats.setTotalRevenue(
                purchases.stream()
                        .mapToDouble(Purchase::getPrice)
                        .sum()
        );

        stats.setTotalCreditsSold(
                purchases.stream()
                        .mapToDouble(Purchase::getQuantity)
                        .sum()
        );

        List<CarbonCreditRetirement> retirements =
                carbonCreditRetirementRepository.findAll();

        stats.setTotalRetirements((long) retirements.size());

        stats.setTotalCreditsRetired(
                retirements.stream()
                        .mapToDouble(
                                CarbonCreditRetirement::getQuantity
                        )
                        .sum()
        );

        return stats;
    }

    public List<AdminUserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> {

                    AdminUserResponse response =
                            new AdminUserResponse();

                    response.setUserId(user.getUserId());
                    response.setFirstName(user.getFirstName());
                    response.setLastName(user.getLastName());
                    response.setUsername(user.getUsername());
                    response.setEmail(user.getEmail());
                    response.setPhoneNumber(user.getPhoneNumber());
                    response.setAddress(user.getAddress());
                    response.setRole(user.getRole());
                    response.setStatus(user.getStatus());
                    response.setDateOfBirth(user.getDateOfBirth());
                    response.setCreatedAt(user.getCreatedAt());

                    return response;
                })
                .toList();
    }

    private Map<String, Long> countBy(List<String> values) {

        return values.stream()
                .collect(
                        Collectors.groupingBy(
                                value -> value == null
                                        ? "UNKNOWN"
                                        : value,
                                Collectors.counting()
                        )
                );
    }
}
