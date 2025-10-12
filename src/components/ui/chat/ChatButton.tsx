'use client'
import { useChat } from '@/contexts/ChatContext';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const ChatButton = () => {
  const { toggleChat, isChatOpen, isConnected } = useChat();
  
  return (
    <button
      onClick={toggleChat}
      className="relative flex items-center gap-1 px-3 py-2 rounded-lg text-white hover:bg-[#1E293B] transition-colors"
      aria-label={isChatOpen ? "Close chat" : "Open chat"}
    >
      <MessageCircle size={18} className={isChatOpen ? "text-[#6366F1]" : "text-white"} />
      {isChatOpen ? (
        <ChevronRight size={18} className="text-[#6366F1]" />
      ) : (
        <ChevronLeft size={18} className="text-white" />
      )}
      
      {/* Connection indicator */}
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ 
        backgroundColor: isConnected ? '#10B981' : '#EF4444',
        boxShadow: isConnected ? '0 0 4px #10B981' : '0 0 4px #EF4444'
      }}></div>
    </button>
  );
};

export default ChatButton; 