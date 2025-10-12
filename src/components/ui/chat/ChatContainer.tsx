'use client'
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';
import ChatPanel from './ChatPanel';

const ChatContainer: React.FC = () => {
  const { isChatOpen } = useChat();
  const pathname = usePathname();
  const [isDashboard, setIsDashboard] = useState(false);
  
  // Detectar si estamos en el dashboard
  useEffect(() => {
    setIsDashboard(pathname.includes('/dashboard'));
  }, [pathname]);

  // Si el chat está cerrado, no renderizamos nada
  if (!isChatOpen) return null;

  return (
    <>
      {/* Para la vista de dashboard, el CSS lo maneja directamente el componente del dashboard */}
      <ChatPanel />
    </>
  );
};

export default ChatContainer; 