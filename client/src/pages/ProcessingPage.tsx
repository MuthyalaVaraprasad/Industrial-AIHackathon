import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ArrowLeft, CheckCircle, Circle, Loader2, XCircle,
  FileText, Tag, Database, Download, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { documentsApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Loading';
import type { ProcessingStep } from '@/types';

const PIPELINE_STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'ocr', label: 'OCR Processing' },
  { id: 'extracting', label: 'Entity Extraction' },
  { id: 'classifying', label: 'Classification' },
  { id: 'completed', label: 'Storage & Indexing' },
];

function getStepsFromStatus(status: string): ProcessingStep[] {
  const statusOrder = ['uploading', 'processing', 'ocr', 'extracting', 'classifying', 'completed'];
  const currentIndex = statusOrder.indexOf(status);

  return PIPELINE_STEPS.map((step, i) => {
    const stepIndex = i;
    let stepStatus: ProcessingStep['status'] = 'pending';

    if (status === 'failed') {
      stepStatus = stepIndex < currentIndex ? 'completed' : stepIndex === currentIndex ? 'failed' : 'pending';
    } else if (stepIndex < currentIndex) {
      stepStatus = 'completed';
    } else if (stepIndex === currentIndex || (status === 'processing' && stepIndex === 0)) {
      stepStatus = 'active';
    } else if (status === 'completed') {
      stepStatus = 'completed';
    }

    return {
      id: step.id,
      label: step.label,
      status: stepStatus,
      confidence: stepStatus === 'completed' ? 85 + Math.random() * 14 : undefined,
    };
  });
}

