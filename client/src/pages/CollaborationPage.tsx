import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Users, Send, AtSign, MessageCircle } from 'lucide-react';
import { modulesApi } from '@/services/api';
import { useAuth } from '@/store/AuthContext';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Loading';
import { cn } from '@/utils';

interface CollaborationNote {
  id: string;
  author: string;
  role: string;
  assetTag: string;
  content: string;
  timestamp: string;
  mentions: string[];
}

export default function CollaborationPage() {
  const [content, setContent] = useState('');
  const [assetTag, setAssetTag] = useState('P-101');
  const [activeTab, setActiveTab] = useState<'all' | 'engineer' | 'technician' | 'auditor'>('all');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Integrated polling updates - refetches collaboration feed every 4 seconds to sync
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['collaboration'],
    queryFn: modulesApi.getCollaborationNotes,
    refetchInterval: 4000,
  });

  const addMutation = useMutation({
    mutationFn: modulesApi.addCollaborationNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration'] });
      setContent('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const mentions = content.match(/@(\w+\s?\w*)/g)?.map((m) => m.slice(1)) || [];
    addMutation.mutate({
      author: user?.displayName || 'User',
      role: user?.role || 'engineer',
      assetTag: assetTag.trim().toUpperCase(),
      content: content.trim(),
      mentions,
    });
  };

  const filterNotesByTab = (notes: CollaborationNote[]) => {
    if (activeTab === 'all') return notes;
    return notes.filter(n => {
      const role = n.role.toLowerCase();
      if (activeTab === 'engineer') return role === 'engineer' || role === 'admin';
      if (activeTab === 'technician') return role === 'technician' || role === 'manager';
      if (activeTab === 'auditor') return role === 'auditor';
      return true;
    });
  };

  const notesList = data ? filterNotesByTab(data as unknown as CollaborationNote[]) : [];

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Shift Handover & Notes</h1>
            <p className="page-subtitle">Asset discussions, mentions, and activity timeline</p>
          </div>
          <Badge variant="success" className="animate-pulse">Live Sync Active</Badge>
        </div>

        {/* Input Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input value={assetTag} onChange={(e) => setAssetTag(e.target.value)} placeholder="Asset tag" className="input-field w-32 text-sm !mb-0" />
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a shift handover note... Use @name to mention"
                className="input-field flex-1 text-sm !mb-0"
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-500 flex items-center gap-1"><AtSign className="w-3.5 h-3.5" /> Mention teammates with @name</p>
              <Button type="submit" size="sm" loading={addMutation.isPending} disabled={!content.trim()}>
                <Send className="w-4 h-4" /> Post Note
              </Button>
            </div>
          </form>
        </Card>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-thin">
          {[
            { id: 'all', label: 'All Discussion' },
            { id: 'engineer', label: 'Engineering' },
            { id: 'technician', label: 'Maintenance' },
            { id: 'auditor', label: 'Audit & Compliance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer',
                activeTab === tab.id
                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-300'
                  : 'bg-surface-800 border-white/5 text-slate-400 hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : notesList.length === 0 ? (
          <Card className="text-center py-12">
            <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">No notes recorded</h3>
            <p className="text-slate-500 text-xs">Be the first to post a note or change active filter tab.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notesList.map((note) => (
              <Card key={note.id} padding="sm" hover>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-xs md:text-sm">{note.author}</span>
                      <Badge variant="default" className="text-[9px] capitalize">{note.role}</Badge>
                      <Badge variant="info" className="text-[9px]">{note.assetTag}</Badge>
                      <span className="text-[10px] text-slate-500 ml-auto">{formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}</span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">{note.content}</p>
                    {note.mentions.length > 0 && (
                      <div className="flex gap-1.5 mt-2.5">
                        {note.mentions.map((m) => (
                          <span key={m} className="px-1.5 py-0.5 rounded bg-primary-500/10 text-[9px] font-semibold text-primary-400">
                            @{m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
