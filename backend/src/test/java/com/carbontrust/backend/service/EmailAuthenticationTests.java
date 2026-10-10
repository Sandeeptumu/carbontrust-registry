package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.UserRegistrationRequest;
import com.carbontrust.backend.entity.User;
import com.carbontrust.backend.repository.UserRepository;
import com.carbontrust.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;

class EmailAuthenticationTests {
    @Test void registrationCannotGrantPrivileges() {
        UserRepository users = mock(UserRepository.class);
        when(users.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        UserService service = new UserService(users, new BCryptPasswordEncoder(), mock(AuthSessionRepository.class), mock(EmailTokenRepository.class), mock(AccountMailer.class), mock(AccountAuditService.class));
        UserRegistrationRequest request = new UserRegistrationRequest();
        request.setPasswordConfirmation("LongPassword123!"); request.setUsername("forest"); request.setEmail("FOREST@example.test"); request.setPassword("LongPassword123!");
        User saved = service.registerUser(request);
        assertEquals("USER", saved.getRole());
        assertEquals("forest@example.test", saved.getEmail());
        assertNotEquals(request.getPassword(), saved.getPassword());
    }
}
