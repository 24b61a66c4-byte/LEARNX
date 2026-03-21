package com.learnx.ui.menu;

import java.util.Scanner;

/**
 * Entry point for the LearnBot Pro command-line interface.
 * Displays the main menu and routes the learner to the appropriate feature.
 */
public class MainMenu {

    private final Scanner scanner;

    public MainMenu(Scanner scanner) {
        this.scanner = scanner;
    }

    /**
     * Starts the interactive main menu loop.
     */
    public void start() {
        boolean running = true;
        while (running) {
            printMenu();
            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> startQuiz();
                case "2" -> startAiChat();
                case "3" -> viewProgress();
                case "4" -> showVisualDiagram();
                case "0" -> { System.out.println("Goodbye! Keep learning!"); running = false; }
                default  -> System.out.println("Invalid choice. Please try again.");
            }
        }
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private void printMenu() {
        System.out.println("\n╔══════════════════════════════╗");
        System.out.println("║       LearnBot Pro  🎓       ║");
        System.out.println("╠══════════════════════════════╣");
        System.out.println("║  1. Start Adaptive Quiz      ║");
        System.out.println("║  2. Ask AI Tutor             ║");
        System.out.println("║  3. View My Progress         ║");
        System.out.println("║  4. Visual Learning Diagram  ║");
        System.out.println("║  0. Exit                     ║");
        System.out.println("╚══════════════════════════════╝");
        System.out.print("Enter choice: ");
    }

    private void startQuiz() {
        System.out.println("\n[Quiz] Launching adaptive quiz... (connect UI_Quizzes/quiz module)");
    }

    private void startAiChat() {
        System.out.println("\n[AI] Connecting to AI tutor... (connect AI_Integration module)");
    }

    private void viewProgress() {
        System.out.println("\n[Progress] Loading performance data... (connect Database_Auth module)");
    }

    private void showVisualDiagram() {
        System.out.println("\n[Visual] Rendering diagram... (connect UI_Quizzes/visual module)");
    }
}
