package com.learnx.api.controller;

import com.learnx.api.security.AuthContextService;
import com.learnx.api.service.AuditService;
import com.learnx.persistence.model.StudyNote;
import com.learnx.persistence.service.StudyNoteService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notes")
public class NotesController {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotesController.class);

    private final StudyNoteService notesService;
    private final AuthContextService authContextService;
    private final AuditService auditService;

    @Autowired
    public NotesController(
            StudyNoteService notesService,
            AuthContextService authContextService,
            AuditService auditService) {
        this.notesService = notesService;
        this.authContextService = authContextService;
        this.auditService = auditService;
    }

    @PostMapping
    public ResponseEntity<?> saveNote(@Valid @RequestBody StudyNote note, Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            note.setUserId(authenticatedUserId);
            StudyNote saved = notesService.saveNote(note);
            auditService.logMutation("NOTE_CREATE", authenticatedUserId, "study-note", String.valueOf(saved.getId()),
                    "Created note");
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            LOGGER.error("Error saving note for userId={}", note.getUserId(), e);
            return ResponseEntity.badRequest().body("Error saving note");
        }
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<?> getNote(@PathVariable Long noteId, Authentication authentication) {
        UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
        return notesService.getNoteById(noteId)
                .filter(note -> authenticatedUserId.equals(note.getUserId()))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotes(@PathVariable String userId, Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            UUID parsedUserId = authContextService.parseAndRequireMatch(authenticatedUserId, userId);
            List<StudyNote> notes = notesService.getUserNotes(parsedUserId);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            LOGGER.error("Error fetching notes for userId={}", userId, e);
            return ResponseEntity.badRequest().body("Error fetching notes");
        }
    }

    @GetMapping("/user/{userId}/topic/{topicId}")
    public ResponseEntity<?> getUserNotesByTopic(
            @PathVariable String userId,
            @PathVariable String topicId,
            Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            UUID parsedUserId = authContextService.parseAndRequireMatch(authenticatedUserId, userId);
            List<StudyNote> notes = notesService.getUserNotesByTopic(parsedUserId, topicId);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            LOGGER.error("Error fetching notes for userId={} topicId={}", userId, topicId, e);
            return ResponseEntity.badRequest().body("Error fetching notes");
        }
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<?> updateNote(
            @PathVariable Long noteId,
            @Valid @RequestBody StudyNote updatedNote,
            Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            return notesService.getNoteById(noteId)
                    .map(existing -> {
                        if (!authenticatedUserId.equals(existing.getUserId())) {
                            return ResponseEntity.status(403).body("Forbidden");
                        }
                        existing.setTitle(updatedNote.getTitle());
                        existing.setContent(updatedNote.getContent());
                        StudyNote saved = notesService.saveNote(existing);
                        auditService.logMutation("NOTE_UPDATE", authenticatedUserId, "study-note",
                                String.valueOf(saved.getId()), "Updated note content");
                        return ResponseEntity.ok(saved);
                    })
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            LOGGER.error("Error updating note noteId={}", noteId, e);
            return ResponseEntity.badRequest().body("Error updating note");
        }
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<?> deleteNote(@PathVariable Long noteId, Authentication authentication) {
        try {
            UUID authenticatedUserId = authContextService.requireAuthenticatedUser(authentication);
            return notesService.getNoteById(noteId)
                    .map(existing -> {
                        if (!authenticatedUserId.equals(existing.getUserId())) {
                            return ResponseEntity.status(403).body("Forbidden");
                        }
                        notesService.deleteNote(noteId);
                        auditService.logMutation("NOTE_DELETE", authenticatedUserId, "study-note",
                                String.valueOf(noteId), "Deleted note");
                        return ResponseEntity.ok().build();
                    })
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            LOGGER.error("Error deleting note noteId={}", noteId, e);
            return ResponseEntity.badRequest().body("Error deleting note");
        }
    }
}
