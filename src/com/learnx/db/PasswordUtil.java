package com.learnx.db;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/**
 * Password hashing and verification using PBKDF2-HMAC-SHA256.
 *
 * <p>100 000 iterations keeps brute-force cost high while remaining acceptable for login latency
 * (&lt;200 ms on commodity hardware).
 */
public class PasswordUtil {

    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int ITERATIONS = 100_000;
    private static final int KEY_LENGTH_BITS = 256;
    private static final int SALT_BYTES = 16;

    private PasswordUtil() {
        // utility class
    }

    /**
     * Generates a cryptographically random salt encoded as Base64.
     */
    public static String generateSalt() {
        byte[] salt = new byte[SALT_BYTES];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    /**
     * Derives a password hash from the given plain-text password and Base64-encoded salt.
     *
     * @param password plain-text password
     * @param saltBase64 Base64-encoded salt produced by {@link #generateSalt()}
     * @return Base64-encoded derived key
     */
    public static String hashPassword(String password, String saltBase64) {
        try {
            byte[] salt = Base64.getDecoder().decode(saltBase64);
            PBEKeySpec spec = new PBEKeySpec(
                    password.toCharArray(), salt, ITERATIONS, KEY_LENGTH_BITS);
            SecretKeyFactory factory = SecretKeyFactory.getInstance(ALGORITHM);
            byte[] hash = factory.generateSecret(spec).getEncoded();
            spec.clearPassword(); // wipe sensitive data from heap
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("Password hashing failed", e);
        }
    }

    /**
     * Returns {@code true} when the given plain-text password matches the stored hash.
     *
     * <p>Uses constant-time comparison to prevent timing-based side-channel attacks.
     */
    public static boolean verifyPassword(String password, String saltBase64, String expectedHash) {
        String actualHash = hashPassword(password, saltBase64);
        return constantTimeEquals(actualHash, expectedHash);
    }

    /** Constant-time string comparison to prevent timing attacks. */
    private static boolean constantTimeEquals(String a, String b) {
        byte[] aBytes = a.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        if (aBytes.length != bBytes.length) {
            return false;
        }
        int diff = 0;
        for (int i = 0; i < aBytes.length; i++) {
            diff |= aBytes[i] ^ bBytes[i];
        }
        return diff == 0;
    }
}
