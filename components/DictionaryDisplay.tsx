
import React from 'react';
import { DataDictionary } from '../types';

interface DictionaryDisplayProps {
  data: DataDictionary;
}

const DictionaryDisplay: React.FC<DictionaryDisplayProps> = ({ data }) => {
  const copyToClipboard = () => {
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json);
    alert('Dictionary copied as JSON!');
  };

  const downloadMarkdown = () => {
    let md = `# Data Dictionary: ${data.table_name}\n\n`;
    md += `## Summary\n${data.summary}\n\n`;
    md += `## Columns\n\n`;
    md += `| Column Name | Data Type | Description | Constraints | Examples |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    data.columns.forEach(col => {
      md += `| ${col.name} | ${col.inferred_type} | ${col.description} | ${col.constraints.join(', ')} | ${col.example_values.slice(0, 2).join(', ')} |\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.table_name.toLowerCase().replace(/\s+/g, '_')}_dictionary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wider">Table</span>
              <h2 className="text-2xl font-bold text-slate-900">{data.table_name}</h2>
            </div>
            <p className="text-slate-500 max-w-2xl">{data.summary}</p>
          </div>
          <div className="flex space-x-2">
             <button 
              onClick={copyToClipboard}
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-lg"
              title="Copy JSON"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </button>
            <button 
              onClick={downloadMarkdown}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Markdown</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Column</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Definition</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Constraints</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Samples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-semibold text-blue-600">{col.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded font-mono">
                      {col.inferred_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-sm text-slate-600 leading-relaxed">{col.description}</p>
                    {col.business_logic && (
                      <p className="mt-1 text-xs text-slate-400 italic">Rule: {col.business_logic}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {col.constraints.map((c, i) => (
                        <span key={i} className="px-1.5 py-0.5 border border-slate-200 text-slate-400 text-[10px] font-bold rounded uppercase">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-mono text-slate-400 space-y-1">
                      {col.example_values.slice(0, 3).map((val, i) => (
                        <div key={i} className="truncate max-w-[150px]">"{val}"</div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DictionaryDisplay;
