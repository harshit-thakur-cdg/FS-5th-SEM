package com.example.jwt_rbac.controller;

import com.example.jwt_rbac.dto.LoginRequest;
import com.example.jwt_rbac.dto.TokenResponse;
import com.example.jwt_rbac.dto.RefreshRequest;
import com.example.jwt_rbac.security.JwtService;
import com.example.jwt_rbac.service.RefreshTokenService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final long ACCESS_TOKEN_EXPIRES_IN = 900; // 15 minutes (900 seconds)

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    // Supported demo accounts: username (lowercase) -> { password, role }
    private static final Map<String, String[]> USERS = Map.of(
            "admin",          new String[]{"admin123", "ADMIN"},
            "user",           new String[]{"user123",  "USER"},
            "harshit thakur", new String[]{"HTLT215",  "USER"},
            "harshit",        new String[]{"HTLT215",  "USER"}
    );

    public AuthController(
            JwtService jwtService,
            RefreshTokenService refreshTokenService) {
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request == null || request.getUsername() == null || request.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Username and password are required");
        }

        String normalizedUser = request.getUsername().trim().toLowerCase();
        String role = authenticate(normalizedUser, request.getPassword().trim());

        if (role == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        String displayName = request.getUsername().trim();
        String accessToken = jwtService.generateToken(displayName, role);
        String refreshToken = refreshTokenService.generateRefreshToken(displayName);

        return ResponseEntity.ok(
                new TokenResponse(accessToken, refreshToken, ACCESS_TOKEN_EXPIRES_IN)
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequest request) {
        if (request == null || request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            return ResponseEntity.badRequest().body("Refresh token is required");
        }

        try {
            String rawToken = request.getRefreshToken().trim();
            String username = refreshTokenService.getUsernameFromRefreshToken(rawToken);
            String role = getRoleForUser(username);

            RefreshTokenService.TokenPair pair = refreshTokenService.refresh(rawToken, role);

            return ResponseEntity.ok(
                    new TokenResponse(pair.accessToken(), pair.refreshToken(), ACCESS_TOKEN_EXPIRES_IN)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshRequest request) {
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            refreshTokenService.revoke(request.getRefreshToken().trim());
        }
        return ResponseEntity.ok("Refresh token revoked successfully");
    }

    private String authenticate(String username, String password) {
        String[] creds = USERS.get(username);
        if (creds != null && (creds[0].equals(password) || ("HTLT215".equals(password) && username.contains("harshit")))) {
            return creds[1];
        }
        return null;
    }

    private String getRoleForUser(String username) {
        if (username == null) return "USER";
        String normalized = username.trim().toLowerCase();
        String[] creds = USERS.get(normalized);
        if (creds != null) {
            return creds[1];
        }
        return "USER";
    }
}
