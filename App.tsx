
import React, { useState } from 'react';
import Header from './components/Header';
import DataInput from './components/DataInput';
import DictionaryDisplay from './components/DictionaryDisplay';
import ChatInterface from './components/ChatInterface';
import { generateDataDictionary, chatWithDataDictionary } from './services/geminiService';
import { AppState, ChatMessage } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isLoading: false,
    isChatLoading: false,
    error: null,
    dictionary: null,
    rawInput: '',
    chatHistory: [],
  });

  const handleProcessData = async (data: string) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      rawInput: data,
      chatHistory: [],
      dictionary: null
    }));
    
    try {
      const sample = data.length > 5000 ? data.substring(0, 5000) : data;
      const result = await generateDataDictionary(sample);
      setState(prev => ({ ...prev, isLoading: false, dictionary: result }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || 'Failed to generate dictionary. Please check your input format.' 
      }));
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!state.dictionary) return;

    const userMsg: ChatMessage = { role: 'user', content };
    setState(prev => ({
      ...prev,
      isChatLoading: true,
      chatHistory: [...prev.chatHistory, userMsg]
    }));

    try {
      const response = await chatWithDataDictionary(state.dictionary, content, state.chatHistory);
      const aiMsg: ChatMessage = { role: 'model', content: response };
      setState(prev => ({
        ...prev,
        isChatLoading: false,
        chatHistory: [...prev.chatHistory, aiMsg]
      }));
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = { role: 'model', content: "Sorry, I encountered an error while processing your request." };
      setState(prev => ({
        ...prev,
        isChatLoading: false,
        chatHistory: [...prev.chatHistory, errorMsg]
      }));
    }
  };

  const handleReset = () => {
    setState({
      isLoading: false,
      isChatLoading: false,
      error: null,
      dictionary: null,
      rawInput: '',
      chatHistory: [],
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            AI Data Dictionary <span className="text-indigo-600">Generator</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 leading-8">
            Transform raw exports into professional schema documentation. 
            Once generated, you can chat with your schema to explore insights and write queries.
          </p>
        </div>

        {!state.dictionary ? (
          <div className="max-w-4xl mx-auto">
            <DataInput onProcess={handleProcessData} isLoading={state.isLoading} />
            
            {state.error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-red-800">Error Generating Dictionary</h3>
                  <p className="text-sm text-red-700 mt-1">{state.error}</p>
                </div>
              </div>
            )}

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Smart Analysis</h4>
                <p className="text-sm text-slate-500">Infers SQL types, constraints, and business logic from raw samples.</p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Interactive Chat</h4>
                <p className="text-sm text-slate-500">Ask questions about your data, generate SQL, and identify PII instantly.</p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Markdown Export</h4>
                <p className="text-sm text-slate-500">Download formatted tables for your project documentation or wikis.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-indigo-900">Successfully mapped "{state.dictionary.table_name}"</span>
              </div>
              <button 
                onClick={handleReset}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-all px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
              >
                Analyze New Data
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 min-w-0">
                <DictionaryDisplay data={state.dictionary} />
              </div>
              <div className="w-full lg:w-96 shrink-0">
                <ChatInterface 
                  dictionary={state.dictionary}
                  history={state.chatHistory}
                  isLoading={state.isChatLoading}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-100 py-10 text-center">
        <p className="text-sm text-slate-400">© 2024 Data Dictionary Generator • Built with Gemini Flash</p>
      </footer>
    </div>
  );
};

export default App;
