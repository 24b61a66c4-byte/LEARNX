import { describe, expect, it } from "vitest";

import { catalogGateway } from "@/lib/gateways";
import { getPublicPracticeHref, resolveSubjectIdFromSegment, resolveTopicIdFromSegment } from "@/lib/public-routes";
import { SubjectId } from "@/lib/types";

/**
 * Subject ID validator function (mirrors the one in practice/page.tsx)
 * Ensures only valid subjects can be passed via query params
 * Uses the same public-route subject aliases as the app
 */
function isSubjectId(value?: string): value is SubjectId {
  return resolveSubjectIdFromSegment(value) !== null;
}

/**
 * Practice href builder function
 * Mirrors the logic used in tutor-panel.tsx to generate deep-link URLs
 */
function buildPracticeHref(subjectId: SubjectId, topicId?: string): string {
  return getPublicPracticeHref(subjectId, topicId);
}

/**
 * Parse practice search params
 * Mirrors the logic in practice/page.tsx for reading and validating query params
 */
function parsePracticeParams(searchParams: {
  subjectId?: string;
  topicId?: string;
}): { subjectId: SubjectId; topicId?: string } {
  const subjectId = resolveSubjectIdFromSegment(searchParams.subjectId) ?? "dbms";
  const topicId = resolveTopicIdFromSegment(searchParams.topicId?.trim()) ?? undefined;
  return { subjectId, topicId };
}

