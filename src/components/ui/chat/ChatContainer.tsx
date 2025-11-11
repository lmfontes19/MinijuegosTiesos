'use client'
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';
import ChatPanel from './ChatPanel';

const ChatContainer: React.FC = () => {
  const { isChatOpen } = useChat();
  const pathname = usePathname();
  const [isDashboard, setIsDashboard] = useState(false);
  
  // Detect if we are in the dashboard
  useEffect(() => {
    setIsDashboard(pathname.includes('/dashboard'));
  }, [pathname]);

  // If the chat is closed, we don't render anything
  if (!isChatOpen) return null;

  return (
    <>
      {/* For the dashboard view, the CSS is handled directly by the dashboard component */}
      <ChatPanel />
    </>
  );
};

export default ChatContainer; 