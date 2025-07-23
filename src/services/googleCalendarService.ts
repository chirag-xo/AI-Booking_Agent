import { CalendarEvent } from '../types/auth';
import { googleAuthService } from './googleAuthService';

class GoogleCalendarService {
  async createCalendarEvent(accessToken: string, event: CalendarEvent): Promise<any> {
    return googleAuthService.createCalendarEvent(accessToken, event);
  }

  async checkAvailability(accessToken: string, startTime: string, endTime: string): Promise<boolean> {
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: startTime,
          timeMax: endTime,
          items: [{ id: 'primary' }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check availability');
      }

      const data = await response.json();
      const busyPeriods = data.calendars?.primary?.busy || [];
      return busyPeriods.length === 0;
    } catch (error) {
      console.error('Error checking availability:', error);
      return true; // Assume available if check fails
    }
  }

  formatEventForCalendar(booking: any): CalendarEvent {
    const startDateTime = new Date(`${booking.date}T${booking.time}`);
    const endDateTime = new Date(startDateTime.getTime() + booking.duration * 60000);

    return {
      summary: booking.title || 'Meeting',
      description: `Appointment booked via AI Booking Assistant`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  }
}

export const googleCalendarService = new GoogleCalendarService();