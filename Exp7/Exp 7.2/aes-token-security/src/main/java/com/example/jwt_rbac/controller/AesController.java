package com.example.jwt_rbac.controller;

import com.example.jwt_rbac.security.AesUtil;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/aes")
public class AesController {

    private final AesUtil aesUtil;

    public AesController(AesUtil aesUtil) {
        this.aesUtil = aesUtil;
    }

    @PostMapping("/encrypt")
    public Map<String, String> encrypt(
            @RequestBody Map<String, String> request) throws Exception {

        String plainText = request.get("text");

        if (plainText == null || plainText.isBlank()) {
            throw new IllegalArgumentException(
                    "Text cannot be empty"
            );
        }

        String encrypted = aesUtil.encrypt(plainText);

        return Map.of(
                "plainText", plainText,
                "cipherText", encrypted
        );
    }

    @PostMapping("/decrypt")
    public Map<String, String> decrypt(
            @RequestBody Map<String, String> request) throws Exception {

        String cipherText = request.get("text");

        if (cipherText == null || cipherText.isBlank()) {
            throw new IllegalArgumentException(
                    "Encrypted text cannot be empty"
            );
        }

        String decrypted = aesUtil.decrypt(cipherText);

        return Map.of(
                "cipherText", cipherText,
                "decryptedText", decrypted
        );
    }
}