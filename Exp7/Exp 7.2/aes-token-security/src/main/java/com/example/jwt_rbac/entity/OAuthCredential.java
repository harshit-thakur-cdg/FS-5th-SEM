package com.example.jwt_rbac.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "oauth_credentials")
public class OAuthCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String provider;

    @Column(length = 2000, nullable = false)
    private String encryptedAccessToken;

    @Column(length = 2000)
    private String encryptedRefreshToken;

    private Instant accessTokenExpiry;

    public OAuthCredential() {
    }

    public OAuthCredential(
            String provider,
            String encryptedAccessToken,
            String encryptedRefreshToken,
            Instant accessTokenExpiry) {

        this.provider = provider;
        this.encryptedAccessToken = encryptedAccessToken;
        this.encryptedRefreshToken = encryptedRefreshToken;
        this.accessTokenExpiry = accessTokenExpiry;
    }

    public Long getId() {
        return id;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getEncryptedAccessToken() {
        return encryptedAccessToken;
    }

    public void setEncryptedAccessToken(String encryptedAccessToken) {
        this.encryptedAccessToken = encryptedAccessToken;
    }

    public String getEncryptedRefreshToken() {
        return encryptedRefreshToken;
    }

    public void setEncryptedRefreshToken(String encryptedRefreshToken) {
        this.encryptedRefreshToken = encryptedRefreshToken;
    }

    public Instant getAccessTokenExpiry() {
        return accessTokenExpiry;
    }

    public void setAccessTokenExpiry(Instant accessTokenExpiry) {
        this.accessTokenExpiry = accessTokenExpiry;
    }
}