import { Message, ConversationState, TimeSlot } from '../types/booking';
import { calendarService } from './calendarService';
import { googleCalendarService } from './googleCalendarService';
import * as chrono from 'chrono-node'; // ✅ Fixed import

class AgentService {
  private conversationState: ConversationState = {
    intent: 'idle',
    step: 0
  };

  private greetings = [
    "Hi! I'm your scheduling assistant. How can I help you today?",
    "Hello! I'd be happy to help you book an appointment. What do you need?",
    "Hi there! Looking to schedule something? I'm here to help!"
  ];

  private confirmationMessages = [
    "Great! I've booked that appointment for you.",
    "Perfect! Your meeting is confirmed.",
    "All set! I've added that to your calendar."
  ];

  resetConversation() {
    this.conversationState = {
      intent: 'idle',
      step: 0
    };
  }

  generateResponse(userMessage: string): Message[] {
    const responses: Message[] = [];
    const lowerMessage = userMessage.toLowerCase();

    // Detect booking intent
    if (this.isBookingIntent(lowerMessage)) {
      this.conversationState.intent = 'booking';
      this.conversationState.step = 1;

      // ✅ Use chrono-node to parse date and time
      const parsedDate = chrono.parseDate(userMessage);
      if (parsedDate) {
        const isoDate = parsedDate.toISOString().split('T')[0];
        const time = parsedDate.toTimeString().slice(0, 5);
        this.conversationState.preferredDate = isoDate;
        this.conversationState.preferredTime = time;
      }

      return this.handleBookingIntent(userMessage);
    }

    // Handle availability checking
    if (this.isAvailabilityCheck(lowerMessage)) {
      return this.handleAvailabilityCheck(userMessage);
    }

    // Handle confirmation
    if (this.conversationState.intent === 'confirming') {
      return this.handleConfirmation(userMessage);
    }

    // Default greeting or help
    if (this.conversationState.intent === 'idle') {
      responses.push({
        id: Date.now().toString(),
        text: this.greetings[Math.floor(Math.random() * this.greetings.length)],
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'text'
      });
    }

    return responses;
  }

  private isBookingIntent(message: string): boolean {
    const bookingKeywords = [
      'book', 'schedule', 'appointment', 'meeting', 'call',
      'reserve', 'set up', 'arrange', 'plan'
    ];
    return bookingKeywords.some(keyword => message.includes(keyword));
  }

  private isAvailabilityCheck(message: string): boolean {
    const availabilityKeywords = [
      'available', 'free', 'open', 'any time', 'when can'
    ];
    return availabilityKeywords.some(keyword => message.includes(keyword));
  }

  private handleBookingIntent(userMessage: string): Message[] {
    const responses: Message[] = [];

    if (this.conversationState.preferredDate && this.conversationState.preferredTime) {
      const slots = calendarService.getAvailableSlots(this.conversationState.preferredDate);
      const requestedSlot = slots.find(slot => slot.time === this.conversationState.preferredTime);

      if (requestedSlot && requestedSlot.available) {
        this.conversationState.selectedSlot = requestedSlot;
        this.conversationState.intent = 'confirming';

        responses.push({
          id: Date.now().toString(),
          text: `Perfect! I can book you for ${this.formatDateTime(requestedSlot.date, requestedSlot.time)}. Shall I confirm this appointment?`,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          type: 'confirmation',
          data: { slot: requestedSlot }
        });
      } else {
        responses.push({
          id: Date.now().toString(),
          text: `I'm sorry, but that time slot isn't available. Let me show you what's open that day:`,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          type: 'text'
        });

        responses.push(...this.showAvailableSlots(this.conversationState.preferredDate));
      }
    } else if (this.conversationState.preferredDate) {
      responses.push({
        id: Date.now().toString(),
        text: `I can help you book something for ${this.formatDate(this.conversationState.preferredDate)}. Here are the available time slots:`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'text'
      });

      responses.push(...this.showAvailableSlots(this.conversationState.preferredDate));
    } else {
      responses.push({
        id: Date.now().toString(),
        text: "I'd be happy to help you schedule an appointment! When would you prefer to meet?",
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'text'
      });

      responses.push({
        id: (Date.now() + 1).toString(),
        text: "Here's what I have available this week:",
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'calendar',
        data: { slots: calendarService.getSlotsForWeek(new Date()) }
      });
    }

    return responses;
  }

  private handleAvailabilityCheck(userMessage: string): Message[] {
    const responses: Message[] = [];

    const parsedDate = chrono.parseDate(userMessage); // ✅ Use chrono-node here
    if (parsedDate) {
      const dateStr = parsedDate.toISOString().split('T')[0];
      const availableSlots = calendarService.getAvailableSlots(dateStr);
      if (availableSlots.length > 0) {
        responses.push({
          id: Date.now().toString(),
          text: `Yes, I have several openings on ${this.formatDate(dateStr)}:`,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          type: 'text'
        });

        responses.push(...this.showAvailableSlots(dateStr));
      } else {
        responses.push({
          id: Date.now().toString(),
          text: `I'm sorry, but I don't have any availability on ${this.formatDate(dateStr)}. Would you like to see other dates?`,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          type: 'text'
        });
      }
    } else {
      responses.push({
        id: Date.now().toString(),
        text: "Let me show you my availability for this week:",
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'calendar',
        data: { slots: calendarService.getSlotsForWeek(new Date()) }
      });
    }

    return responses;
  }

  private handleConfirmation(userMessage: string): Message[] {
    const responses: Message[] = [];
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('book')) {
      if (this.conversationState.selectedSlot) {
        const booking = calendarService.bookSlot(this.conversationState.selectedSlot);

        responses.push({
          id: Date.now().toString(),
          text: this.confirmationMessages[Math.floor(Math.random() * this.confirmationMessages.length)],
          sender: 'agent',
          timestamp: new Date().toISOString(),
          type: 'text'
        });

        responses.push({
          id: (Date.now() + 1).toString(),
          text: `📅 **Appointment Confirmed**\n\n**Date:** ${this.formatDate(booking.date)}\n**Time:** ${booking.time}\n**Duration:** ${booking.duration} minutes\n\nI'll add this to your Google Calendar now. Is there anything else I can help you with?`,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          type: 'text',
          data: { booking, shouldCreateCalendarEvent: true }
        });

        this.resetConversation();
      }
    } else if (lowerMessage.includes('no') || lowerMessage.includes('cancel')) {
      responses.push({
        id: Date.now().toString(),
        text: "No problem! Would you like to see other available times, or is there something else I can help you with?",
        sender: 'agent',
        timestamp: new Date().toISOString(),
        type: 'text'
      });

      this.conversationState.intent = 'booking';
      this.conversationState.selectedSlot = undefined;
    }

    return responses;
  }

  private showAvailableSlots(date: string): Message[] {
    const slots = calendarService.getAvailableSlots(date);

    return [{
      id: Date.now().toString(),
      text: "Available time slots:",
      sender: 'agent',
      timestamp: new Date().toISOString(),
      type: 'booking-options',
      data: { slots, date }
    }];
  }

  selectTimeSlot(slot: TimeSlot): Message[] {
    this.conversationState.selectedSlot = slot;
    this.conversationState.intent = 'confirming';

    return [{
      id: Date.now().toString(),
      text: `Great choice! I can book you for ${this.formatDateTime(slot.date, slot.time)}. Shall I confirm this appointment?`,
      sender: 'agent',
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      data: { slot }
    }];
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatDateTime(dateString: string, timeString: string): string {
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}

export const agentService = new AgentService();
