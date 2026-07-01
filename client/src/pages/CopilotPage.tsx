import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Send, Bot, User, FileText, Sparkles, Volume2, VolumeX, Copy, Check,
  Download, Plus, MessageSquare, History, Sliders, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils';
import type { CopilotMessage } from '@/types';

const SUGGESTIONS = [
  'Why did Pump P-101 fail?',
  'Show maintenance history for P-101',
  'Find compliance gaps',
];

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: CopilotMessage[];
}

const INITIAL_WELCOME_MESSAGE = (): CopilotMessage => ({
  id: 'welcome',
  role: 'assistant',
  content: "Hello! I'm your INDUSTRIA AI Copilot. Ask me anything about your plant assets, maintenance records, compliance status, or incident investigations.",
  timestamp: new Date().toISOString(),
  confidence: 100,
});

const MOCK_HISTORY_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    title: 'Pump P-101 RCA Analysis',
    timestamp: '2026-06-28T10:00:00Z',
    messages: [
      { id: '1', role: 'user', content: 'Why did Pump P-101 fail?', timestamp: '2026-06-28T10:00:00Z' },
      {
        id: '2',
        role: 'assistant',
        content: 'Pump P-101 failed due to mechanical seal degradation caused by alignment tolerances deviation. The casing vibration levels reached 8.4 mm/s prior to seizure.',
        timestamp: '2026-06-28T10:00:15Z',
        confidence: 94,
        sources: [{ title: 'Pump P-101 Failure Report', page: 'Page 3' }],
        recommendations: ['Perform shaft alignment calibration', 'Replace mechanical seal with type-B variant'],
        reasoningSummary: 'RCA analysis engine matched thermal seal wear patterns with historic telemetry data.',
        relatedDocuments: ['Pump P-101 Failure Report.pdf', 'CMMS Work Order Log #4521.xlsx'],
        relatedAssets: ['Centrifugal Pump P-101']
      }
    ]
  },
  {
    id: 'session-2',
    title: 'HSE Compliance Audit Check',
    timestamp: '2026-06-25T14:30:00Z',
    messages: [
      { id: '3', role: 'user', content: 'Are there any outstanding HSE compliance gaps?', timestamp: '2026-06-25T14:30:00Z' },
      {
        id: '4',
        role: 'assistant',
        content: 'Yes, 3 compliance gaps detected. (1) Flange seal inspections on unit HX-301 overdue by 12 days. (2) Relief valve testing certifications on separator V-203 missing. (3) Operator training logs for hazardous materials handling not updated.',
        timestamp: '2026-06-25T14:30:20Z',
        confidence: 91,
        sources: [{ title: 'ISO 14001 Standards Audit Checklist', page: 'Annex B' }],
        recommendations: ['Complete ISO 45001 remediation within 30 days', 'Update safety training records for 12 technicians'],
        reasoningSummary: 'Safety audit auditor parser checked checklist indexes against regulatory requirements.',
        relatedDocuments: ['OSHA Standard 1910.119', 'HSE Q2 Training Schedule.csv'],
        relatedAssets: ['Centrifugal Pump P-101', 'Heat Exchanger HX-301']
      }
    ]
  }
];

