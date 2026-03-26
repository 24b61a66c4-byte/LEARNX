package com.learnx.core.service;

import com.learnx.core.model.ExamContext;
import com.learnx.core.model.Question;
import com.learnx.core.model.Subject;
import com.learnx.core.model.Topic;
import com.learnx.core.store.CatalogStore;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Provides validated access to the immutable LearnX catalog.
 */
public class CatalogService {

    private final CatalogData catalogData;
    private final Map<String, Subject> subjectsById;
    private final Map<String, Topic> topicsById;
    private final Map<String, ExamContext> examContextsById;
    private final Map<String, Question> questionsById;
    private final Map<String, List<Topic>> topicsBySubjectId;
    private final Map<String, List<Question>> questionsByTopicId;

    public CatalogService(CatalogStore catalogStore) {
        this.catalogData = catalogStore.loadCatalog();
        validate(catalogData);
        this.subjectsById = indexById(catalogData.subjects(), Subject::id);
        this.topicsById = indexById(catalogData.topics(), Topic::id);
        this.examContextsById = indexById(catalogData.examContexts(), ExamContext::id);
        this.questionsById = indexById(catalogData.questions(), Question::id);
        this.topicsBySubjectId = groupTopicsBySubject(catalogData.topics());
        this.questionsByTopicId = groupQuestionsByTopic(catalogData.questions());
    }

    public List<Subject> getSubjects() {
        return catalogData.subjects();
    }

    public Subject getSubject(String subjectId) {
        return findSubject(subjectId)
                .orElseThrow(() -> new CatalogValidationException("Unknown subjectId: " + subjectId));
    }

    public Optional<Subject> findSubject(String subjectId) {
        return Optional.ofNullable(subjectsById.get(subjectId));
    }

    public List<Topic> getTopicsForSubject(String subjectId) {
        return topicsBySubjectId.getOrDefault(subjectId, List.of());
    }

    public Topic getTopic(String topicId) {
        return findTopic(topicId)
                .orElseThrow(() -> new CatalogValidationException("Unknown topicId: " + topicId));
    }

    public Optional<Topic> findTopic(String topicId) {
        return Optional.ofNullable(topicsById.get(topicId));
    }

    public List<Topic> getPrerequisites(String topicId) {
        Topic topic = getTopic(topicId);
        return topic.prerequisiteIds().stream()
                .map(this::getTopic)
                .toList();
    }

    public List<Question> getQuestionsForTopic(String topicId) {
        return questionsByTopicId.getOrDefault(topicId, List.of());
    }

    public Question getQuestion(String questionId) {
        Question question = questionsById.get(questionId);
        if (question == null) {
            throw new CatalogValidationException("Unknown questionId: " + questionId);
        }
        return question;
    }

    public List<Question> getQuestionsForSubject(String subjectId) {
        return catalogData.questions().stream()
                .filter(question -> question.subjectId().equals(subjectId))
                .toList();
    }

    public Optional<ExamContext> findExamContext(String examContextId) {
        return Optional.ofNullable(examContextsById.get(examContextId));
    }

    public ExamContext getExamContext(String examContextId) {
        return findExamContext(examContextId)
                .orElseThrow(() -> new CatalogValidationException("Unknown examContextId: " + examContextId));
    }

    public List<Topic> getFocusedTopics(String examContextId) {
        return getExamContext(examContextId).focusTopicIds().stream()
                .map(this::getTopic)
                .toList();
    }

    public CatalogData getCatalogData() {
        return catalogData;
    }

    private static <T> Map<String, T> indexById(List<T> items, Function<T, String> keyExtractor) {
        Map<String, T> result = new LinkedHashMap<>();
        for (T item : items) {
            result.put(keyExtractor.apply(item), item);
        }
        return result;
    }

    private static Map<String, List<Topic>> groupTopicsBySubject(List<Topic> topics) {
        return topics.stream()
                .collect(Collectors.groupingBy(Topic::subjectId, LinkedHashMap::new, Collectors.toList()));
    }

    private static Map<String, List<Question>> groupQuestionsByTopic(List<Question> questions) {
        return questions.stream()
                .collect(Collectors.groupingBy(Question::topicId, LinkedHashMap::new, Collectors.toList()));
    }

