package com.example.jwt_rbac.dto;

public class TokenResponse {

    private String accessToken;
    private String refreshToken;
    private long expiresIn;

    public TokenResponse(
            String accessToken,
            String refreshToken,
            long expiresIn) {

        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public long getExpiresIn() {
        return expiresIn;
    }
}