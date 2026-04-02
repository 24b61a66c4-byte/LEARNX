package com.learnx.core.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubjectServiceTest {

    @Mock
    private SubjectRepository repository;

    @InjectMocks
    private SubjectService subjectService;

    @Test
    void resolvesCodingInterestsToCodingSubject() {
        when(repository.findAllActive()).thenReturn(List.of(
                subject("dbms", List.of("math", "patterns"), 1),
                subject("edc", List.of("science", "experiments"), 2),
                subject("coding", List.of("coding", "programming", "logic"), 3)
        ));

        String resolved = subjectService.resolvePreferredSubjectId(new String[] {"coding logic", "games"});

        assertEquals("coding", resolved);
    }

    @Test
    void normalizesRouteStyleSubjectAliases() {
        assertEquals("dbms", subjectService.normalizeSubjectId("mathematics"));
        assertEquals("edc", subjectService.normalizeSubjectId("science"));
        assertEquals("coding", subjectService.normalizeSubjectId("programming"));
    }

    private SubjectService.SubjectDTO subject(String id, List<String> tags, int displayOrder) {
        return new SubjectService.SubjectDTO(
                id,
                id.toUpperCase(),
                "Test subject",
                tags,
                "",
                "",
                displayOrder
        );
    }
}
