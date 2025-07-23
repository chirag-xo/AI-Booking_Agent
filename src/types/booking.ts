export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  duration: number; // in minutes
}

export interface Booking {
  id: string;
  date: string;
  time: string;
  duration: number;
  title: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
  type: 'text' | 'booking-options' | 'calendar' | 'confirmation';
  data?: any;
}

export interface ConversationState {
  intent: 'booking' | 'checking' | 'confirming' | 'idle';
  preferredDate?: string;
  preferredTime?: string;
  duration?: number;
  selectedSlot?: TimeSlot;
  step: number;
}