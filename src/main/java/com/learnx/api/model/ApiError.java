package com.learnx.api.model;

import java.time.Instant;

public record ApiError(
        String errorType,
        String message,
        String requestId,
        Instant timestamp) {
}
