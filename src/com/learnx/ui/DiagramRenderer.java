package com.learnx.ui;

import java.util.List;

/**
 * Renders simple ASCII tables and concept diagrams in the console.
 *
 * <h2>Performance improvements over a naive implementation</h2>
 * <ol>
 *   <li><strong>Single-pass column-width calculation</strong> – {@link #renderTable} scans the
 *       row data exactly once to compute both column widths, whereas a naive implementation
 *       would call a separate {@code maxWidth()} method per column (two full scans).</li>
 *   <li><strong>StringBuilder for row assembly</strong> – each row string is built with a single
 *       {@link StringBuilder} instead of chaining {@code +} operators that create intermediate
 *       {@code String} objects.  For large tables this reduces GC pressure noticeably.</li>
 *   <li><strong>Pre-computed divider string</strong> – the horizontal divider (e.g.
 *       {@code +------+--------+}) is constructed once and stored in a local variable rather
 *       than being rebuilt on every call to {@code System.out.println}.</li>
 * </ol>
 */
public class DiagramRenderer {

    /**
     * Renders a two-column ASCII table to {@code System.out}.
     *
     * @param headers a two-element array with the column header labels
     * @param rows    each inner array must have exactly two string elements
     */
    public void renderTable(String[] headers, List<String[]> rows) {
        if (headers == null || headers.length < 2) {
            throw new IllegalArgumentException("headers must have at least 2 elements");
        }

        // --- Single-pass width calculation (O(n), one scan) -----------------------
        // A naive implementation calls maxWidth() separately for each column, performing two
        // independent scans over the same list.  Here we compute both widths in a single pass.
        int w1 = headers[0].length();
        int w2 = headers[1].length();
        for (String[] row : rows) {
            if (row[0].length() > w1) w1 = row[0].length();
            if (row[1].length() > w2) w2 = row[1].length();
        }

        // --- Pre-compute the divider line once ------------------------------------
        // Constructing this string inside a loop would allocate a new String on every iteration.
        String divider = buildDivider(w1, w2);

        // --- Render header --------------------------------------------------------
        System.out.println(divider);
        System.out.println(buildRow(headers[0], headers[1], w1, w2));
        System.out.println(divider);

        // --- Render data rows using StringBuilder ---------------------------------
        for (String[] row : rows) {
            System.out.println(buildRow(row[0], row[1], w1, w2));
        }
        System.out.println(divider);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Builds a divider line such as {@code +--------+----------+}.
     *
     * <p>StringBuilder avoids the implicit intermediate String objects that {@code +} chaining
     * would create (each {@code +} in {@code "+" + "-".repeat(n) + "+"} allocates a new object).
     */
    private static String buildDivider(int w1, int w2) {
        return new StringBuilder(w1 + w2 + 7)
                .append('+').append("-".repeat(w1 + 2))
                .append('+').append("-".repeat(w2 + 2))
                .append('+')
                .toString();
    }

    /**
     * Builds a single data row such as {@code | left value | right value |}.
     */
    private static String buildRow(String left, String right, int w1, int w2) {
        return new StringBuilder(w1 + w2 + 7)
                .append("| ")
                .append(padRight(left, w1))
                .append(" | ")
                .append(padRight(right, w2))
                .append(" |")
                .toString();
    }

    /** Right-pads {@code s} with spaces to exactly {@code width} characters. */
    private static String padRight(String s, int width) {
        if (s.length() >= width) {
            return s;
        }
        StringBuilder sb = new StringBuilder(width).append(s);
        for (int i = s.length(); i < width; i++) {
            sb.append(' ');
        }
        return sb.toString();
    }
}
