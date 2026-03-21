package com.learnx.ui;

import com.learnx.ai.AiService;
import com.learnx.core.AdaptiveEngine;
import com.learnx.core.LearnerProfile;
import com.learnx.core.PerformanceMetrics;
import com.learnx.core.Question;
import com.learnx.core.QuestionBank;
import java.util.List;
import java.util.Scanner;
import java.util.logging.Logger;

/**
 * Top-level console menu for LearnBot Pro.
 *
 * <p>Keeps a single {@link Scanner} instance for the lifetime of the session; creating a new
 * {@code Scanner} for every prompt would waste resources and could cause buffering issues.
 */
public class MainMenu {

    private static final Logger LOGGER = Logger.getLogger(MainMenu.class.getName());

    private final Scanner scanner = new Scanner(System.in);
    private final AdaptiveEngine adaptiveEngine = new AdaptiveEngine();
    private final DiagramRenderer renderer = new DiagramRenderer();

    private LearnerProfile currentProfile;
    private QuestionBank questionBank;
    private AiService aiService;

    public MainMenu(LearnerProfile profile, QuestionBank questionBank, AiService aiService) {
        this.currentProfile = profile;
        this.questionBank = questionBank;
        this.aiService = aiService;
    }

    /** Starts the main menu loop until the user chooses to exit. */
    public void start() {
        boolean running = true;
        System.out.println("Welcome to LearnBot Pro! Hello, " + currentProfile.getUsername() + "!");

        while (running) {
            printMenu();
            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> handleStartQuiz();
                case "2" -> handleViewProgress();
                case "3" -> handleAskQuestion();
                case "4" -> {
                    System.out.println("Goodbye!");
                    running = false;
                }
                default -> System.out.println("Invalid choice. Please enter 1-4.");
            }
        }
    }

    // -----------------------------------------------------------------------
    // Menu handlers
    // -----------------------------------------------------------------------

    private void printMenu() {
        System.out.println();
        System.out.println("=== LearnBot Pro ===");
        System.out.println("1. Start Quiz");
        System.out.println("2. View Progress");
        System.out.println("3. Ask a Question");
        System.out.println("4. Exit");
        System.out.print("Choice: ");
    }

    private void handleStartQuiz() {
        System.out.print("Enter topic: ");
        String topic = scanner.nextLine().trim();
        currentProfile.setCurrentTopic(topic);

        List<Question> questions = questionBank.getQuestions(topic, currentProfile.getDifficultyLevel());
        if (questions.isEmpty()) {
            System.out.println("No questions available for topic '" + topic
                    + "' at difficulty level " + currentProfile.getDifficultyLevel() + ".");
            return;
        }

        PerformanceMetrics metrics = new PerformanceMetrics(currentProfile.getUserId(), topic);
        QuizRunner runner = new QuizRunner(scanner);
        runner.runQuiz(questions, metrics);

        System.out.printf("%nQuiz complete! Score: %.1f%% (%d/%d)%n",
                metrics.getScorePercent(),
                metrics.getCorrectAnswers(),
                metrics.getTotalQuestions());

        adaptiveEngine.adjustDifficulty(currentProfile, metrics);
        System.out.println("Updated difficulty level: " + currentProfile.getDifficultyLevel());
    }

    private void handleViewProgress() {
        // Display current profile summary using the DiagramRenderer.
        String[][] rows = {
            {"Username", currentProfile.getUsername()},
            {"Age",      String.valueOf(currentProfile.getAge())},
            {"Difficulty", currentProfile.getDifficultyLevel() + "/10"},
            {"Topic",    currentProfile.getCurrentTopic() != null
                             ? currentProfile.getCurrentTopic() : "—"}
        };
        renderer.renderTable(new String[]{"Attribute", "Value"},
                java.util.Arrays.asList(rows));
    }

    private void handleAskQuestion() {
        if (aiService == null) {
            System.out.println("AI service is not available.");
            return;
        }
        System.out.print("Topic: ");
        String topic = scanner.nextLine().trim();
        System.out.print("Your question: ");
        String question = scanner.nextLine().trim();
        String answer = aiService.askQuestion(currentProfile, topic, question);
        System.out.println();
        System.out.println("LearnBot: " + (answer.isBlank() ? "(no response)" : answer));
    }
}
