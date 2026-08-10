package com.carbontrust.backend.entity;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String phoneNumber;
    private String address;
    private String password;
    private String role;

    private Boolean status;

    private LocalDate dateOfBirth;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
