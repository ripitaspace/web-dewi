export type MissionStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "SUBMITTED" | "REVISION_REQUIRED" | "MASTERED";

export type MissionKind = "click" | "drag" | "navigate" | "characters" | "shortcut" | "typing" | "classify" | "rename" | "organize" | "promotion";

export interface RankDefinition {
  id: string;
  number: number;
  name: string;
  competency: string;
  description: string;
}

export interface MissionDefinition {
  id: string;
  rankId: string;
  division: "III" | "II" | "I" | "PROMOTION";
  number: number;
  title: string;
  kind: MissionKind;
  objective: string;
  scenario: string;
  instructions: string[];
  competencies: string[];
  prerequisites: string[];
  relatedLearning?: string;
  relatedTool?: string;
  isPromotion?: boolean;
  playable: boolean;
}

export interface Evaluation {
  passed: boolean;
  category: string;
  feedback: string;
  hint: string;
  medal?: "Teliti" | "Cekatan" | "Tuntas";
  snapshot: Record<string, unknown>;
}

export interface AttemptRecord {
  at: string;
  passed: boolean;
  category: string;
  feedback: string;
  snapshot: Record<string, unknown>;
}

export interface TypingRecord {
  missionId: string;
  at: string;
  wpm: number;
  accuracy: number;
  errors: number;
  elapsedSeconds: number;
}

export interface RipintarState {
  schemaVersion: 1;
  onboardingSeen: boolean;
  missionStatuses: Record<string, MissionStatus>;
  attempts: Record<string, AttemptRecord[]>;
  stars: string[];
  medals: Record<string, string>;
  typingHistory: TypingRecord[];
  workpapers: Record<string, Record<string, unknown>>;
  completedAt: Record<string, string>;
  achievements: string[];
}