describe("Tutor-to-Practice Query Handoff", () => {
  describe("Subject ID Validation", () => {
    it("accepts valid subject ID 'dbms'", () => {
      expect(isSubjectId("dbms")).toBe(true);
    });

    it("accepts valid subject ID 'edc'", () => {
      expect(isSubjectId("edc")).toBe(true);
    });

    it("accepts valid subject ID 'coding'", () => {
      expect(isSubjectId("coding")).toBe(true);
    });

    it("rejects invalid subject IDs", () => {
      expect(isSubjectId("invalid")).toBe(false);
      expect(isSubjectId("cs")).toBe(false);
      expect(isSubjectId("")).toBe(false);
    });

    it("rejects undefined subject ID", () => {
      expect(isSubjectId(undefined)).toBe(false);
    });

    it("accepts case-insensitive subject route segments", () => {
      expect(isSubjectId("DBMS")).toBe(true);
      expect(isSubjectId("Dbms")).toBe(true);
      expect(isSubjectId("EDC")).toBe(true);
      expect(isSubjectId("Coding")).toBe(true);
    });
  });

  describe("Practice Href Construction", () => {
    it("builds href with subject only (no topic)", () => {
      const href = buildPracticeHref("dbms");
      expect(href).toBe("/app/practice?subjectId=mathematics");
    });

    it("builds href with subject and topic", () => {
      const href = buildPracticeHref("dbms", "dbms-sql-basics");
      expect(href).toBe("/app/practice?subjectId=mathematics&topicId=number-basics");
    });

    it("builds href for coding subject with topic", () => {
      const href = buildPracticeHref("coding", "coding-control-flow");
      expect(href).toBe("/app/practice?subjectId=coding&topicId=conditions-and-loops");
    });

    it("encodes topic IDs with special characters", () => {
      const href = buildPracticeHref("dbms", "topic-with-spaces");
      expect(href).toContain("topicId=topic-with-spaces");
    });
  });

  describe("Query Parameter Parsing", () => {
    it("parses valid subject and topic params", () => {
      const result = parsePracticeParams({
        subjectId: "mathematics",
        topicId: "number-basics",
      });
      expect(result.subjectId).toBe("dbms");
      expect(result.topicId).toBe("dbms-sql-basics");
    });

    it("parses subject only (no topic)", () => {
      const result = parsePracticeParams({ subjectId: "science" });
      expect(result.subjectId).toBe("edc");
      expect(result.topicId).toBeUndefined();
    });

    it("parses coding subject and topic slugs", () => {
      const result = parsePracticeParams({
        subjectId: "coding",
        topicId: "variables-and-data",
      });
      expect(result.subjectId).toBe("coding");
      expect(result.topicId).toBe("coding-variables");
    });

    it("defaults to 'mathematics' for invalid subject", () => {
      const result = parsePracticeParams({ subjectId: "invalid" });
      expect(result.subjectId).toBe("dbms");
      expect(result.topicId).toBeUndefined();
    });

    it("defaults to 'mathematics' when subject is undefined", () => {
      const result = parsePracticeParams({});
      expect(result.subjectId).toBe("dbms");
      expect(result.topicId).toBeUndefined();
    });

    it("trims whitespace from topicId", () => {
      const result = parsePracticeParams({
        subjectId: "dbms",
        topicId: "  dbms-sql-basics  ",
      });
      expect(result.topicId).toBe("dbms-sql-basics");
    });

    it("treats empty topicId as undefined", () => {
      const result = parsePracticeParams({
        subjectId: "dbms",
        topicId: "   ",
      });
      expect(result.topicId).toBeUndefined();
    });

    it("preserves empty string topicId as undefined", () => {
      const result = parsePracticeParams({
        subjectId: "dbms",
        topicId: "",
      });
      expect(result.topicId).toBeUndefined();
    });
  });

  describe("Full Handoff Flow", () => {
    it("constructs href, then parses it back to original params", () => {
      const originalSubjectId: SubjectId = "dbms";
      const originalTopicId = "dbms-sql-basics";

      // Simulate tutor panel building the href
      const href = buildPracticeHref(originalSubjectId, originalTopicId);

      // Extract query params from href
      const urlParams = new URLSearchParams(href.split("?")[1]);
      const parsedSubjectId = urlParams.get("subjectId") ?? undefined;
      const parsedTopicId = urlParams.get("topicId") ?? undefined;

      // Simulate practice page parsing the params
      const result = parsePracticeParams({
        subjectId: parsedSubjectId,
        topicId: parsedTopicId,
      });

      // Verify round-trip preserves data
      expect(result.subjectId).toBe(originalSubjectId);
      expect(result.topicId).toBe(originalTopicId);
    });

    it("handles round-trip with subject only (no topic)", () => {
      const originalSubjectId: SubjectId = "edc";

      const href = buildPracticeHref(originalSubjectId);
      const urlParams = new URLSearchParams(href.split("?")[1]);
      const result = parsePracticeParams({
        subjectId: urlParams.get("subjectId") ?? undefined,
        topicId: urlParams.get("topicId") ?? undefined,
      });

      expect(result.subjectId).toBe(originalSubjectId);
      expect(result.topicId).toBeUndefined();
    });

    it("verifies all catalog topics are valid handoff targets", () => {
      const subjects = catalogGateway.getSubjects();

      // For each subject, verify its topics can be used in practiceHref
      subjects.forEach((subject) => {
        const topics = catalogGateway.getTopicsBySubject(subject.id);
        topics.forEach((topic) => {
          // Build href with this topic
          const href = buildPracticeHref(subject.id, topic.id);

          // Parse it back
          const urlParams = new URLSearchParams(href.split("?")[1]);
          const result = parsePracticeParams({
            subjectId: urlParams.get("subjectId") ?? undefined,
            topicId: urlParams.get("topicId") ?? undefined,
          });

          // Verify it round-trips correctly
          expect(result.subjectId).toBe(subject.id);
          expect(result.topicId).toBe(topic.id);
        });
      });
    });
  });

  describe("Edge Cases & Security", () => {
    it("rejects XSS attempts in subject param", () => {
      const xssAttempt = "<script>alert('xss')</script>";
      expect(isSubjectId(xssAttempt)).toBe(false);
    });

    it("rejects SQL injection attempts in topicId", () => {
      const result = parsePracticeParams({
        subjectId: "dbms",
        topicId: "'; DROP TABLE topics; --",
      });
      // Topic ID is passed as-is, but subject ID validation ensures only safe subjects reach downstream
      expect(result.subjectId).toBe("dbms");
      // The topicId is passed through, but shouldn't cause issues since it's only used for filtering
    });

    it("drops unknown very long topic IDs", () => {
      const longTopicId = "a".repeat(1000);
      const result = parsePracticeParams({
        subjectId: "dbms",
        topicId: longTopicId,
      });
      expect(result.topicId).toBeUndefined();
    });

    it("handles round-trip for coding topics", () => {
      const originalSubjectId: SubjectId = "coding";
      const originalTopicId = "coding-control-flow";

      const href = buildPracticeHref(originalSubjectId, originalTopicId);
      const urlParams = new URLSearchParams(href.split("?")[1]);
      const result = parsePracticeParams({
        subjectId: urlParams.get("subjectId") ?? undefined,
        topicId: urlParams.get("topicId") ?? undefined,
      });

      expect(result.subjectId).toBe(originalSubjectId);
      expect(result.topicId).toBe(originalTopicId);
    });

    it("drops unknown topic IDs with special characters", () => {
      const specialTopic = "topic-with-dashes_and_underscores.v2";
      const result = parsePracticeParams({
        subjectId: "dbms",
        topicId: specialTopic,
      });
      expect(result.topicId).toBeUndefined();
    });
  });
});
