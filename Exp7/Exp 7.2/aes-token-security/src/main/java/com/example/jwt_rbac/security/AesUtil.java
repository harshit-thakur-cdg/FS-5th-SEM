package com.example.jwt_rbac.security;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

public class AesUtil {

    private static final String ALGORITHM =
            "AES/GCM/NoPadding";

    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH = 128;

    private final SecretKeySpec secretKey;

    public AesUtil(String base64Key) {

        byte[] keyBytes =
                Base64.getDecoder().decode(base64Key);

        if (keyBytes.length != 32) {
            throw new IllegalArgumentException(
                    "AES-256 key must be exactly 32 bytes"
            );
        }

        this.secretKey =
                new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String plainText) throws Exception {

        byte[] iv = new byte[IV_LENGTH];

        SecureRandom random =
                new SecureRandom();

        random.nextBytes(iv);

        Cipher cipher =
                Cipher.getInstance(ALGORITHM);

        GCMParameterSpec gcmSpec =
                new GCMParameterSpec(TAG_LENGTH, iv);

        cipher.init(
                Cipher.ENCRYPT_MODE,
                secretKey,
                gcmSpec
        );

        byte[] encrypted =
                cipher.doFinal(
                        plainText.getBytes(StandardCharsets.UTF_8)
                );

        // Store IV + ciphertext + authentication tag
        byte[] result =
                new byte[iv.length + encrypted.length];

        System.arraycopy(
                iv,
                0,
                result,
                0,
                iv.length
        );

        System.arraycopy(
                encrypted,
                0,
                result,
                iv.length,
                encrypted.length
        );

        return Base64.getEncoder()
                .encodeToString(result);
    }

    public String decrypt(String encryptedText)
            throws Exception {

        byte[] decoded =
                Base64.getDecoder()
                        .decode(encryptedText);

        if (decoded.length <= IV_LENGTH) {
            throw new IllegalArgumentException(
                    "Invalid encrypted data"
            );
        }

        byte[] iv =
                new byte[IV_LENGTH];

        byte[] encrypted =
                new byte[decoded.length - IV_LENGTH];

        System.arraycopy(
                decoded,
                0,
                iv,
                0,
                IV_LENGTH
        );

        System.arraycopy(
                decoded,
                IV_LENGTH,
                encrypted,
                0,
                encrypted.length
        );

        Cipher cipher =
                Cipher.getInstance(ALGORITHM);

        GCMParameterSpec gcmSpec =
                new GCMParameterSpec(TAG_LENGTH, iv);

        cipher.init(
                Cipher.DECRYPT_MODE,
                secretKey,
                gcmSpec
        );

        byte[] decrypted =
                cipher.doFinal(encrypted);

        return new String(
                decrypted,
                StandardCharsets.UTF_8
        );
    }
}