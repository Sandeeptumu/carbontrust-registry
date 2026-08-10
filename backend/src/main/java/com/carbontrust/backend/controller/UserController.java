package com.carbontrust.backend.controller;

import com.carbontrust.backend.dto.UserLoginRequest;
import jakarta.validation.Valid;
import com.carbontrust.backend.dto.UserRegistrationRequest;
import com.carbontrust.backend.entity.User;
import com.carbontrust.backend.service.UserService;
import org.springframework.web.bind.annotation.*;
import com.carbontrust.backend.dto.UserLoginResponse;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User registerUser(@RequestBody @Valid UserRegistrationRequest request) {
        return userService.registerUser(request);
    }
    @PostMapping("/login")
    public UserLoginResponse loginUser(
            @RequestBody @Valid UserLoginRequest request
    ) {
        return userService.loginUser(request);
    }

    @GetMapping("/me")
    public String getCurrentUser() {
        return "You are authenticated!";
    }

}