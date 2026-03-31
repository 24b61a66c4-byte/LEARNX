package com.learnx.api.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Component
public class AuthContextService {

    public UUID requireAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }

        String principalId = extractPrincipalId(authentication);
        try {
            return UUID.fromString(principalId);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Token subject must be a valid UUID");
        }
    }

    public UUID parseAndRequireMatch(UUID authenticatedUserId, String requestedUserId) {
        UUID parsed;
        try {
            parsed = UUID.fromString(requestedUserId);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user ID format");
        }

        if (!authenticatedUserId.equals(parsed)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access to requested user is forbidden");
        }
        return parsed;
    }

    private String extractPrincipalId(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String sub = jwtAuth.getToken().getClaimAsString("sub");
            if (sub != null && !sub.isBlank()) {
                return sub;
            }

            String userId = jwtAuth.getToken().getClaimAsString("user_id");
            if (userId != null && !userId.isBlank()) {
                return userId;
            }
        }

        String fallback = authentication.getName();
        if (fallback == null || fallback.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token subject is missing");
        }
        return fallback;
    }
}
