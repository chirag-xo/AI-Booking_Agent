import React from 'react';
import { Bot, Settings } from 'lucide-react';
import { AuthButton } from './AuthButton';

export const ChatHeader: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Booking Assistant</h1>
            <p className="text-sm text-gray-500">Ready to help you schedule appointments</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <AuthButton />
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};