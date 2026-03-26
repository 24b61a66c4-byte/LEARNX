import {
  ExamContext,
  Lesson,
  Question,
  Subject,
  SubjectId,
  Topic,
} from "@/lib/types";

export const subjects: Subject[] = [
  {
    id: "dbms",
    name: "Database Management Systems",
    description: "Relational design, SQL fluency, and exam-ready database thinking.",
    tags: ["database", "sql", "jntu-r22"],
    accent: "from-teal-500/25 via-cyan-500/15 to-sky-500/30",
    backdrop: "bg-teal-500/10 text-teal-900",
  },
  {
    id: "edc",
    name: "Electronic Devices and Circuits",
    description: "Core circuits, devices, rectifiers, and exam-focused electronics basics.",
    tags: ["electronics", "circuits", "jntu-r22"],
    accent: "from-amber-400/25 via-orange-400/15 to-rose-400/25",
    backdrop: "bg-amber-400/15 text-amber-950",
  },
];

export const topics: Topic[] = [
  {
    id: "dbms-sql-basics",
    subjectId: "dbms",
    title: "SQL Basics",
    summary: "Learn SELECT, WHERE, projection, filtering, and table-first query thinking.",
    prerequisiteIds: [],
    difficulty: 0.25,
    examImportance: 0.8,
    tags: ["sql", "select", "where"],
  },
  {
    id: "dbms-joins",
    subjectId: "dbms",
    title: "Joins",
    summary: "Understand inner, left, right, and self joins with relational intuition.",
    prerequisiteIds: ["dbms-sql-basics"],
    difficulty: 0.55,
    examImportance: 0.95,
    tags: ["inner-join", "outer-join", "query-plans"],
  },
  {
    id: "dbms-normalization",
    subjectId: "dbms",
    title: "Normalization",
    summary: "Study anomalies, functional dependencies, and normal forms step by step.",
    prerequisiteIds: ["dbms-sql-basics"],
    difficulty: 0.65,
    examImportance: 0.88,
    tags: ["1nf", "2nf", "3nf", "anomalies"],
  },
  {
    id: "edc-diode-basics",
    subjectId: "edc",
    title: "Diode Basics",
    summary: "Understand pn-junction behavior, biasing, and V-I characteristics.",
    prerequisiteIds: [],
    difficulty: 0.2,
    examImportance: 0.7,
    tags: ["pn-junction", "biasing", "characteristics"],
  },
  {
    id: "edc-rectifiers",
    subjectId: "edc",
    title: "Rectifiers",
    summary: "Study half-wave and full-wave rectification, ripple, and output behavior.",
    prerequisiteIds: ["edc-diode-basics"],
    difficulty: 0.45,
    examImportance: 0.85,
    tags: ["half-wave", "full-wave", "ripple-factor"],
  },
  {
    id: "edc-transistor-basics",
    subjectId: "edc",
    title: "Transistor Basics",
    summary: "Cover transistor regions, current flow, and common configurations.",
    prerequisiteIds: ["edc-diode-basics"],
    difficulty: 0.55,
    examImportance: 0.9,
    tags: ["bjt", "configurations", "operating-regions"],
  },
];

export const examContexts: ExamContext[] = [
  {
    id: "dbms-jntu-r22",
    subjectId: "dbms",
    title: "JNTU R22 DBMS",
    description: "Exam-focused DBMS preparation aligned with JNTU R22 patterns.",
    focusTopicIds: ["dbms-sql-basics", "dbms-joins", "dbms-normalization"],
    tags: ["jntu-r22", "semester-exam"],
  },
  {
    id: "edc-jntu-r22",
    subjectId: "edc",
    title: "JNTU R22 EDC",
    description: "Exam-focused EDC preparation aligned with JNTU R22 patterns.",
    focusTopicIds: ["edc-diode-basics", "edc-rectifiers", "edc-transistor-basics"],
    tags: ["jntu-r22", "semester-exam"],
  },
];

