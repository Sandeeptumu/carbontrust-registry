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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_verifier_id")
    private User assignedVerifier;

    private String fileName;
    private String contentType;
    private Long fileSize;
    private String sha256;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition = "LONGBLOB")
    private byte[] evidence;

    @CreationTimestamp
    private LocalDateTime uploadDate;

    private String mrvStatus;

    private Boolean photoVerification;

    @Column(length = 2000)
    private String remarks;
}

