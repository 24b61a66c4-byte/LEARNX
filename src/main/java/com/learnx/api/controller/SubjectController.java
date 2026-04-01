package com.learnx.api.controller;

import com.learnx.core.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for subjects
 * Endpoint for frontend to fetch available subjects dynamically
 */
@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = { "http://localhost:3001", "http://localhost:3000" })
public class SubjectController {

    private final SubjectService subjectService;

    @Autowired
    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    /**
     * GET /api/subjects
     * Returns list of all active subjects
     */
    @GetMapping
    public ResponseEntity<List<SubjectService.SubjectDTO>> getAllSubjects() {
        List<SubjectService.SubjectDTO> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }

    /**
     * GET /api/subjects/{id}
     * Returns a specific subject by ID
     * Supports legacy IDs (dbms, edc) for backward compatibility
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubjectService.SubjectDTO> getSubjectById(@PathVariable String id) {
        return subjectService.getSubjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/subjects/resolve-from-interests
     * Resolve preferred subject based on user interests
     */
    @PostMapping("/resolve-from-interests")
    public ResponseEntity<String> resolvePreferredSubject(@RequestBody String[] interests) {
        String subjectId = subjectService.resolvePreferredSubjectId(interests);
        return ResponseEntity.ok(subjectId);
    }
}
