package com.carbontrust.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class AdminUserResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String phoneNumber;
    private String address;
    private String role;
    private Boolean status;
    private String accountStatus;
    private Boolean emailVerified;
    private LocalDate dateOfBirth;
    private LocalDateTime createdAt;
}
