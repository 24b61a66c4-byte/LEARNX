package com.learnx.ui.quiz;

import com.learnx.core.model.Question;

import java.util.List;
import java.util.Scanner;

/**
 * Manages the adaptive quiz flow: presents questions, collects answers,
 * and tracks score for the current session.
 */
public class QuizRunner {

    private final Scanner scanner;
    private int correct;
    private int total;

    public QuizRunner(Scanner scanner) {
        this.scanner = scanner;
        this.correct = 0;
        this.total = 0;
    }

    /**
     * Runs through the given list of questions interactively.
     *
     * @param questions the ordered list of questions to present
     */
    public void run(List<Question> questions) {
        correct = 0;
        total = questions.size();

        for (int i = 0; i < questions.size(); i++) {
            Question q = questions.get(i);
            System.out.printf("\nQuestion %d of %d [%s]%n", i + 1, total, q.getDifficulty());
            System.out.println(q.getText());

            if (q.getOptions() != null) {
                char label = 'A';
                for (String option : q.getOptions()) {
                    System.out.printf("  %c) %s%n", label++, option);
                }
            }

            System.out.print("Your answer: ");
            String answer = scanner.nextLine().trim();

            if (answer.equalsIgnoreCase(q.getCorrectAnswer())) {
                System.out.println("✅ Correct!");
                correct++;
            } else {
                System.out.printf("❌ Incorrect. The correct answer is: %s%n", q.getCorrectAnswer());
            }

            if (q.getExplanation() != null) {
                System.out.println("   💡 " + q.getExplanation());
            }
        }

        printSummary();
    }

    /** Returns the number of correctly answered questions. */
    public int getCorrect() { return correct; }

    /** Returns the total number of questions in the session. */
    public int getTotal() { return total; }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private void printSummary() {
        double percent = (total == 0) ? 0 : (correct * 100.0 / total);
        System.out.println("\n╔═══════════════════════════╗");
        System.out.println("║       Quiz Complete!      ║");
        System.out.printf( "║  Score: %d / %d  (%.0f%%)%n", correct, total, percent);
        System.out.println("╚═══════════════════════════╝");
    }
}
