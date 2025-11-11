'use client'
import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

const ChatButton = () => {
  const { toggleChat } = useChat();
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    const checkWebSocketConnection = async () => {
      try {
        // First we check if the server is active
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ws-test`);
        const data = await response.json();
        
        if (!data.status || data.status !== 'active') {
          setConnectionStatus('server-error');
          console.error('The WebSocket server is not active', data);
          return;
        }
        
        // Now we try to establish a WebSocket connection
        const ws = new WebSocket(data.wsEndpoint);
        
        ws.onopen = () => {
          console.log('WebSocket connection established successfully');
          setConnectionStatus('connected');
          // We close this test connection
          setTimeout(() => {
            ws.close();
          }, 500);
        };
        
        ws.onerror = (error) => {
          console.error('Error in WebSocket connection:', error);
          setConnectionStatus('error');
        };
        
        // If it doesn't connect in 3 seconds, we assume there's a problem
        const timeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.error('Timeout trying to connect to WebSocket');
            setConnectionStatus('timeout');
            ws.close();
          }
        }, 3000);
        
        return () => {
          clearTimeout(timeout);
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
      } catch (error) {
        console.error('Error verifying WebSocket connection:', error);
        setConnectionStatus('error');
      }
    };
    
    checkWebSocketConnection();
  }, []);

  return (
    <button 
      onClick={toggleChat}
      className="relative p-2 rounded-full bg-[#6366F1] text-white hover:bg-[#4F46E5] transition-colors"
      aria-label="Toggle chat"
    >
      <MessageCircle size={22} />
      
      {connectionStatus !== 'connected' && connectionStatus !== 'checking' && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" 
              title="Problem with chat connection">
        </span>
      )}
    </button>
  );
};

export default ChatButton; 