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
  | "reflection"
  | "markdown"
  | "glossary"
  | "worked_example"
  | "callout"
  | "comparison_table"
  | "deep_dive"
  | "reference"
  | "audit_workpaper";

export type LearningRole =
  | "discover"
  | "understand"
  | "observe"
  | "guided_practice"
  | "independent_practice"
  | "reflect"
  | "deep_dive";

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
  workpaper?: Record<string, string>;
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
  feedbackByOption?: Record<string, string>;
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
  role?: LearningRole;
  content?: string;
  hints?: string[];
  remediation?: { onIncorrect: { targetBlockId: string } };
  glossaryItems?: { term: string; definition: string }[];
  steps?: { title: string; explanation: string }[];
  variant?: "tip" | "warning" | "note";
  columns?: string[];
  rows?: (string | number)[][];
  referenceIds?: string[];
  optional?: boolean;
  reviewMode?: "manual" | "self";
  workpaper?: {
    artifactId: string;
    caseId: "dephta" | "kumar";
    fields: { id: string; label: string; placeholder?: string; required?: boolean }[];
    carryForwardTo?: string[];
  };
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
  prerequisites?: { moduleIds: string[]; competencyIds: string[]; notes?: string };
  learningPolicy?: {
    allowRetry: boolean;
    feedbackTiming: "after_submit";
    hintMode: "guided_only" | "always" | "off";
    timerMode: "advisory";
    allowSkip: boolean;
    remediationEnabled: boolean;
    solutionsAfterAttempt: boolean;
  };
  reportPolicy?: {
    scope: "module" | "learning_unit";
    formats: ("json" | "print")[];
    downloadOnCompletion: boolean;
    dataLocation: "client_only";
  };
  references?: { id: string; title: string; type: string; url: string | null; edition?: string | null }[];
  assets?: { id: string; title: string; summary: string; pageIds: string[]; caseId?: "dephta" | "kumar" }[];
  outline?: { type: "section"; id: string; title: string; children: { type: "unit"; unitId: string }[] }[];
  learningUnits?: SelfLearningUnit[];
}

export interface Worksheet {
  id: string;
  title: string;
  mode: "guided" | "independent";
  difficulty: "easy" | "medium" | "hard";
  complexityWeight: number;
  targetMinutes: { min: number; max: number };
  scoreWeight: number;
  blockIds: string[];
}

export interface SelfLearningUnit {
  id: string;
  title: string;
  learningObjectives: string[];
  competencyIds: string[];
  prerequisiteUnitIds: string[];
  pageIds: string[];
  worksheets: Worksheet[];
  masteryCriteria: { minimumScore: number; requiredWorksheetIds: string[] };
  report: { enabled: boolean };
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
  contentStatus: LearningContentStatus;
  catalogKind: LearningCatalogKind;
}

export type PublicationStatus = "draft" | "published" | "archived";
export type LearningLevel = "beginner" | "intermediate" | "advanced";
export type LearningContentStatus = "available" | "pending";
export type LearningCatalogKind = "module" | "chapter" | "supplementary";

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
  /** Stable, learner-facing identifier, for example MOD-AKT-001. */
  publicCode: string;
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
  /** Pending entries are visible in the catalog but cannot open a learning player. */
  contentStatus?: LearningContentStatus;
  /** Chapters and supplementary modules may share a topic without implying equal scope. */
  catalogKind?: LearningCatalogKind;
}
