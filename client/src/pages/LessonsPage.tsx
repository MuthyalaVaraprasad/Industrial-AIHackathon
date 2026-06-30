import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, TrendingUp, TrendingDown, Minus, Search, Filter } from 'lucide-react';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Loading';

const trendIcon = {
  increasing: <TrendingUp className="w-4 h-4 text-accent-red" />,
  decreasing: <TrendingDown className="w-4 h-4 text-accent-green" />,
  stable: <Minus className="w-4 h-4 text-accent-amber" />,
};

interface LessonRecord {
  id: string;
  pattern: string;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
  preventiveAction: string;
}

export default function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrend, setSelectedTrend] = useState<string>('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['lessons'],
    queryFn: modulesApi.getLessons,
  });

  const filteredLessons = useMemo(() => {
    const lessons: LessonRecord[] = data || [];
    return lessons.filter((lesson) => {
      const matchesSearch =
        lesson.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.recommendation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.preventiveAction.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTrend = selectedTrend === 'all' || lesson.trend === selectedTrend;

      return matchesSearch && matchesTrend;
    });
  }, [data, searchQuery, selectedTrend]);

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Lessons Learned Engine</h1>
          <p className="page-subtitle">Incident patterns, failure trends, and preventive actions</p>
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, patterns, or recommendations..."
              className="pl-10 !mb-0 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedTrend}
              onChange={(e) => setSelectedTrend(e.target.value)}
              className="input-field text-sm w-full sm:w-44 !mb-0 capitalize"
            >
              <option value="all">All Trends</option>
              <option value="increasing">Increasing Risk</option>
              <option value="decreasing">Decreasing Risk</option>
              <option value="stable">Stable Risk</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : filteredLessons.length === 0 ? (
          <Card padding="lg" className="text-center py-12">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No lessons found</h3>
            <p className="text-slate-500 text-xs">Try adjusting your filters or search terms.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredLessons.map((lesson) => (
              <Card key={lesson.id} hover>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{lesson.pattern}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="info">{lesson.frequency} occurrences</Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          {trendIcon[lesson.trend]}
                          <span className="capitalize">{lesson.trend}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Recommendation Plan</p>
                    <p className="text-sm text-slate-300">{lesson.recommendation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Preventive Engineering Action</p>
                    <p className="text-sm text-slate-300">{lesson.preventiveAction}</p>
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
