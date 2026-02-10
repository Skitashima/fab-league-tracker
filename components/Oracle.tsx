import React, { useState, useEffect, useRef } from 'react';
import { createOracleChat } from '../services/geminiService';
import { Player, ChatMessage } from '../types';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface OracleProps {
  players: Player[];
}

export const Oracle: React.FC<OracleProps> = ({ players }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Saludos, héroe. Soy el Oráculo de Rathe. Conozco el estado de tu liga y los secretos del juego. ¿En qué puedo iluminarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when component mounts or players change (context update)
  useEffect(() => {
    chatRef.current = createOracleChat(players);
  }, [players]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatRef.current || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessageStream(userMsg.text);
      
      let fullResponse = "";
      const modelMsgId = Date.now(); // Temp ID for streaming updates
      
      // Add placeholder for model response
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: new Date() }]);

      for await (const chunk of result) {
        const text = chunk.text || "";
        fullResponse += text;
        
        // Update the last message
        setMessages(prev => {
          const newArr = [...prev];
          newArr[newArr.length - 1] = { 
            role: 'model', 
            text: fullResponse, 
            timestamp: new Date() 
          };
          return newArr;
        });
      }
    } catch (error) {
      console.error("Oracle error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'La conexión con el éter se ha roto. Por favor intenta de nuevo.', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
      <div className="p-4 bg-gradient-to-r from-purple-900 to-gray-900 border-b border-gray-700 flex items-center gap-3">
        <div className="p-2 bg-purple-500/20 rounded-full">
          <Sparkles className="text-purple-300 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">El Oráculo de Rathe</h2>
          <p className="text-xs text-purple-300">Juez L3 & Estratega IA</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-600' : 'bg-purple-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-gray-700 text-white rounded-tr-none' 
                  : 'bg-purple-900/40 text-gray-200 border border-purple-800/50 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-purple-900/20 px-4 py-2 rounded-full text-xs text-purple-300 animate-pulse">
              Consultando las cartas...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre reglas o estrategia..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
        />
        <Button type="submit" disabled={isLoading || !input.trim()} className="bg-purple-600 hover:bg-purple-700">
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
};