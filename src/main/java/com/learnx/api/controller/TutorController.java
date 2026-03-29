package com.learnx.api.controller;

import com.learnx.ai.model.TutorRequest;
import com.learnx.ai.model.TutorResponse;
import com.learnx.core.engine.LearnxEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tutor")
public class TutorController {

    private static final Logger LOGGER = LoggerFactory.getLogger(TutorController.class);

    private final LearnxEngine engine = LearnxEngine.createDefault();

    @PostMapping
    public TutorResponse answerDoubt(@RequestBody TutorRequest request) {
        MDC.put("userId", request.learnerId());
        try {
            LOGGER.info("Tutor request received for learner={} subject={} topic={}", request.learnerId(),
                    request.subjectId(), request.topicId());
            return engine.answerDoubt(request);
        } finally {
            MDC.remove("userId");
        }
    }
}
