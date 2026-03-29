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
        String conversationContext,
        String userQuestion,
        List<SearchResult> searchResults,
        com.learnx.core.model.AgeCategory ageCategory) {

    public TutorPrompt {
        subjectName = normalize(subjectName);
        topicTitle = normalize(topicTitle);
        topicSummary = normalize(topicSummary);
        examTitle = normalize(examTitle);
        learnerSummary = normalize(learnerSummary);
        conversationContext = normalize(conversationContext);
        userQuestion = normalize(userQuestion);
        searchResults = searchResults == null ? List.of() : List.copyOf(searchResults);
    }

    public String toPromptText() {
        com.learnx.ai.strategy.PromptStrategy strategy = com.learnx.ai.strategy.PromptStrategyFactory.getStrategy(ageCategory);

        StringBuilder builder = new StringBuilder();
        builder.append(strategy.getSystemPrompt()).append('\n')
                .append(strategy.formatResponseInstructions()).append('\n')
                .append("Subject: ").append(subjectName).append('\n')
                .append("Topic: ").append(topicTitle).append('\n')
                .append("Topic Summary: ").append(topicSummary).append('\n')
                .append("Exam Context: ").append(examTitle.isBlank() ? "General study mode" : examTitle).append('\n')
                .append("Learner Summary: ").append(learnerSummary).append('\n')
                .append("Recent Conversation Context: ")
                .append(conversationContext.isBlank() ? "No prior chat context available." : conversationContext)
                .append('\n')
                .append("Learner Question: ")
                .append(userQuestion.isBlank() ? "Explain this topic clearly." : userQuestion).append('\n');

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
