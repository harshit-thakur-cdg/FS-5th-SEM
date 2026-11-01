package com.example.jwt_rbac.config;

import com.example.jwt_rbac.security.AesUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Base64;

@Configuration
public class AesConfig {

    // Default 32-byte (256-bit) AES key in Base64 (0123456789abcdef0123456789abcdef)
    private static final String DEFAULT_BASE64_KEY =
            "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    @Bean
    public AesUtil aesUtil(
            @Value("${app.aes.secret-key:}") String propertyKey) {

        String key = System.getenv("AES_SECRET_KEY");

        if (key == null || key.isBlank()) {
            key = propertyKey;
        }

        if (key == null || key.isBlank()) {
            key = DEFAULT_BASE64_KEY;
        }

        // Validate key length (must be 32 bytes when base64 decoded)
        try {
            byte[] decoded = Base64.getDecoder().decode(key);
            if (decoded.length != 32) {
                key = DEFAULT_BASE64_KEY;
            }
        } catch (IllegalArgumentException e) {
            key = DEFAULT_BASE64_KEY;
        }

        return new AesUtil(key);
    }
}
