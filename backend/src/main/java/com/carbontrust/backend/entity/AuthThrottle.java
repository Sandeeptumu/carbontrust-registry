package com.carbontrust.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="auth_throttle") @Getter @Setter @NoArgsConstructor
public class AuthThrottle {
 @Id private String bucket;
 private int attempts;
 private java.time.Instant expiresAt;
}
