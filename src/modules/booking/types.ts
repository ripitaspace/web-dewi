export interface TimeRange {
  start: Date;
  end: Date;
}

export interface AvailabilitySlot {
  startUtc: string;
  endUtc: string;
}

export interface AvailabilityDay {
  date: string;
  slots: AvailabilitySlot[];
}

export interface CalendarOption {
  id: string;
  summary: string;
  primary: boolean;
  accessRole: string;
  timeZone: string | null;
}

export interface GoogleCalendarEvent {
  id?: string;
  status?: string;
  summary?: string;
  htmlLink?: string;
  hangoutLink?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  conferenceData?: {
    entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
  };
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

export class BookingApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "BookingApiError";
  }
}
