package com.learnx.persistence.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

@Embeddable
public class QuizAnswerDetail {

    @Size(max = 100)
    @Column(name = "question_id", length = 100)
    private String questionId;

    @Size(max = 255)
    @Column(name = "topic_id", length = 255)
    private String topicId;

    @Size(max = 2000)
    @Column(name = "prompt", length = 2000)
    private String prompt;

    @Column(name = "correct")
    private Boolean correct;

    @Min(0)
    @Max(100)
    @Column(name = "score")
    private Integer score;

    @Size(max = 4000)
    @Column(name = "explanation", length = 4000)
    private String explanation;

    @Size(max = 4000)
    @Column(name = "learner_answer", length = 4000)
    private String learnerAnswer;

    @Size(max = 4000)
    @Column(name = "correct_answer", length = 4000)
    private String correctAnswer;

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public String getTopicId() {
        return topicId;
    }

    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public Boolean getCorrect() {
        return correct;
    }

    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getLearnerAnswer() {
        return learnerAnswer;
    }

    public void setLearnerAnswer(String learnerAnswer) {
        this.learnerAnswer = learnerAnswer;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }
}
