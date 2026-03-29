package com.learnx.ai.service;

import com.learnx.ai.model.SearchResult;
import com.learnx.ai.model.TutorRequest;
import com.learnx.ai.model.TutorResponse;
import com.learnx.ai.provider.AiProvider;
import com.learnx.ai.provider.FallbackAiProvider;
import com.learnx.ai.search.SearchProvider;
import com.learnx.core.model.LearnerProfile;
import com.learnx.core.model.PerformanceSnapshot;
import com.learnx.core.service.CatalogService;
import com.learnx.core.store.JsonCatalogStore;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TutorServiceTest {

        @Test
        void returnsGroundedTutorResponseWithCitations() {
                CatalogService catalogService = new CatalogService(new JsonCatalogStore());
                SearchProvider searchProvider = query -> List.of(
                                new SearchResult("SQL Guide", "https://example.com/sql", "WHERE filters rows", "test",
                                                0.9));
                AiProvider aiProvider = prompt -> new TutorResponse(
                                "SQL uses WHERE to filter rows.",
                                "1. Define WHERE\n2. Show syntax\n3. Give example",
                                List.of("WHERE filters rows", "Use SELECT ... WHERE"),
                                List.of(),
                                false);

                TutorService tutorService = new TutorService(catalogService, searchProvider, aiProvider,
                                new FallbackAiProvider(), 2000, false);
                TutorResponse response = tutorService.answerQuestion(
                                new TutorRequest("learner-1", "dbms", "dbms-sql-basics", "dbms-jntu-r22",
                                                "Explain WHERE clause", 3),
                                new LearnerProfile("learner-1", "Ricky", 15),
                                new PerformanceSnapshot(0.6, 0.7, 2.0, List.of("dbms-joins"), List.of(), Map.of()));

                assertFalse(response.fallback());
                assertEquals(1, response.citations().size());
                assertTrue(response.aiResponse().latencyMs() >= 0);
        }

        @Test
        void fallsBackWhenPrimaryAiProviderFails() {
                CatalogService catalogService = new CatalogService(new JsonCatalogStore());
                SearchProvider searchProvider = query -> List.of();
                AiProvider failingProvider = prompt -> {
                        throw new IllegalStateException("AI unavailable");
                };

                TutorService tutorService = new TutorService(catalogService, searchProvider, failingProvider,
                                new FallbackAiProvider(), 2000, false);
                TutorResponse response = tutorService.answerQuestion(
                                new TutorRequest("learner-1", "dbms", "dbms-sql-basics", "", "Explain SQL basics", 3),
                                new LearnerProfile("learner-1", "Ricky", 15),
                                new PerformanceSnapshot(0.0, 0.0, 0.0, List.of(), List.of(), Map.of()));

                assertTrue(response.fallback());
                assertFalse(response.explanation().isBlank());
        }

        @Test
        void rejectsUnsafeQuestionByWholeWord() {
                CatalogService catalogService = new CatalogService(new JsonCatalogStore());
                SearchProvider searchProvider = query -> List.of();
                AiProvider aiProvider = prompt -> new TutorResponse("ok", "outline", List.of("k1"), List.of(), false);

                TutorService tutorService = new TutorService(catalogService, searchProvider, aiProvider,
                                new FallbackAiProvider(), 2000, false);

                assertThrows(IllegalArgumentException.class, () -> tutorService.answerQuestion(
                                new TutorRequest("learner-1", "dbms", "dbms-sql-basics", "", "How to kill a process",
                                                3),
                                new LearnerProfile("learner-1", "Ricky", 15),
                                new PerformanceSnapshot(0.0, 0.0, 0.0, List.of(), List.of(), Map.of())));
        }

        @Test
        void allowsSafeWordsContainingBlockedSubstring() {
                CatalogService catalogService = new CatalogService(new JsonCatalogStore());
                SearchProvider searchProvider = query -> List.of();
                AiProvider aiProvider = prompt -> new TutorResponse("ok", "outline", List.of("k1"), List.of(), false);

                TutorService tutorService = new TutorService(catalogService, searchProvider, aiProvider,
                                new FallbackAiProvider(), 2000, false);

                TutorResponse response = tutorService.answerQuestion(
                                new TutorRequest("learner-1", "dbms", "dbms-sql-basics", "",
                                                "What SQL skill should I learn first?", 3),
                                new LearnerProfile("learner-1", "Ricky", 15),
                                new PerformanceSnapshot(0.0, 0.0, 0.0, List.of(), List.of(), Map.of()));

                assertFalse(response.explanation().isBlank());
        }
}
