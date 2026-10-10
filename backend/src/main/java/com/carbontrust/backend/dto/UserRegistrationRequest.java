package com.carbontrust.backend.dto;
import jakarta.validation.constraints.*;
import lombok.*;
@Getter @Setter @NoArgsConstructor
public class UserRegistrationRequest {
 @NotBlank @Size(min=3,max=30) @Pattern(regexp="[A-Za-z0-9_.-]+") private String username;
 @NotBlank @Email @Size(max=254) private String email;
 @NotBlank @Size(min=12,max=64) private String password;
 @NotBlank private String passwordConfirmation;
}
