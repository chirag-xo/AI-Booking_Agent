export interface GoogleAuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    name: string;
    picture?: string;
  } | null;
  accessToken: string | null;
}

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
  }>;
}