package com.learnx.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditService {

    private static final Logger AUDIT_LOGGER = LoggerFactory.getLogger("AUDIT");

    public void logMutation(String action, UUID actorUserId, String resourceType, String resourceId, String details) {
        AUDIT_LOGGER.info(
                "audit action={} actorUserId={} resourceType={} resourceId={} details={}",
                action,
                actorUserId,
                resourceType,
                resourceId,
                details == null ? "" : details);
    }
}
