package com.example.jwt_rbac.repository;

import com.example.jwt_rbac.entity.OAuthCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OAuthCredentialRepository
        extends JpaRepository<OAuthCredential, Long> {

    Optional<OAuthCredential> findByProvider(String provider);
}