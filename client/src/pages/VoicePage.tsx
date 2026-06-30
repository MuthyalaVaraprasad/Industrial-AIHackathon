import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sliders, Play, CornerDownRight } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils';

interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const RESPONSES: Record<string, string> = {
  'p-101': 'Pump P-101 has a health score of 62% with high failure risk. Mechanical seal replacement is 45 days overdue. I recommend scheduling maintenance within 7 days.',
  'maintenance': 'There are 12 overdue maintenance items. Top priority tasks include Pump P-101 seal replacement and Heat Exchanger HX-301 tube cleaning.',
  'compliance': 'Overall compliance score is at 92%. ISO 45001 safety standard requires attention due to 2 missing regulatory audit reports.',
  'exchanger': 'Heat Exchanger HX-301 has a health score of 78%. Tube cleaning is overdue by 14 days, reducing heat transfer efficiency by 15%.',
  default: "I couldn't hear a direct command for that asset or task. Try asking about a specific item, such as 'Pump P-101', 'maintenance logs', or 'compliance status' to fetch live diagnostics.",
};

const VOICE_PRESET_SHORTCUTS = [
  { label: 'Check Pump P-101 Health', query: 'What is the status of Pump P-101?' },
  { label: 'Show Overdue Maintenance', query: 'Show me the active maintenance backlog logs' },
  { label: 'Verify Compliance Gaps', query: 'Verify outstanding compliance scores and audits' },
  { label: 'Inspect Heat Exchanger', query: 'Inspect Heat Exchanger HX-301 thermal statistics' },
];

