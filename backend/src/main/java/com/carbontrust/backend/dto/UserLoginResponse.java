package com.carbontrust.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserLoginResponse {

    private Long userId;
    private String username;
    private String email;
    private String role;
    private String token;
}

