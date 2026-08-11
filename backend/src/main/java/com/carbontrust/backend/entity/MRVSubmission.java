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
@Table(name = "mrv_submissions")
public class MRVSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mrvId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @CreationTimestamp
    private LocalDateTime uploadDate;

    private String mrvStatus;

    private Boolean photoVerification;

    @Column(length = 2000)
    private String remarks;
}

