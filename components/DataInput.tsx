
import React, { useState } from 'react';
import { InputMode } from '../types';

interface DataInputProps {
  onProcess: (data: string) => void;
  isLoading: boolean;
}

const DataInput: React.FC<DataInputProps> = ({ onProcess, isLoading }) => {
  const [mode, setMode] = useState<InputMode>('paste');
  const [text, setText] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onProcess(text);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setMode('paste')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            mode === 'paste' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Paste Data
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            mode === 'upload' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Upload File
        </button>
      </div>

      <div className="p-6">
        {mode === 'paste' ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste CSV, JSON array, or plain text table data here..."
            className="w-full h-64 p-4 text-sm mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
          />
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".csv,.json,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-slate-600 font-medium">Click to upload or drag and drop</p>
            <p className="text-slate-400 text-xs mt-1">Supports CSV, JSON, TXT</p>
            {text && <p className="mt-4 text-xs font-mono text-blue-600">File loaded: {text.length} characters</p>}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !text.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none transition-all flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing Data...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Dictionary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataInput;
