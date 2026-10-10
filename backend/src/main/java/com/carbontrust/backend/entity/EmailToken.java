package com.carbontrust.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="email_token") @Getter @Setter @NoArgsConstructor
public class EmailToken {
 @Id private String tokenHash;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="user_id",nullable=false) private User user;
 @Column(nullable=false) private String purpose;
 private String targetEmail;
 @Column(nullable=false) private java.time.Instant expiresAt;
 private java.time.Instant usedAt;
}
