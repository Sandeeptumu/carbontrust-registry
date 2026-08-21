package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.CurrentUserResponse;
import com.carbontrust.backend.dto.UserLoginRequest;
import com.carbontrust.backend.dto.UserLoginResponse;
import com.carbontrust.backend.dto.UserRegistrationRequest;
import com.carbontrust.backend.entity.User;
import com.carbontrust.backend.exception.BusinessException;
import com.carbontrust.backend.exception.DuplicateResourceException;
import com.carbontrust.backend.exception.ResourceNotFoundException;
import com.carbontrust.backend.repository.UserRepository;
import com.carbontrust.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User registerUser(UserRegistrationRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already registered"
            );
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException(
                    "Username already taken"
            );
        }

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setDateOfBirth(request.getDateOfBirth());

        user.setRole("BUYER");
        user.setStatus(true);

        return userRepository.save(user);
    }

    public UserLoginResponse loginUser(UserLoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BusinessException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new BusinessException(
                    "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(
                user.getUserId(),
                user.getEmail(),
                user.getRole()
        );

        return new UserLoginResponse(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                token
        );
    }

    public CurrentUserResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        return new CurrentUserResponse(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );
    }
}