package com.learnx.core.service;

import com.learnx.core.model.ExamContext;
import com.learnx.core.model.Question;
import com.learnx.core.model.Subject;
import com.learnx.core.model.Topic;

import java.util.List;

/**
 * Serializable catalog payload loaded from JSON resources.
 */
public record CatalogData(
        List<Subject> subjects,
        List<Topic> topics,
        List<ExamContext> examContexts,
        List<Question> questions
) {

    public CatalogData {
        subjects = subjects == null ? List.of() : List.copyOf(subjects);
        topics = topics == null ? List.of() : List.copyOf(topics);
        examContexts = examContexts == null ? List.of() : List.copyOf(examContexts);
        questions = questions == null ? List.of() : List.copyOf(questions);
    }
}
