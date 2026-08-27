import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { aiAPI } from '../services/api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Terminal, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  BarChart2, 
  Table as TableIcon,
  HelpCircle,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export default function AiAssistantPage() {
  const navigate = useNavigate();
  const { activeDataset } = useData();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your **InsightFlow AI Analytics Assistant**. I can translate your natural-language business questions into validated analytical SQL, execute queries against your dataset, and explain the key findings. What would you like to analyze today?`
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "What are our top 5 products by total sales revenue?",
    "Show sales and profit margins across all categories",
    "Which geographic territory generated the most revenue?",
    "How has monthly revenue and profit trended over time?",
    "What is the average order value and customer segment distribution?"
  ];

  const handleSend = async (qText) => {
    const queryText = qText || inputQuestion;
    if (!queryText.trim()) return;

    const userMessage = { sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMessage]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await aiAPI.ask({
        question: queryText,
        datasetId: activeDataset?.id
      });

      const aiResponse = {
        sender: 'ai',
        text: res.data.explanation,
        data: res.data
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('AI query error:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ **Error**: ${err.response?.data?.error || 'Unable to process question. Please verify dataset is selected.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
              <Bot className="w-6 h-6 text-indigo-400" />
              <span>AI Analytics Assistant</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>SQL Synthesis & NL Engine</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask natural-language business questions. InsightFlow generates validated SQL, runs it against the warehouse, and explains the results.
          </p>
        </div>
      </div>

      {/* Suggested Starters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] font-semibold flex items-center space-x-1 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ask about:</span>
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-colors shrink-0 text-[11px] cursor-pointer"
          >
            "{p}"
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6 min-h-[450px] max-h-[650px] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start space-x-3.5 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/25">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm text-xs'
                : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-sm text-xs shadow-lg'
            }`}>
              <div className="leading-relaxed whitespace-pre-line">
                {msg.text}
              </div>

              {/* If response contains SQL and data */}
              {msg.data && (
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  {/* Generated SQL Transparency Card */}
                  <div className="bg-[#090D16] rounded-xl p-3 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1.5">
                      <span className="flex items-center space-x-1.5 font-mono text-[10px] text-indigo-300">
                        <Terminal className="w-3 h-3" />
                        <span>Generated Analytical SQL (Transparent)</span>
                      </span>
                      <div className="flex items-center space-x-2 text-[10px]">
                        <span className="text-emerald-400 font-mono">{msg.data.executionTimeMs} ms</span>
                        <button
                          onClick={() => navigate('/query-editor', { state: { sql: msg.data.generatedSql } })}
                          className="text-indigo-400 hover:underline cursor-pointer"
                        >
                          Edit in SQL Workspace →
                        </button>
                      </div>
                    </div>
                    <pre className="font-mono text-[11px] text-indigo-200 overflow-x-auto whitespace-pre-wrap">
                      {msg.data.generatedSql}
                    </pre>
                  </div>

                  {/* Visual Chart if dataset row count > 1 */}
                  {msg.data.data && msg.data.data.length > 1 && msg.data.chartConfig?.x && msg.data.chartConfig?.y && (
                    <div className="bg-[#090D16] rounded-xl p-3 border border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
                        <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Visual Data Summary</span>
                      </div>
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={msg.data.data} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                            <XAxis dataKey={msg.data.chartConfig.x} stroke="#64748b" tick={{ fontSize: 9 }} angle={-10} textAnchor="end" />
                            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', fontSize: '11px' }}
                            />
                            <Bar dataKey={msg.data.chartConfig.y} fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Results Data Grid */}
                  {msg.data.data && msg.data.data.length > 0 && (
                    <div className="bg-[#090D16] rounded-xl border border-slate-800 overflow-x-auto max-h-48">
                      <table className="w-full text-left text-[11px]">
                        <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                          <tr>
                            {msg.data.columns.map((c, i) => (
                              <th key={i} className="py-1.5 px-3">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {msg.data.data.slice(0, 5).map((row, rI) => (
                            <tr key={rI}>
                              {msg.data.columns.map((c, cI) => (
                                <td key={cI} className="py-1.5 px-3 text-slate-300">
                                  {row[c] !== undefined ? String(row[c]) : '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-bold text-xs">
                U
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-xs text-indigo-400">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/30 flex items-center justify-center animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>Generating analytical SQL and evaluating results...</span>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative"
      >
        <input
          type="text"
          placeholder="Ask any question about your data (e.g. 'Show monthly revenue trends', 'Top products by margin')..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          disabled={loading}
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-4 pr-14 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || loading}
          className="absolute right-2.5 top-2.5 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
