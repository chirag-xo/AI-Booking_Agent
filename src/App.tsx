import React, { useState, useEffect, useRef } from 'react';
import { Message } from './types/booking';
import { agentService } from './services/agentService';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Hi! I'm your AI scheduling assistant. I can help you book appointments, check availability, and manage your calendar. Just tell me what you need in natural language - like 'Book a meeting for tomorrow afternoon' or 'Do you have any free time this Friday?'",
      sender: 'agent',
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    setMessages([welcomeMessage]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const agentResponses = agentService.generateResponse(text);
      setMessages(prev => [...prev, ...agentResponses]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 seconds delay
  };

  const handleTimeSlotSelect = (data: any) => {
    if (data.confirmed !== undefined) {
      // Handle confirmation response
      const confirmationText = data.confirmed ? 'yes' : 'no';
      handleSendMessage(confirmationText);
    } else {
      // Handle time slot selection
      setIsTyping(true);
      setTimeout(() => {
        const responses = agentService.selectTimeSlot(data);
        setMessages(prev => [...prev, ...responses]);
        setIsTyping(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ChatHeader />
      
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onTimeSlotSelect={handleTimeSlotSelect}
            />
          ))}
          
          {isTyping && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isTyping}
        />
      </div>
    </div>
  );
}

export default App;