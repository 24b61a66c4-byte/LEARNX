package com.learnx.ui;

import com.learnx.core.PerformanceMetrics;
import com.learnx.core.Question;
import java.util.List;
import java.util.Scanner;

/**
 * Runs an interactive quiz session in the console.
 *
 * <h2>Performance improvement: pre-normalized answer comparison</h2>
 * <p>A naive implementation calls {@code answer.equalsIgnoreCase(q.getCorrectAnswer())} inside
 * the per-question loop.  {@code equalsIgnoreCase} internally lower-cases both strings on every
 * comparison.  For a 50-question quiz this means 50 redundant lower-case conversions of the
 * correct answer – it never changes during the session.
 *
 * <p>Instead, {@link Question#getNormalizedAnswer()} returns a pre-computed lower-case copy that
 * was created once at object construction time.  The comparison in the loop becomes a simple
 * {@code equals()} call after lower-casing only the <em>user's</em> input.
 */
public class QuizRunner {

    private final Scanner scanner;

    public QuizRunner(Scanner scanner) {
        this.scanner = scanner;
    }

    /**
     * Runs the supplied questions interactively and returns a populated {@link PerformanceMetrics}.
     *
     * @param questions the quiz questions (all pre-validated, non-null)
     * @param metrics   a pre-constructed metrics object to populate (userId and topicId already set)
     * @return the same {@code metrics} object, now populated with counts
     */
    public PerformanceMetrics runQuiz(List<Question> questions, PerformanceMetrics metrics) {
        metrics.setTotalQuestions(questions.size());
        int questionNumber = 1;
        for (Question q : questions) {
            System.out.println();
            System.out.println("Q" + questionNumber + ": " + q.getText());
            System.out.print("Your answer: ");
            String userInput = scanner.nextLine().trim();

            // Lower-case the user's answer once; compare against the pre-normalized correct answer
            // (already lower-cased at Question construction time) using a plain equals() call.
            boolean correct = userInput.toLowerCase().equals(q.getNormalizedAnswer());

            if (correct) {
                metrics.incrementCorrect();
                System.out.println("Correct!");
            } else {
                System.out.println("Incorrect. The correct answer is: " + q.getCorrectAnswer());
            }
            System.out.println("Explanation: " + q.getExplanation());
            questionNumber++;
        }
        return metrics;
    }
}
