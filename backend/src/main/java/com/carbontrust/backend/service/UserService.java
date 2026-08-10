package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.UserLoginRequest;
import com.carbontrust.backend.dto.UserLoginResponse;
import com.carbontrust.backend.dto.UserRegistrationRequest;
import com.carbontrust.backend.entity.User;
import com.carbontrust.backend.exception.DuplicateResourceException;
import com.carbontrust.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.carbontrust.backend.security.JwtService;

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
            throw new DuplicateResourceException("Email already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken");
        }

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setDateOfBirth(request.getDateOfBirth());

        user.setRole("BUYER");
        user.setStatus(true);

        return userRepository.save(user);
    }

    public UserLoginResponse loginUser(UserLoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid email or password");
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
}