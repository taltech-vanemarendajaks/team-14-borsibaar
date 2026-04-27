package com.borsibaar.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organizations")
@Getter
@Setter
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @ElementCollection
    @CollectionTable(name = "organization_auth_emails", joinColumns = @JoinColumn(name = "organization_id", nullable = false))
    @Column(name = "email", nullable = false)
    private List<String> authEmails = new ArrayList<>();

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "price_increase_step", precision = 19, scale = 4)
    private BigDecimal priceIncreaseStep;

    @Column(name = "price_decrease_step", precision = 19, scale = 4)
    private BigDecimal priceDecreaseStep;
}
