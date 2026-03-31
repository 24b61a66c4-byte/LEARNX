package com.learnx.api.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnx.api.config.LearnxRateLimitProperties;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final LearnxRateLimitProperties properties;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitFilter(LearnxRateLimitProperties properties) {
        this.properties = properties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (!properties.isEnabled()) {
            return true;
        }
        if (path == null || !path.startsWith("/api/")) {
            return true;
        }
        return path.startsWith("/api/v1/health");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String bucketKey = resolveBucketKey(request);
        Bucket bucket = buckets.computeIfAbsent(bucketKey, ignored -> newBucket());

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (!probe.isConsumed()) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(OBJECT_MAPPER.writeValueAsString(Map.of(
                    "type", "RATE_LIMITED",
                    "message", "Too many requests. Please retry later.")));
            return;
        }

        response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
        filterChain.doFilter(request, response);
    }

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.classic(
                Math.max(1L, properties.getCapacity()),
                Refill.greedy(
                        Math.max(1L, properties.getRefillTokens()),
                        Duration.ofMinutes(Math.max(1L, properties.getRefillMinutes()))));
        return Bucket.builder().addLimit(limit).build();
    }

    private String resolveBucketKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String name = auth.getName();
            try {
                return "user:" + UUID.fromString(name);
            } catch (IllegalArgumentException ignored) {
                return "user:" + name;
            }
        }
        return "ip:" + request.getRemoteAddr();
    }
}
