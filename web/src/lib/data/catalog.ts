import {
  ExamContext,
  Lesson,
  Question,
  Subject,
  Topic,
} from "@/lib/types";
import { getPublicSubjectHref, getPublicTopicHref } from "@/lib/public-routes";
import backendCatalogData from "../../../../src/main/resources/catalog.json";

type BackendCatalog = {
  subjects: Array<Omit<Subject, "accent" | "backdrop">>;
  topics: Topic[];
  examContexts: ExamContext[];
  questions: Question[];
};

const backendCatalog = backendCatalogData as BackendCatalog;

const subjectUiMap: Record<string, Pick<Subject, "accent" | "backdrop">> = {
  dbms: {
    accent: "from-teal-500/25 via-cyan-500/15 to-sky-500/30",
    backdrop: "bg-teal-500/10 text-teal-900",
  },
  edc: {
    accent: "from-amber-400/25 via-orange-400/15 to-rose-400/25",
    backdrop: "bg-amber-400/15 text-amber-950",
  },
  coding: {
    accent: "from-emerald-400/25 via-lime-300/15 to-cyan-400/25",
    backdrop: "bg-emerald-400/15 text-emerald-950",
  },
};

export const subjects: Subject[] = backendCatalog.subjects.map((subject) => ({
  ...subject,
  accent: subjectUiMap[subject.id]?.accent ?? "from-slate-300/25 via-slate-200/15 to-slate-100/30",
  backdrop: subjectUiMap[subject.id]?.backdrop ?? "bg-slate-200/70 text-slate-900",
}));

export const topics: Topic[] = backendCatalog.topics;

export const examContexts: ExamContext[] = backendCatalog.examContexts;

export const questions: Question[] = backendCatalog.questions;

