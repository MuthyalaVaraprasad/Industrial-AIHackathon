import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Upload, MessageSquare, FileSpreadsheet, QrCode, Search, FileEdit } from 'lucide-react';

interface QuickActionsFABProps {
  onOpenSearch: () => void;
}

export function QuickActionsFAB({ onOpenSearch }: QuickActionsFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: <Upload className="w-4 h-4" />, label: 'Upload Document', color: 'bg-accent-red', onClick: () => navigate('/app/documents') },
    { icon: <MessageSquare className="w-4 h-4" />, label: 'Ask AI Copilot', color: 'bg-accent-amber', onClick: () => navigate('/app/copilot') },
    { icon: <FileSpreadsheet className="w-4 h-4" />, label: 'Generate Report', color: 'bg-accent-green', onClick: () => navigate('/app/reports') },
    { icon: <QrCode className="w-4 h-4" />, label: 'Scan QR Asset', color: 'bg-accent-cyan', onClick: () => navigate('/app/qr-scanner') },
    { icon: <Search className="w-4 h-4" />, label: 'Open Search', color: 'bg-primary-500', onClick: onOpenSearch },
    { icon: <FileEdit className="w-4 h-4" />, label: 'Create Handover Note', color: 'bg-slate-500', onClick: () => navigate('/app/collaboration') },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <div className="mb-3 flex flex-col gap-2 items-end">
            {actions.map((act, idx) => (
              <motion.button
                key={act.label}
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ duration: 0.15, delay: idx * 0.03 }}
                onClick={() => {
                  act.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <span className="px-2 py-1 text-[11px] font-semibold text-slate-300 bg-surface-800/90 backdrop-blur border border-white/5 rounded-lg shadow-lg group-hover:text-white transition-colors">
                  {act.label}
                </span>
                <div className={`w-9 h-9 rounded-full ${act.color} text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform`}>
                  {act.icon}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-200 cursor-pointer relative group border border-white/10"
        aria-label="Quick Actions Menu"
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </button>
    </div>
  );
}
