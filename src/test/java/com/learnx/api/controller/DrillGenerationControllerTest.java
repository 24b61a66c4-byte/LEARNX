package com.learnx.api.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DrillGenerationControllerTest {

    private final DrillGenerationController controller = new DrillGenerationController();

    @Test
    void generatesCodingDrillsWithPreferredTopicBias() {
        DrillGenerationController.GenerateDrillRequest request = new DrillGenerationController.GenerateDrillRequest();
        request.subjectId = "coding";
        request.preferredTopicIds = List.of("coding-variables");
        request.questionCount = 3;
        request.age = 12;
        request.level = "beginner";

        ResponseEntity<?> response = controller.generate(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        DrillGenerationController.GenerateDrillResponse body = (DrillGenerationController.GenerateDrillResponse) response
                .getBody();
        assertNotNull(body);
        assertEquals("coding", body.subjectId());
        assertTrue(body.totalQuestions() > 0);
        assertTrue(body.questions().stream().anyMatch(question -> "coding-variables".equals(question.topicId())));
    }

    @Test
    void rejectsMissingSubjectId() {
        DrillGenerationController.GenerateDrillRequest request = new DrillGenerationController.GenerateDrillRequest();
        request.subjectId = " ";

        ResponseEntity<?> response = controller.generate(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
