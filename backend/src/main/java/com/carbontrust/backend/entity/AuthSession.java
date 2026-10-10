package com.carbontrust.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="auth_session") @Getter @Setter @NoArgsConstructor
public class AuthSession {
 @Id private String tokenHash;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="user_id",nullable=false) private User user;
 @Column(nullable=false) private java.time.Instant expiresAt;
}
