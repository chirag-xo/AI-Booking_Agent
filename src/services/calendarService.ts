import { TimeSlot, Booking } from '../types/booking';

class CalendarService {
  private bookings: Booking[] = [
    {
      id: '1',
      date: '2025-01-15',
      time: '10:00',
      duration: 60,
      title: 'Team Meeting',
      status: 'confirmed',
      createdAt: '2025-01-10T10:00:00Z'
    },
    {
      id: '2',
      date: '2025-01-16',
      time: '14:00',
      duration: 30,
      title: 'Client Call',
      status: 'confirmed',
      createdAt: '2025-01-11T15:30:00Z'
    }
  ];

  generateTimeSlots(date: string): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const workingHours = [9, 10, 11, 13, 14, 15, 16, 17];
    
    workingHours.forEach(hour => {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const isBooked = this.bookings.some(
        booking => booking.date === date && booking.time === timeString
      );
      
      slots.push({
        id: `${date}-${timeString}`,
        date,
        time: timeString,
        available: !isBooked,
        duration: 60
      });
    });
    
    return slots;
  }

  getAvailableSlots(date: string): TimeSlot[] {
    return this.generateTimeSlots(date).filter(slot => slot.available);
  }

  getSlotsForWeek(startDate: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      slots.push(...this.generateTimeSlots(dateString));
    }
    return slots;
  }

  bookSlot(slot: TimeSlot, title: string = 'Meeting'): Booking {
    const booking: Booking = {
      id: Date.now().toString(),
      date: slot.date,
      time: slot.time,
      duration: slot.duration,
      title,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    
    this.bookings.push(booking);
    return booking;
  }

  getBookings(): Booking[] {
    return this.bookings;
  }

  parseNaturalDate(input: string): string | null {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('today')) {
      return today.toISOString().split('T')[0];
    }
    
    if (lowerInput.includes('tomorrow')) {
      return tomorrow.toISOString().split('T')[0];
    }
    
    if (lowerInput.includes('friday')) {
      const friday = new Date(today);
      const daysUntilFriday = (5 - today.getDay() + 7) % 7;
      friday.setDate(today.getDate() + daysUntilFriday);
      return friday.toISOString().split('T')[0];
    }
    
    if (lowerInput.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }
    
    // Try to parse specific dates
    const dateMatch = lowerInput.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (dateMatch) {
      const [, month, day, year] = dateMatch;
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return null;
  }

  parseNaturalTime(input: string): string | null {
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let [, hours, minutes = '00', period] = timeMatch;
      let hour = parseInt(hours);
      
      if (period) {
        if (period.toLowerCase() === 'pm' && hour !== 12) {
          hour += 12;
        } else if (period.toLowerCase() === 'am' && hour === 12) {
          hour = 0;
        }
      }
      
      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    }
    
    if (input.includes('afternoon')) {
      return '14:00';
    }
    
    if (input.includes('morning')) {
      return '10:00';
    }
    
    return null;
  }
}

export const calendarService = new CalendarService();