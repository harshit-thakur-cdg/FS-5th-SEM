package com.example.jwt_rbac.repository;

import com.example.jwt_rbac.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    Optional<RefreshToken> findByTokenHashAndRevokedFalse(
            String tokenHash
    );
}