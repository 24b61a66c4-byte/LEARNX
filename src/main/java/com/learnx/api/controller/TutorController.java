package com.learnx.api.controller;

import com.learnx.ai.model.TutorRequest;
import com.learnx.ai.model.TutorResponse;
import com.learnx.core.engine.LearnxEngine;
import com.learnx.core.engine.LearnxEngineFactory;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tutor")
public class TutorController {

    private final LearnxEngine engine = LearnxEngine.createDefault();

    @PostMapping
    public TutorResponse answerDoubt(@RequestBody TutorRequest request) {
        return engine.answerDoubt(request);
    }
}
