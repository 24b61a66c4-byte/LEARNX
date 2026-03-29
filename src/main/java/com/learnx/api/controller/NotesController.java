package com.learnx.api.controller;

import com.learnx.persistence.model.StudyNote;
import com.learnx.persistence.service.StudyNoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notes")
@CrossOrigin(origins = "*")
public class NotesController {
    private final StudyNoteService notesService;

    @Autowired
    public NotesController(StudyNoteService notesService) {
        this.notesService = notesService;
    }

    @PostMapping
    public ResponseEntity<?> saveNote(@RequestBody StudyNote note) {
        try {
            StudyNote saved = notesService.saveNote(note);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving note: " + e.getMessage());
        }
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<?> getNote(@PathVariable Long noteId) {
        return notesService.getNoteById(noteId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotes(@PathVariable String userId) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            List<StudyNote> notes = notesService.getUserNotes(parsedUserId);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching notes");
        }
    }

    @GetMapping("/user/{userId}/topic/{topicId}")
    public ResponseEntity<?> getUserNotesByTopic(
            @PathVariable String userId,
            @PathVariable String topicId) {
        try {
            UUID parsedUserId = UUID.fromString(userId);
            List<StudyNote> notes = notesService.getUserNotesByTopic(parsedUserId, topicId);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching notes");
        }
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<?> updateNote(
            @PathVariable Long noteId,
            @RequestBody StudyNote updatedNote) {
        try {
            return notesService.getNoteById(noteId)
                    .map(existing -> {
                        existing.setTitle(updatedNote.getTitle());
                        existing.setContent(updatedNote.getContent());
                        StudyNote saved = notesService.saveNote(existing);
                        return ResponseEntity.ok(saved);
                    })
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating note");
        }
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<?> deleteNote(@PathVariable Long noteId) {
        try {
            notesService.deleteNote(noteId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting note");
        }
    }
}
