export type BlockType =
  | "reading"
  | "image"
  | "video"
  | "audio"
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "number_input"
  | "matching"
  | "ordering"
  | "journal_entry"
  | "case_decision"
  | "reflection";

export interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
}
export interface Answer {
  selected?: string;
  selections?: string[];
  truth?: boolean;
  value?: string;
  matches?: Record<string, string>;
  order?: string[];
  lines?: JournalLine[];
  text?: string;
}
export interface Grading {
  points: number;
  explanation?: string;
  partialCredit?: boolean;
  correctOptionId?: string;
  correctOptionIds?: string[];
  correct?: boolean;
  correctValue?: number;
  tolerance?: number;
  correctOrder?: string[];
  expectedLines?: JournalLine[];
  optionScores?: Record<string, number>;
}
export interface Block {
  id: string;
  type: BlockType;
  title?: string;
  required?: boolean;
  competencyIds?: string[];
  markdown?: string;
  src?: string;
  alt?: string;
  caption?: string;
  minCoverage?: number;
  prompt?: string;
  scenario?: string;
  unit?: string;
  options?: { id: string; text: string }[];
  pairs?: { id: string; left: string; right: string }[];
  items?: { id: string; text: string }[];
  accounts?: string[];
  rubric?: string[];
  grading?: Grading;
}
export interface LearningModule {
  kind: string;
  schemaVersion: string;
  id: string;
  revision: number;
  metadata: {
    title: string;
    summary: string;
    subject: string;
    level: string;
    estimatedMinutes: number;
    tags: string[];
    author: string;
  };
  experience: { profile: string; navigation: string; allowResume: boolean };
  competencies: { id: string; title: string }[];
  assessment: {
    passingScore: number;
    requireAllRequired: boolean;
    attemptPolicy: string;
  };
  pages: { id: string; title: string; blocks: Block[] }[];
}
export interface Attempt {
  at: string;
  answer: Answer;
  earned: number;
  max: number;
  feedback: string;
}
export interface MediaRecord {
  ranges: [number, number][];
  duration: number;
  coverage: number;
  playbackSeconds: number;
  seeks: number;
}
export interface Session {
  sessionId: string;
  moduleId: string;
  revision: number;
  startedAt: string;
  endedAt: string | null;
  pageIndex: number;
  answers: Record<string, Answer>;
  attempts: Record<string, Attempt[]>;
  completed: Record<string, boolean>;
  media: Record<string, MediaRecord>;
  activeSeconds: number;
  activitySeconds: Record<string, number>;
}
export interface ModuleCard {
  slug: string;
  id: string;
  revision: number;
  title: string;
  summary: string;
  subject: string;
  minutes: number;
  level: string;
  pages: number;
  activities: number;
}

export type PublicationStatus = "draft" | "published" | "archived";
export type LearningLevel = "beginner" | "intermediate" | "advanced";

/** A top-level field of study shown in the public learning catalog. */
export interface LearningDomain {
  id: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  status: "draft" | "published";
}

/** Topics and subtopics share one recursive record; nesting is defined by parentId. */
export interface LearningTopic {
  id: string;
  domainId: string;
  parentId: string | null;
  slug: string;
  title: string;
  description?: string;
  order: number;
  status: "draft" | "published";
}

export interface LearningUnit {
  id: string;
  title: string;
  description?: string;
  learningObjectives: string[];
  content: Block[];
  reportEnabled: boolean;
}

/** Optional groups let future modules present chapters without requiring them. */
export type LearningNode =
  | { id: string; type: "group"; title: string; children: LearningNode[] }
  | { id: string; type: "unit"; unit: LearningUnit };

/** Catalog metadata deliberately stays separate from the interactive PLF payload. */
export interface LearningModuleRegistration {
  id: string;
  slug: string;
  title: string;
  description: string;
  primaryTopicId: string;
  relatedTopicIds?: string[];
  version: string;
  level: LearningLevel;
  status: PublicationStatus;
  estimatedMinutes?: number;
  tags?: string[];
  publishedAt?: string;
  learningUnitCount?: number;
  activityCount?: number;
}
