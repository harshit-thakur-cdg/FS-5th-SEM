package com.example.jwt_rbac.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String tokenHash;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked;

    @Column(nullable = false)
    private String tokenFamily;

    public RefreshToken() {
    }

    public RefreshToken(
            String tokenHash,
            String username,
            Instant expiresAt,
            boolean revoked,
            String tokenFamily) {

        this.tokenHash = tokenHash;
        this.username = username;
        this.expiresAt = expiresAt;
        this.revoked = revoked;
        this.tokenFamily = tokenFamily;
    }

    public Long getId() {
        return id;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }

    public String getTokenFamily() {
        return tokenFamily;
    }

    public void setTokenFamily(String tokenFamily) {
        this.tokenFamily = tokenFamily;
    }
}