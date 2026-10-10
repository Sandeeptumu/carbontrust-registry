package com.carbontrust.backend.service;

import com.carbontrust.backend.entity.User;
import com.carbontrust.backend.exception.BusinessException;
import com.carbontrust.backend.exception.ResourceNotFoundException;
import com.carbontrust.backend.exception.RoleConflictException;
import com.carbontrust.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminServiceTests {
    UserRepository users;
    AdminService service;
    User admin;
    User target;

    @BeforeEach void setup() {
        users = mock(UserRepository.class);
        service = new AdminService(users, mock(ProjectRepository.class), mock(CarbonCreditBatchRepository.class),
                mock(PurchaseRepository.class), mock(CarbonCreditRetirementRepository.class), mock(AccountAuditService.class), mock(AuthSessionRepository.class), mock(UserService.class));
        admin = account(1L, "admin@example.test", "ADMIN");
        target = account(2L, "member@example.test", "USER");
        when(users.findAdminsForUpdate()).thenReturn(List.of(admin));
        when(users.findByIdForUpdate(1L)).thenReturn(Optional.of(admin));
        when(users.findByIdForUpdate(2L)).thenReturn(Optional.of(target));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @ParameterizedTest
    @ValueSource(strings = {"ADMIN", "NGO", "VERIFIER", "USER", "HEALTHCARE_ASSISTANT"})
    void assignsEverySupportedRole(String role) {
        var response = service.updateRole(2L, role, "USER", admin.getEmail());
        assertEquals(role, response.getRole());
        assertEquals(2L, response.getUserId());
        verify(users).save(target);
    }

    @Test void rejectsUnknownRole() {
        assertThrows(BusinessException.class, () -> service.updateRole(2L, "SUPER_ADMIN", "USER", admin.getEmail()));
        verify(users, never()).save(any());
    }

    @Test void rejectsNullRole() {
        assertThrows(BusinessException.class, () -> service.updateRole(2L, null, "USER", admin.getEmail()));
    }

    @Test void preventsSelfDemotion() {
        assertThrows(BusinessException.class, () -> service.updateRole(1L, "USER", "ADMIN", admin.getEmail()));
        assertEquals("ADMIN", admin.getRole());
        verify(users, never()).save(any());
    }

    @Test void canDemoteAnotherAdministrator() {
        target.setRole("ADMIN");
        when(users.findAdminsForUpdate()).thenReturn(List.of(admin, target));
        assertEquals("VERIFIER", service.updateRole(2L, "VERIFIER", "ADMIN", admin.getEmail()).getRole());
    }

    @Test void preventsStaleEdits() {
        target.setRole("NGO");
        assertThrows(RoleConflictException.class, () -> service.updateRole(2L, "ADMIN", "USER", admin.getEmail()));
        verify(users, never()).save(any());
    }

    @Test void rejectsMissingAccount() {
        when(users.findByIdForUpdate(9L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.updateRole(9L, "USER", "USER", admin.getEmail()));
    }

    @Test void rechecksDemotedActor() {
        when(users.findAdminsForUpdate()).thenReturn(List.of());
        assertThrows(BusinessException.class, () -> service.updateRole(2L, "ADMIN", "USER", admin.getEmail()));
        verify(users, never()).save(any());
    }

    @Test void rejectsInactiveActor() {
        admin.setStatus(false);
        assertThrows(BusinessException.class, () -> service.updateRole(2L, "ADMIN", "USER", admin.getEmail()));
    }

    static User account(Long id, String email, String role) {
        User user = new User(); user.setUserId(id); user.setEmail(email); user.setRole(role); user.setStatus(true); user.setEmailVerified(true); user.setAccountStatus("ACTIVE");
        return user;
    }
}
