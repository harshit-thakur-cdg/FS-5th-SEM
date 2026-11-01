package com.example.jwt_rbac.controller;

import com.example.jwt_rbac.dto.LoginRequest;
import com.example.jwt_rbac.dto.LoginResponse;
import com.example.jwt_rbac.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtService jwtService;

    /* In-memory credential store: username -> { password, role } */
    private static final Map<String, String[]> USERS = Map.of(
            "admin",          new String[]{"admin123", "ADMIN"},
            "user",           new String[]{"user123",  "USER"},
            "harshit thakur", new String[]{"HTLT215",  "USER"},
            "harshit",        new String[]{"HTLT215",  "USER"}
    );

    public AuthController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request == null || request.username() == null || request.password() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Username and password are required");
        }

        String normalizedUser = request.username().trim().toLowerCase();
        String[] credentials = USERS.get(normalizedUser);

        if (credentials == null || !credentials[0].equals(request.password())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        String token = jwtService.generateToken(request.username().trim(), credentials[1]);
        return ResponseEntity.ok(new LoginResponse(token));
    }
}
