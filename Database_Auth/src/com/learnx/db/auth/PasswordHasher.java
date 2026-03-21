package com.learnx.db.auth;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility class for password hashing and verification.
 *
 * <p>Passwords are stored as a Base64-encoded string in the format:
 * {@code <base64-salt>:<base64-hash>}
 *
 * <p><strong>Note:</strong> In production, replace this implementation with
 * a well-vetted library such as <a href="https://github.com/patrickfav/bcrypt">BCrypt</a>
 * or <a href="https://github.com/p-h-c/phc-winner-argon2">Argon2</a>.
 * This placeholder uses PBKDF2 via {@link javax.crypto.SecretKeyFactory}.
 */
public class PasswordHasher {

    private static final int SALT_BYTES    = 16;
    private static final int ITERATIONS    = 100_000;
    private static final int KEY_LENGTH    = 256; // bits
    private static final String ALGORITHM  = "PBKDF2WithHmacSHA256";

    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordHasher() {}

    /**
     * Hashes a raw password and returns a storable encoded string.
     *
     * @param rawPassword the plain-text password supplied by the user
     * @return an encoded string containing both salt and hash
     */
    public static String hash(String rawPassword) {
        byte[] salt = new byte[SALT_BYTES];
        RANDOM.nextBytes(salt);
        byte[] hash = pbkdf2(rawPassword.toCharArray(), salt);
        return Base64.getEncoder().encodeToString(salt)
                + ":" + Base64.getEncoder().encodeToString(hash);
    }

    /**
     * Verifies a raw password against a previously stored encoded string.
     *
     * @param rawPassword the plain-text password to verify
     * @param stored      the encoded string returned by {@link #hash(String)}
     * @return {@code true} if the password matches
     */
    public static boolean verify(String rawPassword, String stored) {
        String[] parts = stored.split(":");
        if (parts.length != 2) return false;
        byte[] salt       = Base64.getDecoder().decode(parts[0]);
        byte[] storedHash = Base64.getDecoder().decode(parts[1]);
        byte[] inputHash  = pbkdf2(rawPassword.toCharArray(), salt);
        return slowEquals(storedHash, inputHash);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private static byte[] pbkdf2(char[] password, byte[] salt) {
        try {
            javax.crypto.spec.PBEKeySpec spec =
                    new javax.crypto.spec.PBEKeySpec(password, salt, ITERATIONS, KEY_LENGTH);
            javax.crypto.SecretKeyFactory factory =
                    javax.crypto.SecretKeyFactory.getInstance(ALGORITHM);
            return factory.generateSecret(spec).getEncoded();
        } catch (Exception e) {
            throw new IllegalStateException("Password hashing failed", e);
        }
    }

    /** Constant-time comparison to prevent timing attacks. */
    private static boolean slowEquals(byte[] a, byte[] b) {
        if (a.length != b.length) return false;
        int diff = 0;
        for (int i = 0; i < a.length; i++) {
            diff |= a[i] ^ b[i];
        }
        return diff == 0;
    }
}
