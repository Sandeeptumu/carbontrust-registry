package com.carbontrust.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="account_audit") @Getter @Setter @NoArgsConstructor
public class AccountAudit {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private Long userId;
 private String actorEmail;
 private String action;
 @Column(length=2000) private String detail;
 private java.time.Instant createdAt = java.time.Instant.now();
}
