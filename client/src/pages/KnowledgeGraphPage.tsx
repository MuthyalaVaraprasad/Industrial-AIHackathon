import { useQuery } from '@tanstack/react-query';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { ErrorState } from '@/components/ui/ErrorState';
import { GraphExplorer } from '@/features/knowledge-graph/GraphExplorer';

export default function KnowledgeGraphPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['knowledge-graph'],
    queryFn: modulesApi.getKnowledgeGraph,
  });

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Knowledge Graph Explorer</h1>
          <p className="page-subtitle">Interactive Neo4j-powered asset relationship mapping</p>
        </div>
        {isLoading ? <div className="skeleton h-[600px] rounded-2xl" /> : data && <GraphExplorer data={data} />}
      </div>
    </PageTransition>
  );
}
