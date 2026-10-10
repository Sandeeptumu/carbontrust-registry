package com.carbontrust.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="security_lock") @Getter @Setter @NoArgsConstructor
public class SecurityLock {
 @Id private Long id;
}
