package com.learnx.ui.visual;

/**
 * Renders text-based visual learning diagrams and concept maps.
 *
 * <p>Uses Unicode box-drawing characters and indentation to produce structured
 * concept maps that work in any terminal without external dependencies.
 */
public class DiagramRenderer {

    private DiagramRenderer() {}

    /**
     * Renders a simple top-down concept map for the given topic and subtopics.
     *
     * @param topic     the root topic title
     * @param subtopics an array of subtopic names
     */
    public static void renderConceptMap(String topic, String[] subtopics) {
        System.out.println("\n╔══════════════════════╗");
        System.out.printf( "║  📚 %-16s  ║%n", topic);
        System.out.println("╚══════════╤═══════════╝");

        for (int i = 0; i < subtopics.length; i++) {
            boolean last = (i == subtopics.length - 1);
            System.out.printf("           %s── %s%n",
                    last ? "└" : "├", subtopics[i]);
        }
        System.out.println();
    }

    /**
     * Renders a simple two-column comparison table.
     *
     * @param title   the table title
     * @param headers two column header strings
     * @param rows    rows, each containing exactly two cell strings
     */
    public static void renderComparisonTable(String title, String[] headers, String[][] rows) {
        int w1 = maxWidth(headers[0], rows, 0);
        int w2 = maxWidth(headers[1], rows, 1);
        String divider = "+" + "-".repeat(w1 + 2) + "+" + "-".repeat(w2 + 2) + "+";

        System.out.println("\n" + title);
        System.out.println(divider);
        System.out.printf("| %-" + w1 + "s | %-" + w2 + "s |%n", headers[0], headers[1]);
        System.out.println(divider);
        for (String[] row : rows) {
            System.out.printf("| %-" + w1 + "s | %-" + w2 + "s |%n",
                    row.length > 0 ? row[0] : "",
                    row.length > 1 ? row[1] : "");
        }
        System.out.println(divider);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private static int maxWidth(String header, String[][] rows, int col) {
        int max = header.length();
        for (String[] row : rows) {
            if (row.length > col) max = Math.max(max, row[col].length());
        }
        return max;
    }
}
