package com.learnx.api.exception;

import com.learnx.api.filter.RequestContextFilter;
import com.learnx.api.model.ApiError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleValidation(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(buildError("VALIDATION_ERROR", exception.getMessage()));
    }

    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<ApiError> handleAi(AiServiceException exception) {
        LOGGER.error("AI service failure", exception);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(buildError("AI_ERROR", "Tutor service is temporarily unavailable. Please try again."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnhandled(Exception exception) {
        LOGGER.error("Unhandled API failure", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError("SERVER_ERROR", "An internal error occurred. Please retry shortly."));
    }

    private ApiError buildError(String type, String message) {
        return new ApiError(
                type,
                message,
                MDC.get(RequestContextFilter.REQUEST_ID_KEY),
                Instant.now());
    }
}
