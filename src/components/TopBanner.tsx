import React, { useEffect, useState } from 'react';
import { Announcement } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { Bell, AlertTriangle, Sparkles, X } from 'lucide-react';

export const TopBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    api.getAnnouncements().then(setAnnouncements).catch(console.error);
  }, []);

  const visible = announcements.filter(a => a.active && !dismissedIds.includes(a.id));
  if (visible.length === 0) return null;

  const current = visible[0];

  const getStyle = () => {
    switch (current.type) {
      case 'warning':
        return 'bg-amber-950/90 border-amber-500/50 text-amber-200';
      case 'promo':
        return 'bg-purple-950/90 border-purple-500/50 text-purple-200';
      default:
        return 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200';
    }
  };

  const getIcon = () => {
    switch (current.type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      case 'promo':
        return <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-400 flex-shrink-0" />;
    }
  };

  return (
    <div className={`w-full py-2 px-4 border-b text-xs flex items-center justify-between gap-3 font-medium transition-colors ${getStyle()}`}>
      <div className="max-w-7xl mx-auto flex items-center gap-2 justify-center flex-1 text-center">
        {getIcon()}
        <span>
          <strong className="font-semibold">{current.title}:</strong> {current.message || current.content}
        </span>
      </div>
      <button
        onClick={() => setDismissedIds([...dismissedIds, current.id])}
        className="p-1 rounded hover:bg-black/20 transition-colors cursor-pointer"
        title="Fechar aviso"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
