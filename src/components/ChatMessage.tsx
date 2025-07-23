import React from 'react';
import { Message } from '../types/booking';
import { User, Bot, Calendar, Clock, Check } from 'lucide-react';
import { TimeSlotSelector } from './TimeSlotSelector';
import { CalendarView } from './CalendarView';
import { useAuth } from '../contexts/AuthContext';
import { googleCalendarService } from '../services/googleCalendarService';

interface ChatMessageProps {
  message: Message;
  onTimeSlotSelect?: (slot: any) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onTimeSlotSelect }) => {
  const { authState } = useAuth();
  const isUser = message.sender === 'user';

  const eventCreatedRef = React.useRef(false); // 🧠 Prevent double creation

  React.useEffect(() => {
    const shouldCreate = message.data?.shouldCreateCalendarEvent && 
                         message.data?.booking && 
                         authState.isAuthenticated && 
                         authState.accessToken;

    if (shouldCreate && !eventCreatedRef.current) {
      eventCreatedRef.current = true; // ✅ Mark as handled

      const createCalendarEvent = async () => {
        try {
          const calendarEvent = googleCalendarService.formatEventForCalendar(message.data.booking);
          await googleCalendarService.createCalendarEvent(authState.accessToken!, calendarEvent);
          console.log('✅ Calendar event created successfully');
        } catch (error) {
          console.error('Failed to create calendar event:', error);
          alert('Event was booked but failed to add to Google Calendar. Please add it manually.');
        }
      };

      createCalendarEvent();
    }
  }, [message.data, authState]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`p-4 rounded-2xl ${
            isUser
              ? 'bg-blue-600 text-white ml-auto'
              : 'bg-white border border-gray-200 shadow-sm'
          }`}
        >
          {message.type === 'text' && (
            <div className="whitespace-pre-wrap">
              {message.text.split('\n').map((line, index) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <div key={index} className="font-semibold mb-1">
                      {line.replace(/\*\*/g, '')}
                    </div>
                  );
                }
                return <div key={index}>{line}</div>;
              })}
            </div>
          )}

          {message.type === 'booking-options' && (
            <div>
              <p className="mb-3">{message.text}</p>
              <TimeSlotSelector
                slots={message.data.slots}
                date={message.data.date}
                onSlotSelect={onTimeSlotSelect}
              />
            </div>
          )}

          {message.type === 'calendar' && (
            <div>
              <p className="mb-3">{message.text}</p>
              <CalendarView
                slots={message.data.slots}
                onSlotSelect={onTimeSlotSelect}
              />
            </div>
          )}

          {message.type === 'confirmation' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Booking Confirmation</span>
              </div>
              <p className="mb-3">{message.text}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onTimeSlotSelect?.({ confirmed: true })}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirm
                </button>
                <button
                  onClick={() => onTimeSlotSelect?.({ confirmed: false })}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};