    private static void validate(CatalogData catalogData) {
        validateDuplicates("subject", catalogData.subjects().stream().map(Subject::id).toList());
        validateDuplicates("topic", catalogData.topics().stream().map(Topic::id).toList());
        validateDuplicates("examContext", catalogData.examContexts().stream().map(ExamContext::id).toList());
        validateDuplicates("question", catalogData.questions().stream().map(Question::id).toList());

        Map<String, Subject> subjects = catalogData.subjects().stream()
                .collect(Collectors.toMap(Subject::id, Function.identity(), (left, right) -> left, LinkedHashMap::new));
        Map<String, Topic> topics = catalogData.topics().stream()
                .collect(Collectors.toMap(Topic::id, Function.identity(), (left, right) -> left, LinkedHashMap::new));

        for (Topic topic : catalogData.topics()) {
            if (!subjects.containsKey(topic.subjectId())) {
                throw new CatalogValidationException("Topic references missing subject: " + topic.id());
            }
            for (String prerequisiteId : topic.prerequisiteIds()) {
                Topic prerequisite = topics.get(prerequisiteId);
                if (prerequisite == null) {
                    throw new CatalogValidationException("Topic references missing prerequisite: " + topic.id() + " -> " + prerequisiteId);
                }
                if (!prerequisite.subjectId().equals(topic.subjectId())) {
                    throw new CatalogValidationException("Topic prerequisite must stay within the same subject: " + topic.id());
                }
            }
        }

        for (ExamContext examContext : catalogData.examContexts()) {
            if (!subjects.containsKey(examContext.subjectId())) {
                throw new CatalogValidationException("Exam context references missing subject: " + examContext.id());
            }
            for (String focusTopicId : examContext.focusTopicIds()) {
                Topic topic = topics.get(focusTopicId);
                if (topic == null) {
                    throw new CatalogValidationException("Exam context references missing topic: " + examContext.id() + " -> " + focusTopicId);
                }
                if (!topic.subjectId().equals(examContext.subjectId())) {
                    throw new CatalogValidationException("Exam context topic subject mismatch: " + examContext.id());
                }
            }
        }

        for (Question question : catalogData.questions()) {
            if (!subjects.containsKey(question.subjectId())) {
                throw new CatalogValidationException("Question references missing subject: " + question.id());
            }

            Topic topic = topics.get(question.topicId());
            if (topic == null) {
                throw new CatalogValidationException("Question references missing topic: " + question.id());
            }

            if (!topic.subjectId().equals(question.subjectId())) {
                throw new CatalogValidationException("Question subject mismatch for question: " + question.id());
            }
        }

        detectCycles(topics);
    }

    private static void validateDuplicates(String entityName, List<String> ids) {
        Set<String> seen = new HashSet<>();
        Set<String> duplicates = new LinkedHashSet<>();
        for (String id : ids) {
            if (!seen.add(id)) {
                duplicates.add(id);
            }
        }
        if (!duplicates.isEmpty()) {
            throw new CatalogValidationException("Duplicate " + entityName + " ids found: " + duplicates);
        }
    }

    private static void detectCycles(Map<String, Topic> topics) {
        Set<String> visiting = new HashSet<>();
        Set<String> visited = new HashSet<>();
        Deque<String> path = new ArrayDeque<>();

        for (String topicId : topics.keySet()) {
            visitTopic(topicId, topics, visiting, visited, path);
        }
    }

    private static void visitTopic(
            String topicId,
            Map<String, Topic> topics,
            Set<String> visiting,
            Set<String> visited,
            Deque<String> path
    ) {
        if (visited.contains(topicId)) {
            return;
        }
        if (!visiting.add(topicId)) {
            List<String> cyclePath = new ArrayList<>(path);
            cyclePath.add(topicId);
            throw new CatalogValidationException("Cycle detected in topic prerequisites: " + cyclePath);
        }

        path.addLast(topicId);
        Topic topic = topics.get(topicId);
        for (String prerequisiteId : topic.prerequisiteIds()) {
            visitTopic(prerequisiteId, topics, visiting, visited, path);
        }
        path.removeLast();

        visiting.remove(topicId);
        visited.add(topicId);
    }
}
