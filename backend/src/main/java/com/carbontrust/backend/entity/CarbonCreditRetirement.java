package com.carbontrust.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "carbon_credit_retirements")
public class CarbonCreditRetirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long retirementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_id", nullable = false)
    private Purchase purchase;

    private Double quantity;

    @Column(length = 2000)
    private String reason;

    @CreationTimestamp
    private LocalDateTime retirementDate;
}