import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '../lib/axios';

const AiChat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Whats on your mind?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await api.get('/api/ai/chat');
        if (res.data.messages && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        }
      } catch (error) {
        console.error("Failed to fetch chat history", error);
      }
    };
    fetchChatHistory();
  }, []);

  useEffect(() => {
    // Delay slightly to ensure DOM has updated with new messages
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const promptContext = messages.map(m => `${m.role === 'ai' ? 'Coach' : 'User'}: ${m.content}`).join('\n') + `\nUser: ${input}\nCoach:`;
      
      const res = await api.post('/api/ai/chat', { 
        prompt: `You are a fitness and discipline coach for the TrackIt app. Context: ${promptContext}. Rules: 1. Act ONLY as a responder. 2. Provide guidance and suggestions in plain text only. 3. DO NOT suggest or confirm performing system actions (like "Should I add this habit?"). 4. Answer concisely and stay within the app's context of goals, habits, and fitness.`,
        saveChat: true,
        userMessage: input
      });
      
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response, timestamp: new Date() }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting right now. Let us try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-9rem)] overflow-hidden relative bg-secondary rounded-lg border-2 border-primary">
      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 ruled-line"></div>
      
      {/* Chat Container */}
      <ScrollArea className="flex-1 min-h-0 px-4 lg:px-8 py-12 relative z-10 " ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-12">
          
          {/* Date Header */}
          <div className="flex justify-center mb-8">
            <span className="bg-white px-4 py-1 text-xs font-newsreader uppercase tracking-widest border border-primary/20 rounded-full italic text-tertiary">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — Session
            </span>
          </div>

          <div className="space-y-8 animate-in fade-in duration-500">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center border-2 border-primary ${
                  msg.role === 'user' ? 'bg-secondary text-primary' : 'bg-primary text-white'
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {msg.role === 'user' ? 'edit' : 'psychology'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {msg.role === 'user' ? (
                    <div className="bg-primary text-white p-2 px-4 justify-end flex rounded-xl border-2 border-primary max-w-lg shadow-sm">
                      <p className="font-handwritten text-white text-3xl">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="paper-stack bg-white p-6 border-2 border-primary max-w-lg relative group">
                      <p className="font-epilogue text-lg text-primary leading-snug font-bold">
                        {msg.content}
                      </p>
                      
                      {/* SVG Doodle Mascot (only on first message for flair) */}
                      {idx === 0 && (
                        <div className="absolute -right-16 -top-8 w-24 h-24 opacity-40 transform rotate-12 pointer-events-none hidden md:block">
                          <svg className="w-full h-full text-primary fill-none stroke-current stroke-2" viewBox="0 0 100 100">
                            <path d="M30 70 C 35 60, 45 60, 50 70 M 60 70 C 65 60, 75 60, 80 70"></path>
                            <circle cx="40" cy="50" fill="currentColor" r="3"></circle>
                            <circle cx="70" cy="50" fill="currentColor" r="3"></circle>
                            <path d="M20 40 Q 50 10, 80 40 Q 90 70, 50 90 Q 10 70, 20 40" strokeDasharray="4 2"></path>
                            <path d="M45 20 Q 50 5, 55 20"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <p className="text-[10px] text-right text-tertiary font-newsreader uppercase tracking-widest">
                       {msg.timestamp ? formatTime(msg.timestamp) : 'Sent just now'}
                    </p>
                  )}
                </div>

              </div>
            ))}

            {loading && (
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 flex-shrink-0 bg-primary rounded-full flex items-center justify-center border-2 border-primary text-white">
                  <span className="material-symbols-outlined text-lg animate-pulse">psychology</span>
                </div>
                <div className="paper-stack bg-white p-6 border-2 border-primary max-w-lg flex gap-2 items-center">
                   <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                   <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="px-4 lg:px-8 pb-8 bg-secondary pt-4 relative z-20 border-t border-primary/10">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative bg-white border-2 border-primary paper-stack p-2 flex items-center gap-4">
            <span className="material-symbols-outlined text-primary ml-2 hidden sm:block">draw</span>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-transparent border-none focus:ring-0 font-newsreader text-xl text-primary placeholder-primary/30 py-2 outline-none font-bold" 
              placeholder="Spill your thoughts here..." 
              type="text"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-primary text-white p-3 rounded-none flex items-center justify-center active:scale-90 transition-transform duration-150 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>

        </div>
      </div>
      
    </div>
  );
};

export default AiChat;
