package com.learnx.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "learnx.security.jwt")
public class LearnxJwtProperties {

    private String issuerUri;
    private String jwkSetUri;
    private String secret;

    public String getIssuerUri() {
        return issuerUri;
    }

    public void setIssuerUri(String issuerUri) {
        this.issuerUri = issuerUri;
    }

    public String getJwkSetUri() {
        return jwkSetUri;
    }

    public void setJwkSetUri(String jwkSetUri) {
        this.jwkSetUri = jwkSetUri;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public boolean hasIssuerUri() {
        return issuerUri != null && !issuerUri.isBlank();
    }

    public boolean hasJwkSetUri() {
        return jwkSetUri != null && !jwkSetUri.isBlank();
    }

    public boolean hasSecret() {
        return secret != null && !secret.isBlank();
    }
}
