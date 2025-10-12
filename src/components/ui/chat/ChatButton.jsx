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
        // Primero verificamos si el servidor está activo
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ws-test`);
        const data = await response.json();
        
        if (!data.status || data.status !== 'active') {
          setConnectionStatus('server-error');
          console.error('El servidor WebSocket no está activo', data);
          return;
        }
        
        // Ahora intentamos establecer una conexión WebSocket
        const ws = new WebSocket(data.wsEndpoint);
        
        ws.onopen = () => {
          console.log('Conexión WebSocket establecida correctamente');
          setConnectionStatus('connected');
          // Cerramos esta conexión de prueba
          setTimeout(() => {
            ws.close();
          }, 500);
        };
        
        ws.onerror = (error) => {
          console.error('Error en la conexión WebSocket:', error);
          setConnectionStatus('error');
        };
        
        // Si no se conecta en 3 segundos, asumimos que hay un problema
        const timeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.error('Timeout al intentar conectar con el WebSocket');
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
        console.error('Error al verificar la conexión WebSocket:', error);
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
              title="Problema con la conexión al chat">
        </span>
      )}
    </button>
  );
};

export default ChatButton; 