export default function VoicePage() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [supported, setSupported] = useState(true);

  // Voice synthesis speed and pitch
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  useEffect(() => {
    setSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const getResponse = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('p-101') || lower.includes('pump') || lower.includes('p101')) return RESPONSES['p-101'];
    if (lower.includes('maintenance') || lower.includes('backlog') || lower.includes('overdue')) return RESPONSES['maintenance'];
    if (lower.includes('compliance') || lower.includes('audit') || lower.includes('gap')) return RESPONSES['compliance'];
    if (lower.includes('exchanger') || lower.includes('hx301') || lower.includes('hx-301')) return RESPONSES['exchanger'];
    return RESPONSES.default;
  };

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, rate, pitch]);

  const processCommand = useCallback((text: string) => {
    const userMsg: VoiceMessage = { id: `u-${Date.now()}`, role: 'user', text };
    const response = getResponse(text);
    const assistantMsg: VoiceMessage = { id: `a-${Date.now()}`, role: 'assistant', text: response };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    speak(response);
  }, [speak]);

  const handleShortcutClick = (query: string) => {
    setTranscript(query);
    processCommand(query);
  };

  const toggleListening = () => {
    if (!supported) {
      setTranscript('Voice recognition not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    interface SpeechRecognitionInstance {
      continuous: boolean;
      interimResults: boolean;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string }; isFinal: boolean } } }) => void) | null;
      onerror: (() => void) | null;
      start: () => void;
    }

    type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

    const win = window as unknown as {
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
      SpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognitionCtor = win.webkitSpeechRecognition || win.SpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      if (event.results[0].isFinal) {
        processCommand(text);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.start();
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="page-title">Voice Assistant</h1>
          <p className="page-subtitle">Industrial Speech-to-text commands with AI-powered diagnostics feedback</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Voice Activation Card */}
          <Card className="md:col-span-2 text-center py-10 flex flex-col items-center justify-center relative overflow-hidden">
            <div
              onClick={toggleListening}
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all cursor-pointer shadow-lg',
                listening
                  ? 'bg-accent-red/20 animate-pulse ring-4 ring-accent-red/30'
                  : 'bg-primary-500/10 hover:bg-primary-500/20 border border-white/5'
              )}
            >
              {listening ? <Mic className="w-10 h-10 text-accent-red animate-bounce" /> : <MicOff className="w-10 h-10 text-primary-400" />}
            </div>

            {listening && <Badge variant="danger" className="mb-4 animate-bounce uppercase">Microphone Recording</Badge>}

            {/* Dynamic Animated Voice Wave */}
            <div className="flex justify-center items-end gap-1.5 h-12 my-4 select-none">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 rounded-full bg-accent-cyan transition-all duration-300',
                    listening ? 'animate-[bounce_0.8s_infinite_ease-in-out]' : 'h-2'
                  )}
                  style={{
                    animationDelay: `${i * 70}ms`,
                    height: listening ? '100%' : '8px',
                  }}
                />
              ))}
            </div>

            <p className="text-sm md:text-base text-white mb-2 min-h-[2rem] font-semibold px-6">{transcript || 'Tap the microphone to speak'}</p>
            <p className="text-[10px] text-slate-500 mb-6 max-w-sm uppercase tracking-wider">Try: "What's the status of Pump P-101?" or "Show maintenance backlog"</p>

            <div className="flex justify-center gap-3">
              <Button onClick={toggleListening} variant={listening ? 'danger' : 'primary'} className="text-xs font-bold px-5">
                {listening ? 'Stop Listening' : 'Start Listening'}
              </Button>
              <Button variant="secondary" onClick={() => setTtsEnabled(!ttsEnabled)} className="text-xs font-bold">
                {ttsEnabled ? <Volume2 className="w-4 h-4 mr-1 text-accent-green" /> : <VolumeX className="w-4 h-4 mr-1 text-slate-500" />}
                Speech Output: {ttsEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {!supported && <p className="text-[10px] text-accent-amber mt-4">Speech recognition requires Chrome or Edge browser</p>}
          </Card>

          {/* Voice Parameter Adjuster Card */}
          <Card className="md:col-span-1 space-y-6">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><Sliders className="w-4 h-4 text-accent-cyan" /> Speech Parameters</h2>
            
            {/* Speed Rate Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Talking Rate</span>
                <span className="font-semibold text-white">{rate}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-accent-cyan"
              />
              <span className="text-[9px] text-slate-500 block">Controls the synthesis voice speed multiplier.</span>
            </div>

            {/* Pitch Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>Frequency Pitch</span>
                <span className="font-semibold text-white">{pitch}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-accent-cyan"
              />
              <span className="text-[9px] text-slate-500 block">Controls voice depth frequency.</span>
            </div>

            <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
              <span className="text-slate-500 block uppercase font-semibold text-[9px] tracking-wider">Calibration Output:</span>
              <button
                type="button"
                onClick={() => speak("Voice system calibration complete. Ready to receive commands.")}
                className="w-full py-2.5 rounded-lg bg-surface-850 hover:bg-surface-800 text-[11px] text-white flex items-center justify-center gap-1.5 cursor-pointer border border-white/5 transition-all font-semibold"
              >
                <Play className="w-3.5 h-3.5 text-accent-green" /> Test Calibration Audio
              </button>
            </div>
          </Card>
        </div>

        {/* Interactive Preset Voice Commands Grid (Extra Dashboard Feature) */}
        <Card className="p-5">
          <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-3.5">Interactive Demo Shortcuts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VOICE_PRESET_SHORTCUTS.map((shortcut, idx) => (
              <button
                key={idx}
                onClick={() => handleShortcutClick(shortcut.query)}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-850 hover:bg-surface-800 border border-white/5 hover:border-accent-cyan/20 text-xs font-semibold text-slate-300 hover:text-white transition-all text-left cursor-pointer"
              >
                <span className="truncate mr-2">{shortcut.label}</span>
                <CornerDownRight className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
              </button>
            ))}
          </div>
        </Card>

        {/* Conversations Log */}
        {messages.length > 0 && (
          <Card className="p-5">
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Live Speech Log Stream</h3>
            <div className="space-y-3.5 max-h-64 overflow-y-auto scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'text-xs px-3.5 py-3 rounded-xl border flex items-start gap-3.5',
                    msg.role === 'user'
                      ? 'bg-primary-500/5 border-primary-500/10 text-primary-200'
                      : 'bg-surface-850 border-white/5 text-slate-300'
                  )}
                >
                  <span className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 shrink-0">{msg.role === 'user' ? 'Operator' : 'AI Assistant'}: </span>
                  <span className="leading-relaxed">{msg.text}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
