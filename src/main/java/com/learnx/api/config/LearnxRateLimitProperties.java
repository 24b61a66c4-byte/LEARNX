package com.learnx.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "learnx.rate-limit")
public class LearnxRateLimitProperties {

    private boolean enabled = true;
    private long capacity = 120;
    private long refillTokens = 120;
    private long refillMinutes = 1;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public long getCapacity() {
        return capacity;
    }

    public void setCapacity(long capacity) {
        this.capacity = capacity;
    }

    public long getRefillTokens() {
        return refillTokens;
    }

    public void setRefillTokens(long refillTokens) {
        this.refillTokens = refillTokens;
    }

    public long getRefillMinutes() {
        return refillMinutes;
    }

    public void setRefillMinutes(long refillMinutes) {
        this.refillMinutes = refillMinutes;
    }
}
