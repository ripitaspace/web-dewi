export const CONFIRMATION_TYPES = ["PIUTANG", "UTANG", "BANK", "LAINNYA"] as const;

export type ConfirmationType = (typeof CONFIRMATION_TYPES)[number];
export type AnswerMethod = "ONLINE" | "UPLOAD";

export type ConfirmationSettings = {
  kodeKlien: string;
  namaKlien: string;
  emailNotifikasi: string[];
  whatsappNotifikasi: string;
  folderJawabanId?: string;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
};

export type ConfirmationRecord = {
  clientCode: string;
  confirmationCode: string;
  token: string;
  recipientName: string;
  recipientEmail: string;
  entityName: string;
  type: ConfirmationType;
  confirmationDate: string;
  balanceDate: string;
  currency: string;
  balance: number | null;
  description: string;
  expiresAt: string;
  status: string;
  extra: Record<string, string>;
};

export type PublicConfirmation = ConfirmationRecord & {
  settings: Pick<ConfirmationSettings, "kodeKlien" | "namaKlien">;
};

export type AnswerInput = {
  method: AnswerMethod;
  responseStatus?: "SESUAI" | "BERBEDA" | "DITERIMA";
  respondentBalance?: number | null;
  differenceExplanation?: string;
  notes?: string;
  respondentName: string;
  respondentRole: string;
  respondentDate: string;
  agreed: boolean;
  idempotencyKey: string;
};

export type SubmissionResult = {
  receiptId: string;
  receivedAt: string;
  duplicate: boolean;
  notification: "SENT" | "SKIPPED" | "FAILED";
};
