'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (text: string) => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  closeChat: () => void;
  openChat: () => void;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Initialize WebSocket and handle events
  useEffect(() => {
    // Only connect to websocket if user is authenticated
    const userIdFromStorage = localStorage.getItem('userId');
    if (!userIdFromStorage) {
      return;
    }
    
    setUserId(userIdFromStorage);
    // Try to get the username or use a default
    const userNameFromStorage = localStorage.getItem('userName') || 'User';
    setUserName(userNameFromStorage);

    // Connect to WebSocket server
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/chat'}`);
    setSocket(ws);

    // Setup event handlers
    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          setMessages(prev => [...prev, {
            id: data.id,
            text: data.text,
            userId: data.userId,
            userName: data.userName,
            timestamp: new Date(data.timestamp)
          }]);
        } else if (data.type === 'history') {
          setMessages(data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Function to send messages
  const sendMessage = (text: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !userId || !userName) {
      console.error('Cannot send message, connection not established');
      return;
    }

    const message = {
      type: 'message',
      userId,
      userName,
      text,
      timestamp: new Date().toISOString()
    };

    socket.send(JSON.stringify(message));
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);
  const closeChat = () => setIsChatOpen(false);
  const openChat = () => setIsChatOpen(true);

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        isChatOpen,
        toggleChat,
        closeChat,
        openChat,
        isConnected
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}; 