export const lessons: Lesson[] = [
  {
    topicId: "dbms-sql-basics",
    blocks: [
      {
        id: "sql-summary",
        kind: "summary",
        title: "What math basics really mean",
        content: [
          "Mathematics is the language we use to describe numbers, patterns, and change in a structured way.",
          "At the beginner level, you mainly learn how to read the question carefully, choose the right operation, and check the result.",
        ],
      },
      {
        id: "sql-steps",
        kind: "steps",
        title: "Problem flow to remember",
        content: [
          "Start by asking: what is given?",
          "Then decide: what operation fits best?",
          "Finally check: does the answer make sense in the question?",
        ],
      },
      {
        id: "sql-example",
        kind: "example",
        title: "Worked example",
        content: [
          "3 groups of 4 apples means 3 x 4 = 12 apples.",
          "This means: count the groups, multiply by the items in each group, and write the total clearly.",
        ],
      },
      {
        id: "sql-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "State the rule, show the operation, and end with one short example.",
          "Mention the key step, the reason it works, and the final answer.",
        ],
      },
      {
        id: "sql-mistakes",
        kind: "mistake-watch",
        title: "Common mistakes",
        content: [
          "Mixing up addition and multiplication.",
          "Skipping the steps that show how the answer was found.",
          "Forgetting to check whether the final answer fits the question.",
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
        title: "Why patterns matter",
        content: [
          "Patterns help you see how one value changes when another value changes.",
          "They help you spot useful connections without guessing.",
        ],
      },
      {
        id: "joins-deep",
        kind: "deep-dive",
        title: "Table vs graph intuition",
        content: [
          "A table helps you list values clearly.",
          "A graph helps you see the trend quickly.",
        ],
      },
      {
        id: "joins-example",
        kind: "example",
        title: "Worked example",
        content: [
          "If study time goes up and practice score also goes up, the relationship is positive.",
          "This gives you a simple pattern you can explain in one sentence.",
        ],
      },
      {
        id: "joins-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "State what the relationship shows and give one example from class or daily life.",
          "Mention the key pattern, the direction of change, and a brief conclusion.",
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
        title: "Organization in one idea",
        content: [
          "Good organization breaks a big task into smaller, easier steps.",
          "It helps you stay clear, reduce mistakes, and keep your work neat.",
        ],
      },
      {
        id: "norm-steps",
        kind: "steps",
        title: "How to think through a problem",
        content: [
          "Look at what is given and what is asked.",
          "Break the task into smaller steps.",
          "Solve in order, then review the answer.",
        ],
      },
      {
        id: "norm-formula",
        kind: "formula",
        title: "Important memory anchors",
        content: [
          "Step 1: understand the problem.",
          "Step 2: choose the method.",
          "Step 3: check your answer.",
        ],
      },
      {
        id: "norm-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "Explain why organization makes work easier to follow.",
          "Give one short example of how steps lead to a correct answer.",
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
        title: "What a science idea does",
        content: [
          "Science starts with a simple idea, an example, and an observation.",
          "Good explanations show what changes when conditions change.",
        ],
      },
      {
        id: "diode-deep",
        kind: "deep-dive",
        title: "Cause and effect intuition",
        content: [
          "When one factor changes, the result can change too.",
          "That cause-and-effect thinking helps you explain results clearly.",
        ],
      },
      {
        id: "diode-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "Define the idea, explain what happens, and give one example.",
          "Mention the condition, the result, and the observation you would expect.",
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
        title: "Why energy changes matter",
        content: [
          "Energy can move, change form, or show up in different ways.",
          "Seeing that change helps you explain everyday science clearly.",
        ],
      },
      {
        id: "rect-example",
        kind: "example",
        title: "Example of change",
        content: [
          "A lamp turns electrical energy into light and heat.",
          "A fan turns electrical energy into motion.",
        ],
      },
      {
        id: "rect-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "Name the type of energy change and give one everyday example.",
          "Keep the answer short, clear, and connected to real life.",
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
        title: "What a system gives us",
        content: [
          "A system has inputs, outputs, and parts that affect one another.",
          "For revision, the main ideas are control, response, and simple application.",
        ],
      },
      {
        id: "trans-steps",
        kind: "steps",
        title: "Core learning path",
        content: [
          "Understand the input.",
          "Watch the output.",
          "Connect the cause with the effect.",
        ],
      },
      {
        id: "trans-exam",
        kind: "exam",
        title: "Exam answer frame",
        content: [
          "Define the system in one line and explain how it responds.",
          "Mention the key parts, their roles, and one practical example.",
        ],
      },
    ],
  },
  {
    topicId: "coding-logic-basics",
    blocks: [
      {
        id: "coding-logic-summary",
        kind: "summary",
        title: "What coding logic means",
        content: [
          "Coding logic is the skill of breaking a task into clear steps a computer can follow.",
          "At the beginner level, that usually means sequence, patterns, and simple algorithms from daily life.",
        ],
      },
      {
        id: "coding-logic-steps",
        kind: "steps",
        title: "How to plan a small algorithm",
        content: [
          "Start by writing what should happen first.",
          "Keep each step short and in the right order.",
          "Test the steps once to check whether the result matches the goal.",
        ],
      },
      {
        id: "coding-logic-example",
        kind: "example",
        title: "Worked example",
        content: [
          "A hand-washing algorithm could be: turn on water, add soap, scrub, rinse, and dry hands.",
          "If you scramble the order, the result is weaker, which shows why sequence matters in coding.",
        ],
      },
      {
        id: "coding-logic-exam",
        kind: "exam",
        title: "Explain it clearly",
        content: [
          "Define coding logic, say that computers follow steps in order, and give one everyday algorithm example.",
          "Mention the sequence, the goal, and why the order matters.",
        ],
      },
      {
        id: "coding-logic-mistakes",
        kind: "mistake-watch",
        title: "Common mistakes",
        content: [
          "Skipping a step and assuming the computer will guess it.",
          "Using unclear instructions such as 'do the thing'.",
          "Testing only the final result instead of checking each step.",
        ],
      },
    ],
  },
  {
    topicId: "coding-variables",
    blocks: [
      {
        id: "coding-var-summary",
        kind: "summary",
        title: "What variables do",
        content: [
          "A variable stores a value so a program can use it later, update it, or compare it.",
          "This is how code remembers scores, names, counters, and many other pieces of information.",
        ],
      },
      {
        id: "coding-var-deep",
        kind: "deep-dive",
        title: "Think of a labeled box",
        content: [
          "You can imagine a variable as a labeled box with a value inside.",
          "The label helps you find it again, and the value can change when the program runs.",
        ],
      },
      {
        id: "coding-var-example",
        kind: "example",
        title: "Worked example",
        content: [
          "A game might store score = 10 and then update it to 15 after the player wins a round.",
          "The variable keeps the latest value ready for the next step in the program.",
        ],
      },
      {
        id: "coding-var-exam",
        kind: "exam",
        title: "Explain it clearly",
        content: [
          "Define a variable, say that it stores data, and give one example such as a score or a name.",
          "Mention the label, the value, and how the value can change.",
        ],
      },
    ],
  },
  {
    topicId: "coding-control-flow",
    blocks: [
      {
        id: "coding-flow-summary",
        kind: "summary",
        title: "How control flow guides code",
        content: [
          "Control flow decides which step runs next in a program.",
          "This includes conditions for choices and loops for repeated actions.",
        ],
      },
      {
        id: "coding-flow-steps",
        kind: "steps",
        title: "Decision and repeat checklist",
        content: [
          "Ask a clear yes-or-no question for the condition.",
          "Choose the action for each path.",
          "If something repeats, decide how many times it should run or when it should stop.",
        ],
      },
      {
        id: "coding-flow-example",
        kind: "example",
        title: "Worked example",
        content: [
          "If a player has 3 lives left, keep playing; otherwise show 'Game over'.",
          "A loop can then move an enemy left and right five times without writing the same instruction again and again.",
        ],
      },
      {
        id: "coding-flow-exam",
        kind: "exam",
        title: "Explain it clearly",
        content: [
          "Define control flow, mention conditions and loops, and give one simple coding example.",
          "Show the rule, the possible paths, and the benefit of repetition when steps stay the same.",
        ],
      },
      {
        id: "coding-flow-mistakes",
        kind: "mistake-watch",
        title: "Common mistakes",
        content: [
          "Forgetting what should happen when the condition is false.",
          "Creating a loop without a clear stop rule.",
          "Using repeated code when a loop would be clearer.",
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

export function getTopicsBySubject(subjectId: string) {
  return topics.filter((topic) => topic.subjectId === subjectId);
}

export function getTopicById(topicId: string) {
  return topics.find((topic) => topic.id === topicId);
}

export function getQuestions(subjectId?: string, topicId?: string) {
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

export function getExamContext(subjectId: string) {
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
      href: getPublicSubjectHref(subject.id),
    }));

  const topicHits = topics
    .filter((topic) => `${topic.title} ${topic.summary} ${topic.tags.join(" ")}`.toLowerCase().includes(normalized))
    .map((topic) => ({
      id: topic.id,
      label: topic.title,
      sublabel: getSubjectById(topic.subjectId)?.name ?? "Topic",
      href: getPublicTopicHref(topic.subjectId, topic.id),
    }));

  return [...subjectHits, ...topicHits].slice(0, 8);
}
