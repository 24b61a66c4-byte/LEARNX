package com.learnx.core.service;

import com.learnx.core.model.ExamContext;
import com.learnx.core.model.Question;
import com.learnx.core.model.QuestionType;
import com.learnx.core.model.Subject;
import com.learnx.core.model.Topic;
import com.learnx.core.store.CatalogStore;
import com.learnx.core.store.JsonCatalogStore;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CatalogServiceTest {

    @Test
    void loadsValidCatalogFromJsonStore() {
        CatalogService catalogService = new CatalogService(new JsonCatalogStore());

        assertEquals(3, catalogService.getSubjects().size());
        assertEquals(3, catalogService.getTopicsForSubject("dbms").size());
        assertEquals(3, catalogService.getTopicsForSubject("coding").size());
        assertEquals(1, catalogService.getQuestionsForTopic("dbms-joins").size());
        assertEquals(1, catalogService.getQuestionsForTopic("coding-variables").size());
    }

    @Test
    void rejectsDuplicateTopicIds() {
        CatalogStore store = () -> new CatalogData(
                List.of(subject("dbms")),
                List.of(
                        topic("sql-1", "dbms"),
                        topic("sql-1", "dbms")),
                List.of(),
                List.of());

        assertThrows(CatalogValidationException.class, () -> new CatalogService(store));
    }

    @Test
    void rejectsMissingPrerequisiteReferences() {
        CatalogStore store = () -> new CatalogData(
                List.of(subject("dbms")),
                List.of(topic("joins", "dbms", "sql-basics")),
                List.of(),
                List.of());

        assertThrows(CatalogValidationException.class, () -> new CatalogService(store));
    }

    @Test
    void rejectsCyclicPrerequisites() {
        CatalogStore store = () -> new CatalogData(
                List.of(subject("dbms")),
                List.of(
                        topic("a", "dbms", "b"),
                        topic("b", "dbms", "a")),
                List.of(),
                List.of());

        assertThrows(CatalogValidationException.class, () -> new CatalogService(store));
    }

    private Subject subject(String id) {
        return new Subject(id, id.toUpperCase(), "Test subject", List.of("tag"));
    }

    private Topic topic(String id, String subjectId, String... prerequisiteIds) {
        return new Topic(id, subjectId, id, "Topic", List.of(prerequisiteIds), 0.3, 0.8, List.of("tag"));
    }
}