export const questions: Question[] = [
  {
    id: "q-dbms-1",
    subjectId: "dbms",
    topicId: "dbms-sql-basics",
    type: "MCQ",
    prompt: "Which SQL clause is used to filter rows?",
    options: ["GROUP BY", "WHERE", "ORDER BY", "HAVING"],
    correctOptionIndex: 1,
    acceptedKeywords: [],
    explanation: "WHERE filters rows before grouping and ordering.",
    difficulty: 0.25,
  },
  {
    id: "q-dbms-2",
    subjectId: "dbms",
    topicId: "dbms-joins",
    type: "SHORT_ANSWER",
    prompt: "List two join types used in relational queries.",
    options: [],
    correctOptionIndex: null,
    acceptedKeywords: ["inner join", "left join"],
    minKeywordMatches: 2,
    explanation: "Inner join and left join are standard join types in SQL.",
    difficulty: 0.45,
  },
  {
    id: "q-dbms-3",
    subjectId: "dbms",
    topicId: "dbms-normalization",
    type: "SHORT_ANSWER",
    prompt: "What problem does normalization help reduce in database design?",
    options: [],
    correctOptionIndex: null,
    acceptedKeywords: ["redundancy", "anomalies"],
    minKeywordMatches: 1,
    explanation: "Normalization reduces redundancy and update anomalies.",
    difficulty: 0.5,
  },
  {
    id: "q-edc-1",
    subjectId: "edc",
    topicId: "edc-diode-basics",
    type: "MCQ",
    prompt: "A diode conducts heavily when it is in which bias condition?",
    options: ["Reverse bias", "Forward bias", "Breakdown only", "Open circuit"],
    correctOptionIndex: 1,
    acceptedKeywords: [],
    explanation: "A pn-junction diode allows significant current in forward bias.",
    difficulty: 0.2,
  },
  {
    id: "q-edc-2",
    subjectId: "edc",
    topicId: "edc-rectifiers",
    type: "SHORT_ANSWER",
    prompt: "Name two common rectifier types.",
    options: [],
    correctOptionIndex: null,
    acceptedKeywords: ["half-wave", "full-wave"],
    minKeywordMatches: 2,
    explanation: "Half-wave and full-wave rectifiers are the two standard forms.",
    difficulty: 0.35,
  },
];

export const lessons: Lesson[] = [
  {
    topicId: "dbms-sql-basics",
    blocks: [
      {
        id: "sql-summary",
        kind: "summary",
        title: "What SQL basics really mean",
        content: [
          "SQL is the language used to talk to a relational database in a structured way.",
          "At the beginner level, you mainly learn how to select columns, filter rows, and read table output clearly.",
        ],
      },
      {
        id: "sql-steps",
        kind: "steps",
        title: "Query flow to remember",
        content: [
          "Start by asking: which table has the data?",
          "Then decide: which columns do I need?",
          "Finally choose: which rows must be filtered with WHERE?",
        ],
      },
      {
        id: "sql-example",
        kind: "example",
        title: "Worked example",
        content: [
          "SELECT name FROM students WHERE branch = 'CSE';",
          "This means: from the students table, show only the name column, but only for rows where branch is CSE.",
        ],
      },
      {
        id: "sql-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "Define SQL as a structured query language used to create, retrieve, update, and manage data in relational databases.",
          "Mention core clauses: SELECT, FROM, WHERE, GROUP BY, ORDER BY.",
        ],
      },
      {
        id: "sql-mistakes",
        kind: "mistake-watch",
        title: "Common mistakes",
        content: [
          "Mixing up WHERE and HAVING.",
          "Selecting columns that are not needed.",
          "Forgetting that filtering happens before final display ordering.",
        ],
      },
    ],
  },
  {
    topicId: "dbms-joins",
    blocks: [
      {
        id: "joins-summary",
        kind: "summary",
        title: "Why joins exist",
        content: [
          "Joins combine related data from two or more tables using a shared key.",
          "They help answer real-world questions without duplicating the same information in one huge table.",
        ],
      },
      {
        id: "joins-deep",
        kind: "deep-dive",
        title: "Inner vs outer intuition",
        content: [
          "An inner join returns only matching rows from both tables.",
          "A left join keeps every row from the left table, even when the right side has no match.",
        ],
      },
      {
        id: "joins-example",
        kind: "example",
        title: "Worked example",
        content: [
          "SELECT s.name, d.dept_name FROM students s INNER JOIN departments d ON s.dept_id = d.id;",
          "This returns each student with the matching department name.",
        ],
      },
      {
        id: "joins-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "State that joins are used to retrieve related data stored in normalized tables.",
          "List inner join, left outer join, right outer join, and self join with one-line meaning.",
        ],
      },
    ],
  },
  {
    topicId: "dbms-normalization",
    blocks: [
      {
        id: "norm-summary",
        kind: "summary",
        title: "Normalization in one idea",
        content: [
          "Normalization organizes database tables to reduce redundancy and avoid modification anomalies.",
          "It improves data consistency by separating data into well-structured relations.",
        ],
      },
      {
        id: "norm-steps",
        kind: "steps",
        title: "How to think through a normalization question",
        content: [
          "Look for repeated data and update anomalies.",
          "Identify the key and functional dependencies.",
          "Move from 1NF to 2NF to 3NF while checking what problem each stage removes.",
        ],
      },
      {
        id: "norm-formula",
        kind: "formula",
        title: "Important memory anchors",
        content: [
          "1NF removes repeating groups.",
          "2NF removes partial dependency.",
          "3NF removes transitive dependency.",
        ],
      },
      {
        id: "norm-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "Define normalization and explain why it reduces redundancy and anomalies.",
          "Describe 1NF, 2NF, and 3NF with short examples.",
        ],
      },
    ],
  },
  {
    topicId: "edc-diode-basics",
    blocks: [
      {
        id: "diode-summary",
        kind: "summary",
        title: "What a diode does",
        content: [
          "A diode is a two-terminal semiconductor device that mainly allows current flow in one direction.",
          "Its behavior depends on forward bias and reverse bias conditions.",
        ],
      },
      {
        id: "diode-deep",
        kind: "deep-dive",
        title: "Biasing intuition",
        content: [
          "In forward bias, the depletion region narrows and current increases rapidly after threshold.",
          "In reverse bias, the depletion region widens and only a very small leakage current flows.",
        ],
      },
      {
        id: "diode-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "Define a pn-junction diode and explain forward and reverse bias operation.",
          "Mention V-I characteristics and threshold voltage.",
        ],
      },
    ],
  },
  {
    topicId: "edc-rectifiers",
    blocks: [
      {
        id: "rect-summary",
        kind: "summary",
        title: "Why rectifiers matter",
        content: [
          "Rectifiers convert alternating current into direct current.",
          "They are the bridge between AC supply and DC electronic circuits.",
        ],
      },
      {
        id: "rect-example",
        kind: "example",
        title: "Half-wave vs full-wave",
        content: [
          "A half-wave rectifier uses only one half cycle of the AC input.",
          "A full-wave rectifier uses both half cycles, producing smoother output and better efficiency.",
        ],
      },
      {
        id: "rect-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "Define rectification and distinguish half-wave and full-wave rectifiers.",
          "Mention ripple factor, efficiency, and output waveform difference.",
        ],
      },
    ],
  },
  {
    topicId: "edc-transistor-basics",
    blocks: [
      {
        id: "trans-summary",
        kind: "summary",
        title: "What a transistor gives us",
        content: [
          "A transistor acts as a current-controlled device that can be used for amplification and switching.",
          "For exams, the main ideas are regions of operation and current relationships.",
        ],
      },
      {
        id: "trans-steps",
        kind: "steps",
        title: "Core learning path",
        content: [
          "Understand emitter, base, and collector roles.",
          "Learn cutoff, active, and saturation regions.",
          "Map those regions to switching and amplification behavior.",
        ],
      },
      {
        id: "trans-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "Define BJT operation, list transistor regions, and explain one common configuration.",
          "Mention current gain and real application relevance.",
        ],
      },
    ],
  },
];

