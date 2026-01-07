
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DataDictionary } from '../types';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  history: ChatMessage[];
  isLoading: boolean;
  dictionary: DataDictionary;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, history, isLoading, dictionary }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const suggestions = [
    "What columns contain PII?",
    "Write a SQL query for this table",
    "Explain the business logic",
    "Identify potential data types issues"
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px] lg:sticky lg:top-24">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="font-bold text-slate-800">Chat with Schema</h3>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 border border-slate-100 rounded">Active Context: {dictionary.table_name}</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-50/30"
      >
        {history.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400 mb-6 px-4">Ask anything about your data dictionary. Try a suggestion below:</p>
            <div className="flex flex-wrap gap-2 justify-center px-4">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-all text-slate-600 shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white rounded-b-xl">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-white rounded-lg transition-colors disabled:text-slate-300"
          >
            <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
