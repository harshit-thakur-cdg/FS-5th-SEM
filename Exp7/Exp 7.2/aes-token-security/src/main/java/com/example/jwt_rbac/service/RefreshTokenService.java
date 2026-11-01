package com.example.jwt_rbac.service;

import com.example.jwt_rbac.entity.RefreshToken;
import com.example.jwt_rbac.repository.RefreshTokenRepository;
import com.example.jwt_rbac.security.JwtService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    private final SecureRandom secureRandom =
            new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            JwtService jwtService) {

        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
    }

    public String generateRefreshToken(String username) {

        String rawToken = generateSecureRandomToken();

        String tokenHash = hashToken(rawToken);

        String tokenFamily = UUID.randomUUID().toString();

        RefreshToken refreshToken =
                new RefreshToken(
                        tokenHash,
                        username,
                        Instant.now().plus(7, ChronoUnit.DAYS),
                        false,
                        tokenFamily
                );

        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    @Transactional
    public TokenPair refresh(
            String rawRefreshToken,
            String role) {

        String tokenHash =
                hashToken(rawRefreshToken);

        RefreshToken stored =
                refreshTokenRepository
                        .findByTokenHash(tokenHash)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid refresh token"
                                )
                        );

        // Reuse detection
        if (stored.isRevoked()) {

            revokeTokenFamily(
                    stored.getTokenFamily()
            );

            throw new RuntimeException(
                    "Refresh token reuse detected"
            );
        }

        // Expiration check
        if (stored.getExpiresAt()
                .isBefore(Instant.now())) {

            stored.setRevoked(true);

            refreshTokenRepository.save(stored);

            throw new RuntimeException(
                    "Refresh token expired"
            );
        }

        // Rotate old refresh token
        stored.setRevoked(true);

        refreshTokenRepository.save(stored);

        // New access token
        String newAccessToken =
                jwtService.generateToken(
                        stored.getUsername(),
                        role
                );

        // New refresh token
        String newRefreshToken =
                generateRefreshTokenWithFamily(
                        stored.getUsername(),
                        stored.getTokenFamily()
                );

        return new TokenPair(
                newAccessToken,
                newRefreshToken
        );
    }

    public void revoke(String rawRefreshToken) {

        String tokenHash =
                hashToken(rawRefreshToken);

        refreshTokenRepository
                .findByTokenHash(tokenHash)
                .ifPresent(token -> {

                    token.setRevoked(true);

                    refreshTokenRepository.save(token);
                });
    }

    private String generateRefreshTokenWithFamily(
            String username,
            String tokenFamily) {

        String rawToken =
                generateSecureRandomToken();

        String tokenHash =
                hashToken(rawToken);

        RefreshToken newToken =
                new RefreshToken(
                        tokenHash,
                        username,
                        Instant.now().plus(7, ChronoUnit.DAYS),
                        false,
                        tokenFamily
                );

        refreshTokenRepository.save(newToken);

        return rawToken;
    }

    private void revokeTokenFamily(
            String tokenFamily) {

        refreshTokenRepository
                .findAll()
                .stream()
                .filter(token ->
                        token.getTokenFamily()
                                .equals(tokenFamily)
                )
                .forEach(token -> {

                    token.setRevoked(true);

                    refreshTokenRepository.save(token);
                });
    }

    private String generateSecureRandomToken() {

        byte[] bytes = new byte[32];

        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hashToken(String token) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            token.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return HexFormat.of().formatHex(hash);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to hash refresh token",
                    e
            );
        }
    }

    public record TokenPair(
            String accessToken,
            String refreshToken
    ) {
    }

public String getUsernameFromRefreshToken(
        String rawRefreshToken) {

    String tokenHash = hashToken(rawRefreshToken);

    RefreshToken stored =
            refreshTokenRepository
                    .findByTokenHash(tokenHash)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Invalid refresh token"
                            )
                    );

    return stored.getUsername();
}
}