export function getSubjects() {
  return subjects;
}

export function getSubjectById(subjectId: string) {
  return subjects.find((subject) => subject.id === subjectId);
}

export function getTopicsBySubject(subjectId: SubjectId) {
  return topics.filter((topic) => topic.subjectId === subjectId);
}

export function getTopicById(topicId: string) {
  return topics.find((topic) => topic.id === topicId);
}

export function getQuestions(subjectId?: SubjectId, topicId?: string) {
  return questions.filter((question) => {
    if (subjectId && question.subjectId !== subjectId) {
      return false;
    }

    if (topicId && question.topicId !== topicId) {
      return false;
    }

    return true;
  });
}

export function getQuestionById(questionId: string) {
  return questions.find((question) => question.id === questionId);
}

export function getLessonByTopicId(topicId: string) {
  return lessons.find((lesson) => lesson.topicId === topicId);
}

export function getExamContext(subjectId: SubjectId) {
  return examContexts.find((context) => context.subjectId === subjectId);
}

export function searchCatalog(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const subjectHits = subjects
    .filter((subject) => `${subject.name} ${subject.description}`.toLowerCase().includes(normalized))
    .map((subject) => ({
      id: subject.id,
      label: subject.name,
      sublabel: "Subject",
      href: `/app/subjects/${subject.id}`,
    }));

  const topicHits = topics
    .filter((topic) => `${topic.title} ${topic.summary} ${topic.tags.join(" ")}`.toLowerCase().includes(normalized))
    .map((topic) => ({
      id: topic.id,
      label: topic.title,
      sublabel: getSubjectById(topic.subjectId)?.name ?? "Topic",
      href: `/app/learn/${topic.subjectId}/${topic.id}`,
    }));

  return [...subjectHits, ...topicHits].slice(0, 8);
}
