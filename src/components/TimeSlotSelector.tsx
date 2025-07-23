import React from 'react';
import { TimeSlot } from '../types/booking';
import { Clock, Calendar } from 'lucide-react';

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  date: string;
  onSlotSelect?: (slot: TimeSlot) => void;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  slots,
  date,
  onSlotSelect
}) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (slots.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No available time slots for this date</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(date)}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => onSlotSelect?.(slot)}
            className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 group"
          >
            <Clock className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
            <span className="font-medium">{formatTime(slot.time)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};