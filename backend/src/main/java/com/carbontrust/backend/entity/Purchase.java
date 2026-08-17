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
@Table(name = "purchases")
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long purchaseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ccb_id", nullable = false)
    private CarbonCreditBatch carbonCreditBatch;

    private Double quantity;

    private Double price;

    private String paymentStatus;

    private String paymentMethod;

    @CreationTimestamp
    private LocalDateTime purchaseDate;
}