package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.AdminStatsResponse;
import com.carbontrust.backend.exception.BusinessException;
import com.carbontrust.backend.exception.RoleConflictException;
import com.carbontrust.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import java.util.Set;
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

    private final AccountAuditService audit;
    private final com.carbontrust.backend.repository.AuthSessionRepository sessions;
    private final UserService auth;

    public AdminService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            CarbonCreditBatchRepository carbonCreditBatchRepository,
            PurchaseRepository purchaseRepository,
            CarbonCreditRetirementRepository carbonCreditRetirementRepository, AccountAuditService audit, com.carbontrust.backend.repository.AuthSessionRepository sessions, UserService auth
    ) {
        this.userRepository = userRepository;
        this.audit=audit; this.sessions=sessions; this.auth=auth;
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

        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    private static final Set<String> ROLES = Set.of(
            "ADMIN", "NGO", "VERIFIER", "USER", "HEALTHCARE_ASSISTANT");

    @Transactional
    public AdminUserResponse updateRole(Long userId, String role, String expectedRole, String actorEmail) {
        if (role == null || !ROLES.contains(role)) {
            throw new BusinessException("Choose a valid platform role");
        }
        // Serialize role changes and recheck the actor inside the transaction.
        // This also prevents two administrators from removing each other's access concurrently.
        List<User> admins = userRepository.findAdminsForUpdate();
        User actor = admins.stream()
                .filter(user -> user.getEmail().equals(actorEmail) && UserService.active(user))
                .findFirst().orElseThrow(() -> new BusinessException("Administrator access is no longer available"));
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!java.util.Objects.equals(user.getRole(), expectedRole)) {
            throw new RoleConflictException("This user's role has changed. Refresh the list and try again.");
        }
        if (actor.getUserId().equals(userId) && !"ADMIN".equals(role)) {
            throw new BusinessException("Ask another administrator to change your role");
        }
        if ("ADMIN".equals(user.getRole()) && !"ADMIN".equals(role)
                && Boolean.TRUE.equals(user.getStatus())
                && admins.stream().filter(UserService::active).count() <= 1) {
            throw new BusinessException("At least one active administrator must remain");
        }
        String previous=user.getRole();
        user.setRole(role);
        audit.record(userId,actorEmail,"ROLE_CHANGED",previous+" → "+role);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateStatus(Long id, String status, String actorEmail) {
        if (!Set.of("PENDING", "APPROVED", "ACTIVE", "SUSPENDED").contains(status)) throw new BusinessException("Invalid account status");
        List<User> admins=userRepository.findAdminsForUpdate();
        requireAdmin(admins,actorEmail);
        User user=userRepository.findByIdForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean enabled=Set.of("ACTIVE","APPROVED").contains(status);
        if ("ADMIN".equals(user.getRole()) && Boolean.TRUE.equals(user.getStatus()) && !enabled && admins.stream().filter(UserService::active).count()<=1)
            throw new BusinessException("At least one active administrator must remain");
        String previous=user.getAccountStatus(); user.setAccountStatus(status); user.setStatus(enabled);
        if (!enabled) sessions.deleteByUserUserId(id);
        audit.record(id,actorEmail,"STATUS_CHANGED",previous+" → "+status);
        return toResponse(userRepository.save(user));
    }
    @Transactional
    public void requestEmailChange(Long id,String email,String actorEmail) {
        List<User> admins=userRepository.findAdminsForUpdate();requireAdmin(admins,actorEmail);
        User user=userRepository.findByIdForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String normalized=UserService.normalizeEmail(email);
        if(userRepository.existsByEmail(normalized)) throw new BusinessException("Email is already registered");
        // Current address stays valid until the new inbox proves ownership.
        auth.issueLink(user,"EMAIL_CHANGE",normalized);
        audit.record(id,actorEmail,"EMAIL_CHANGE_REQUESTED","Verification requested for "+normalized);
    }
    private void requireAdmin(List<User> admins,String email) {
        if(admins.stream().noneMatch(u -> u.getEmail().equals(email) && UserService.active(u)))
            throw new BusinessException("Administrator access is no longer available");
    }

    private AdminUserResponse toResponse(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setUserId(user.getUserId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setAddress(user.getAddress());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setAccountStatus(user.getAccountStatus());
        response.setEmailVerified(user.getEmailVerified());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setCreatedAt(user.getCreatedAt());
        return response;
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
