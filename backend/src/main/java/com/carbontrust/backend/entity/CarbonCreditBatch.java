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
@Table(name = "carbon_credit_batches")
public class CarbonCreditBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ccbId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    private Double originalQuantity;

    private Double availableQuantity;

    private String status;

    @CreationTimestamp
    private LocalDateTime issuedDate;
}