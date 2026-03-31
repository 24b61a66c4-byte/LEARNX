package com.learnx.api.controller;

import com.learnx.ai.model.TutorRequest;
import com.learnx.ai.model.TutorResponse;
import com.learnx.api.security.AuthContextService;
import com.learnx.api.service.AuditService;
import com.learnx.core.engine.LearnxEngine;
import com.learnx.core.service.ConversationHistoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@RestController
@RequestMapping({ "/api/v1/tutor", "/api/tutor" })
public class TutorController {

    private static final Logger LOGGER = LoggerFactory.getLogger(TutorController.class);

    private final LearnxEngine engine = LearnxEngine.createDefault();
    private final AuthContextService authContextService;
    private final AuditService auditService;
    private final ConversationHistoryService conversationHistoryService;

    public TutorController(
            AuthContextService authContextService,
            AuditService auditService,
            ConversationHistoryService conversationHistoryService) {
        this.authContextService = authContextService;
        this.auditService = auditService;
        this.conversationHistoryService = conversationHistoryService;
    }

    @PostMapping
    public TutorResponse answerDoubt(@RequestBody TutorRequest request, Authentication authentication) {
        UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);

        UUID requestLearnerId;
        try {
            requestLearnerId = UUID.fromString(request.learnerId());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(FORBIDDEN, "learnerId must match authenticated user");
        }

        if (!authenticatedUserId.equals(requestLearnerId)) {
            throw new ResponseStatusException(FORBIDDEN, "learnerId must match authenticated user");
        }

        MDC.put("userId", authenticatedUserId.toString());
        try {
            LOGGER.info("Tutor request received for learner={} subject={} topic={}", request.learnerId(),
                    request.subjectId(), request.topicId());

            engine.seedTutorConversation(
                    authenticatedUserId.toString(),
                    request.subjectId(),
                    conversationHistoryService.getRecentUserMessages(authenticatedUserId, 5));

            conversationHistoryService.saveUserMessage(authenticatedUserId, request.userQuestion());
            TutorResponse response = engine.answerDoubt(request);
            conversationHistoryService.saveAssistantMessage(authenticatedUserId, response.explanation());

            auditService.logMutation(
                    "TUTOR_QUESTION",
                    authenticatedUserId,
                    "tutor-session",
                    request.subjectId() + ":" + request.topicId(),
                    "Processed tutor question and persisted conversation history");

            return response;
        } finally {
            MDC.remove("userId");
        }
    }
}