export default function CopilotPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_HISTORY_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>('current');
  const [messages, setMessages] = useState<CopilotMessage[]>([INITIAL_WELCOME_MESSAGE()]);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  // RAG Configuration States
  const [model, setModel] = useState('gemini-1.5-pro');
  const [temperature, setTemperature] = useState(0.2);
  const [chunkSize, setChunkSize] = useState(512);
  const [sourceCount, setSourceCount] = useState(4);
  const [enableGraphReranking, setEnableGraphReranking] = useState(true);
  const [strictSafety, setStrictSafety] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: modulesApi.sendCopilotMessage,
    onSuccess: (response) => {
      setMessages((prev) => [...prev, response]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Session Selection
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    window.speechSynthesis.cancel();
    setPlayingId(null);

    if (sessionId === 'current') {
      setMessages([INITIAL_WELCOME_MESSAGE()]);
    } else {
      const sess = sessions.find((s) => s.id === sessionId);
      if (sess) {
        setMessages(sess.messages);
      }
    }
  };

  // Handle New Session
  const handleNewSession = () => {
    // Save current active messages if they contain user chat
    const hasUserMsg = messages.some((m) => m.role === 'user');
    if (activeSessionId === 'current' && hasUserMsg) {
      const firstUserText = messages.find((m) => m.role === 'user')?.content || 'New Session';
      const firstTitle = firstUserText.length > 25 ? firstUserText.slice(0, 25) + '...' : firstUserText;
      
      const newSession: ChatSession = {
        id: 'session-' + Date.now(),
        title: firstTitle,
        timestamp: new Date().toISOString(),
        messages: [...messages]
      };
      setSessions((prev) => [newSession, ...prev]);
    }

    setActiveSessionId('current');
    setMessages([INITIAL_WELCOME_MESSAGE()]);
    setInput('');
    window.speechSynthesis.cancel();
    setPlayingId(null);
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;
    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    chatMutation.mutate(text.trim());
  };

  // Copy to clipboard
  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export as text file
  const exportText = (id: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `copilot_response_${id}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  // Text-To-Speech
  const speak = (id: string, text: string) => {
    if (playingId === id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);
    setPlayingId(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <PageTransition>
      <div className="space-y-4">
        <div>
          <h1 className="page-title">AI Copilot</h1>
          <p className="page-subtitle">Ask anything — powered by Gemini RAG with source citations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
          {/* History Sidebar */}
          <Card className="lg:col-span-1 flex flex-col overflow-hidden bg-surface-900 border border-white/5" padding="none">
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase"><History className="w-4 h-4 text-slate-500" /> Chat Sessions</span>
              <Button size="sm" variant="ghost" onClick={handleNewSession} className="h-8 px-2 text-primary-400 hover:text-white" title="New Session">
                <Plus className="w-4 h-4 mr-0.5" /> New
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
              <button
                onClick={() => handleSelectSession('current')}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2',
                  activeSessionId === 'current'
                    ? 'bg-primary-500/10 text-primary-300 border border-primary-500/20'
                    : 'text-slate-400 hover:bg-surface-700 hover:text-white'
                )}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate font-semibold">Active Portal Session</span>
              </button>

              <div className="pt-2 pb-1 px-3"><span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">History Logs</span></div>
              
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-center gap-2 border border-transparent',
                    activeSessionId === session.id
                      ? 'bg-surface-700 text-white border-white/10'
                      : 'text-slate-400 hover:bg-surface-800 hover:text-slate-200'
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{session.title}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{new Date(session.timestamp).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Active Chat Window & Parameters Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden h-full">
            {/* Chat viewport */}
            <Card className="md:col-span-2 flex flex-col overflow-hidden bg-surface-900 border border-white/5" padding="none">
              <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('flex gap-3.5', msg.role === 'user' ? 'flex-row-reverse' : '')}
                    >
                      <div className={cn(
                        'w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 border',
                        msg.role === 'user' ? 'bg-primary-500/10 border-primary-500/20' : 'bg-accent-cyan/10 border-accent-cyan/20'
                      )}>
                        {msg.role === 'user' ? <User className="w-4 h-4 text-primary-400" /> : <Bot className="w-4 h-4 text-accent-cyan" />}
                      </div>

                      <div className="max-w-[80%] space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">{msg.role === 'user' ? 'Operator' : 'Industria AI'}</span>
                          <span className="text-[9px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        
                        <div className={cn(
                          'px-4 py-3 rounded-2xl text-xs md:text-sm leading-relaxed border',
                          msg.role === 'user'
                            ? 'bg-primary-600/20 border-primary-500/10 text-white rounded-tr-none'
                            : 'bg-surface-850 border-white/5 text-slate-200 rounded-tl-none'
                        )}>
                          {msg.content}
                        </div>

                        {/* Tool Actions for Assistant messages */}
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1.5 justify-start">
                            <button
                              onClick={() => copyToClipboard(msg.id, msg.content)}
                              className="p-1.5 rounded bg-surface-850 hover:bg-surface-700 text-slate-500 hover:text-white transition-colors cursor-pointer"
                              title="Copy Response"
                            >
                              {copiedId === msg.id ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => exportText(msg.id, msg.content)}
                              className="p-1.5 rounded bg-surface-850 hover:bg-surface-700 text-slate-500 hover:text-white transition-colors cursor-pointer"
                              title="Download Response as Text"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => speak(msg.id, msg.content)}
                              className={cn(
                                'p-1.5 rounded transition-colors cursor-pointer',
                                playingId === msg.id
                                  ? 'bg-primary-500/20 text-primary-300'
                                  : 'bg-surface-850 hover:bg-surface-700 text-slate-500 hover:text-white'
                              )}
                              title={playingId === msg.id ? "Stop Reading" : "Read Response Aloud"}
                            >
                              {playingId === msg.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                            </button>
                          </div>
                        )}

                        {msg.sources && msg.sources.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 flex items-center gap-1"><FileText className="w-3 h-3" /> Sources Cited</p>
                            {msg.sources.map((s, i) => (
                              <div key={i} className="text-[10px] px-2 py-0.5 rounded bg-surface-850 border border-white/5 text-slate-400 inline-block mr-1 font-mono">
                                {s.title}{s.page && ` — ${s.page}`}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {msg.confidence && msg.role === 'assistant' && (
                          <Badge variant={msg.confidence > 85 ? 'success' : 'warning'} className="text-[9px] px-1 py-0.5">
                            {msg.confidence}% confidence
                          </Badge>
                        )}

                        {msg.reasoningSummary && (
                          <div className="text-left bg-surface-850/50 p-2.5 rounded-xl border border-white/5 space-y-1">
                            <p className="text-[10px] font-semibold text-accent-cyan flex items-center gap-1"><Sliders className="w-3.5 h-3.5" /> Reasoning Summary</p>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">{msg.reasoningSummary}</p>
                          </div>
                        )}

                        {msg.relatedDocuments && msg.relatedDocuments.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 flex items-center gap-1"><FileText className="w-3 h-3" /> Related Documents</p>
                            <div className="flex flex-wrap gap-1">
                              {msg.relatedDocuments.map((doc, idx) => (
                                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-surface-850 border border-white/5 text-slate-450 inline-block font-mono">
                                  📄 {doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {msg.relatedAssets && msg.relatedAssets.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 flex items-center gap-1"><Box className="w-3 h-3" /> Related Assets</p>
                            <div className="flex flex-wrap gap-1">
                              {msg.relatedAssets.map((asset, idx) => (
                                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-surface-850 border border-white/5 text-slate-400 inline-block font-semibold">
                                  ⚙️ {asset}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {msg.recommendations && (
                          <div className="text-left bg-surface-850/50 p-2.5 rounded-xl border border-white/5">
                            <p className="text-[10px] font-semibold text-accent-amber flex items-center gap-1 mb-1"><Sparkles className="w-3 h-3" /> Recommended Actions</p>
                            <ul className="text-xs text-slate-400 space-y-0.5">
                              {msg.recommendations.map((r, i) => <li key={i}>• {r}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {chatMutation.isPending && (
                  <div className="flex gap-3">
                    <div className="w-8.5 h-8.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-accent-cyan animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Industria AI</div>
                      <div className="px-4 py-2.5 rounded-2xl bg-surface-850 border border-white/5 text-xs text-slate-400 flex items-center gap-2">
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                        Analyzing plant knowledge base...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input Form & Suggestions */}
              <div className="p-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      disabled={chatMutation.isPending}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-surface-800 text-slate-400 hover:text-white hover:bg-surface-700 transition-colors border border-white/5 cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about assets, maintenance, compliance, manuals..."
                    className="input-field flex-1 !mb-0 text-sm"
                    disabled={chatMutation.isPending}
                  />
                  <Button type="submit" disabled={!input.trim() || chatMutation.isPending} loading={chatMutation.isPending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>

            {/* RAG Settings sidebar controls */}
            <Card className="md:col-span-1 flex flex-col bg-surface-900 border border-white/5 p-4 space-y-4 text-xs overflow-y-auto scrollbar-thin">
              <div className="border-b border-white/5 pb-2">
                <h3 className="font-bold text-white flex items-center gap-1.5 uppercase"><Sliders className="w-4 h-4 text-primary-400" /> RAG Parameters</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Fine-tune vector search and generation bounds</p>
              </div>

              {/* Model selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">LLM Generation Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-surface-850 border border-white/5 text-white rounded-lg p-2 text-xs focus:border-primary-500"
                >
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Default)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gpt-4o">GPT-4o (Omni)</option>
                </select>
              </div>

              {/* Temperature slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-400">Temperature (Creativity)</label>
                  <span className="font-mono text-white font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>

              {/* Chunk Size slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-400">Chunk Size (Tokens)</label>
                  <span className="font-mono text-white font-bold">{chunkSize}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="2048"
                  step="256"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>

              {/* Source count input */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-400">Max Sources Cited</label>
                  <span className="font-mono text-white font-bold">{sourceCount}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={sourceCount}
                  onChange={(e) => setSourceCount(parseInt(e.target.value) || 4)}
                  className="w-full bg-surface-850 border border-white/5 text-white rounded-lg p-2 text-xs focus:border-primary-500 font-mono"
                />
              </div>

              {/* Advanced toggles */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableGraphReranking}
                    onChange={(e) => setEnableGraphReranking(e.target.checked)}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span>Enable Graph Reranking (Neo4j)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={strictSafety}
                    onChange={(e) => setStrictSafety(e.target.checked)}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span>Strict Safety Guardrails</span>
                </label>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
