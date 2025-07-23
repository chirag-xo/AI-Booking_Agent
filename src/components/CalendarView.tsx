import React from 'react';
import { TimeSlot } from '../types/booking';
import { Calendar, Clock } from 'lucide-react';

interface CalendarViewProps {
  slots: TimeSlot[];
  onSlotSelect?: (slot: TimeSlot) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ slots, onSlotSelect }) => {
  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-gray-900">Available Time Slots</h3>
      </div>
      
      <div className="space-y-4">
        {Object.entries(slotsByDate).map(([date, daySlots]) => {
          const availableSlots = daySlots.filter(slot => slot.available);
          if (availableSlots.length === 0) return null;
          
          const dateInfo = formatDate(date);
          
          return (
            <div key={date} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{dateInfo.day}</div>
                  <div className="text-xs text-gray-500 uppercase">{dateInfo.weekday}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{dateInfo.month}</div>
                  <div className="text-sm text-gray-500">{availableSlots.length} slots available</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => onSlotSelect?.(slot)}
                    className="p-2 text-sm border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-1 group"
                  >
                    <Clock className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                    <span>{formatTime(slot.time)}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};