function StepIcon({ status }: { status: ProcessingStep['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-accent-green" />;
    case 'active':
      return <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-accent-red" />;
    default:
      return <Circle className="w-5 h-5 text-slate-600" />;
  }
}

export default function ProcessingPage() {
  const { id } = useParams<{ id: string }>();
  const [ocrLanguage, setOcrLanguage] = useState('en');

  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.getAll(),
    refetchInterval: (query) => {
      const doc = id
        ? query.state.data?.items.find((d) => d.id === id)
        : query.state.data?.items.find((d) => !['completed', 'failed'].includes(d.status));
      return doc && !['completed', 'failed'].includes(doc.status) ? 2000 : false;
    },
  });

  const selectedDoc = id
    ? documentsQuery.data?.items.find((d) => d.id === id)
    : documentsQuery.data?.items.find((d) => !['completed', 'failed'].includes(d.status))
      ?? documentsQuery.data?.items[0];

  const handleExportCSV = () => {
    if (!selectedDoc) return;
    const headers = ['Type', 'Value', 'Confidence'];
    const rows = selectedDoc.entities.map(e => [e.type, e.value, `${e.confidence}%`]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedDoc.name}_entities.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportJSON = () => {
    if (!selectedDoc) return;
    const jsonContent = "data:text/json;charset=utf-8," 
      + encodeURIComponent(JSON.stringify(selectedDoc.entities, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", `${selectedDoc.name}_entities.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (documentsQuery.isLoading) {
    return (
      <PageTransition>
        <SkeletonCard />
      </PageTransition>
    );
  }

  if (documentsQuery.isError) {
    return (
      <PageTransition>
        <ErrorState onRetry={() => documentsQuery.refetch()} />
      </PageTransition>
    );
  }

  if (!selectedDoc) {
    return (
      <PageTransition>
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No documents to process</h2>
          <p className="text-slate-400 mb-6">Upload documents from the Document Intelligence Center</p>
          <Link to="/app/documents">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              Go to Documents
            </Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  const steps = getStepsFromStatus(selectedDoc.status);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to="/app/documents" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Documents
            </Link>
            <h1 className="page-title">OCR & Document Processing</h1>
            <p className="page-subtitle">{selectedDoc.name}</p>
          </div>
          <Badge variant={selectedDoc.status === 'completed' ? 'success' : selectedDoc.status === 'failed' ? 'danger' : 'warning'}>
            {selectedDoc.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-white mb-6">Processing Pipeline</h2>
            <div className="space-y-0">
              {steps.map((step, i) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <StepIcon status={step.status} />
                    {i < steps.length - 1 && (
                      <div className={`w-0.5 h-10 my-1 ${step.status === 'completed' ? 'bg-accent-green/50' : 'bg-surface-600'}`} />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className={`font-medium ${step.status === 'active' ? 'text-primary-400' : step.status === 'completed' ? 'text-white' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                    {step.confidence && (
                      <p className="text-xs text-slate-500 mt-0.5">Confidence: {Math.round(step.confidence)}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedDoc.status !== 'completed' && selectedDoc.status !== 'failed' && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Overall Progress</span>
                  <span className="text-primary-400">{selectedDoc.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-600 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-600 to-accent-cyan rounded-full"
                    animate={{ width: `${selectedDoc.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </Card>

          <div className="lg:col-span-2 space-y-6">
            {selectedDoc.metadata && Object.keys(selectedDoc.metadata).length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-accent-cyan" />
                  <h2 className="text-lg font-semibold text-white">Extracted Metadata</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {selectedDoc.metadata.title && (
                    <MetaField label="Title" value={selectedDoc.metadata.title} />
                  )}
                  {selectedDoc.metadata.author && (
                    <MetaField label="Author" value={selectedDoc.metadata.author} />
                  )}
                  {selectedDoc.metadata.pages && (
                    <MetaField label="Pages" value={String(selectedDoc.metadata.pages)} />
                  )}
                  {selectedDoc.metadata.category && (
                    <MetaField label="Category" value={selectedDoc.metadata.category} />
                  )}
                  {selectedDoc.metadata.createdDate && (
                    <MetaField label="Created" value={selectedDoc.metadata.createdDate} />
                  )}
                </div>
                {selectedDoc.metadata.tags && selectedDoc.metadata.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedDoc.metadata.tags.map((tag) => (
                      <Badge key={tag} variant="info">{tag}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {selectedDoc.entities.length > 0 && (
              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-accent-purple" />
                    <h2 className="text-lg font-semibold text-white">Extracted Entities</h2>
                    {selectedDoc.confidenceScore && (
                      <Badge variant="success">{Math.round(selectedDoc.confidenceScore)}% confidence</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleExportCSV} title="Export as CSV">
                      <Download className="w-4 h-4 mr-1" /> CSV
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleExportJSON} title="Export as JSON">
                      <Download className="w-4 h-4 mr-1" /> JSON
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-white/5">
                        <th className="pb-3 pr-4 font-medium">Type</th>
                        <th className="pb-3 pr-4 font-medium">Value</th>
                        <th className="pb-3 font-medium">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDoc.entities.map((entity, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0">
                          <td className="py-3 pr-4">
                            <Badge variant="default">{entity.type}</Badge>
                          </td>
                          <td className="py-3 pr-4 text-white">{entity.value}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-surface-600 overflow-hidden">
                                <div
                                  className="h-full bg-accent-green rounded-full"
                                  style={{ width: `${entity.confidence}%` }}
                                />
                              </div>
                              <span className="text-slate-400">{Math.round(entity.confidence)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {selectedDoc.ocrText && (
              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-white">OCR Results</h2>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-accent-cyan" />
                    <select
                      value={ocrLanguage}
                      onChange={(e) => setOcrLanguage(e.target.value)}
                      className="input-field text-xs py-1.5 px-2.5 w-auto !mb-0"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español (ES)</option>
                      <option value="de">Deutsch (DE)</option>
                      <option value="fr">Français (FR)</option>
                    </select>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto scrollbar-thin p-4 rounded-xl bg-surface-800/50 text-sm text-slate-300 leading-relaxed font-mono">
                  {selectedDoc.ocrText}
                </div>
              </Card>
            )}

            {selectedDoc.error && (
              <Card className="border-accent-red/30">
                <p className="text-accent-red">{selectedDoc.error}</p>
              </Card>
            )}
          </div>
        </div>

        {documentsQuery.data && documentsQuery.data.items.length > 1 && (
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">All Documents</h2>
            <div className="flex flex-wrap gap-2">
              {documentsQuery.data.items.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/app/processing/${doc.id}`}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    doc.id === selectedDoc.id
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'bg-surface-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {doc.name}
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}
