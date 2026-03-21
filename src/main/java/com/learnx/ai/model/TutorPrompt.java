package com.learnx.ai.model;

import java.util.List;

/**
 * Structured tutor prompt passed to the AI provider.
 */
public record TutorPrompt(
        String subjectName,
        String topicTitle,
        String topicSummary,
        String examTitle,
        String learnerSummary,
        String userQuestion,
        List<SearchResult> searchResults
) {

    public TutorPrompt {
        subjectName = normalize(subjectName);
        topicTitle = normalize(topicTitle);
        topicSummary = normalize(topicSummary);
        examTitle = normalize(examTitle);
        learnerSummary = normalize(learnerSummary);
        userQuestion = normalize(userQuestion);
        searchResults = searchResults == null ? List.of() : List.copyOf(searchResults);
    }

    public String toPromptText() {
        StringBuilder builder = new StringBuilder();
        builder.append("You are LearnX, an exam-focused smart tutor.\n")
                .append("Return JSON with keys: explanation, examAnswerOutline, keyPoints.\n")
                .append("Keep the answer accurate, practical, and easy to study from.\n\n")
                .append("Subject: ").append(subjectName).append('\n')
                .append("Topic: ").append(topicTitle).append('\n')
                .append("Topic Summary: ").append(topicSummary).append('\n')
                .append("Exam Context: ").append(examTitle.isBlank() ? "General study mode" : examTitle).append('\n')
                .append("Learner Summary: ").append(learnerSummary).append('\n')
                .append("Learner Question: ").append(userQuestion.isBlank() ? "Explain this topic clearly." : userQuestion).append('\n');

        if (!searchResults.isEmpty()) {
            builder.append("\nGrounding Sources:\n");
            int index = 1;
            for (SearchResult searchResult : searchResults) {
                builder.append(index++)
                        .append(". ")
                        .append(searchResult.title())
                        .append(" | ")
                        .append(searchResult.url())
                        .append(" | ")
                        .append(searchResult.snippet())
                        .append('\n');
            }
        }

        return builder.toString();
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
