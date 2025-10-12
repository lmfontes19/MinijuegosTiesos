'use client'
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { X, Send } from 'lucide-react';

const ChatPanel: React.FC = () => {
  const { messages, sendMessage, isChatOpen, closeChat, isConnected } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  // Auto-scroll down when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    sendMessage(inputValue);
    setInputValue('');
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed top-16 bottom-0 right-0 w-full sm:w-[450px] bg-[#0F172A] border-l border-[#1E293B] shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1E293B] border-b border-[#334155]">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-2" style={{ 
            backgroundColor: isConnected ? '#10B981' : '#EF4444',
            boxShadow: isConnected ? '0 0 6px #10B981' : '0 0 6px #EF4444'
          }}></div>
          <h3 className="font-medium text-white">Chat {isConnected ? 'Online' : 'Disconnected'}</h3>
        </div>
        <button 
          onClick={closeChat}
          className="p-1 rounded-full hover:bg-[#334155] transition-colors"
          aria-label="Close chat"
        >
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to write!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.userId === userId;
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isCurrentUser 
                      ? 'bg-[#6366F1] text-white' 
                      : 'bg-[#1E293B] text-white'
                  }`}
                >
                  <div className={`text-xs mb-1 ${
                    isCurrentUser 
                      ? 'text-indigo-200' 
                      : 'text-gray-400'
                  }`}>
                    {message.userName}
                  </div>
                  <p>{message.text}</p>
                  <div className="text-xs mt-1 text-right opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <form 
        onSubmit={handleSubmit}
        className="p-3 border-t border-[#1E293B] bg-[#0F172A]"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#6366F1]"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="bg-[#6366F1] text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isConnected || inputValue.trim() === ''}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel; 