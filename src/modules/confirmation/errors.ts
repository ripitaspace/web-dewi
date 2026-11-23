export class ConfirmationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

export const INVALID_CONFIRMATION_MESSAGE = "Tautan konfirmasi tidak valid, sudah tidak aktif, atau sudah kedaluwarsa.";
