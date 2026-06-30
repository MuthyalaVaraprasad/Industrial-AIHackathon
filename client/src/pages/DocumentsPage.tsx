import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Image, FileSpreadsheet, File, Trash2,
  Eye, RefreshCw, Search, Filter, Download, History, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { documentsApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Loading';
import { formatBytes, getDocumentType } from '@/utils';
import { formatDistanceToNow } from 'date-fns';
import type { DocumentRecord, DocumentStatus } from '@/types';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.tiff'],
};

const statusVariant: Record<DocumentStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  completed: 'success',
  failed: 'danger',
  uploading: 'info',
  processing: 'warning',
  ocr: 'warning',
  extracting: 'warning',
  classifying: 'warning',
};

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-5 h-5 text-accent-red" />,
  docx: <FileText className="w-5 h-5 text-primary-400" />,
  xlsx: <FileSpreadsheet className="w-5 h-5 text-accent-green" />,
  image: <Image className="w-5 h-5 text-accent-cyan" />,
  other: <File className="w-5 h-5 text-slate-400" />,
};

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.getAll(),
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.items.some(
        (d) => !['completed', 'failed'].includes(d.status)
      );
      return hasProcessing ? 2000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const reprocessMutation = useMutation({
    mutationFn: documentsApi.reprocess,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setIsUploading(true);
    setDuplicateNotice(null);

    const existingDocs = documentsQuery.data?.items ?? [];
    
    // Duplicate Check
    const duplicates = acceptedFiles.filter(file => 
      existingDocs.some(d => d.name.toLowerCase() === file.name.toLowerCase())
    );

    if (duplicates.length > 0) {
      setDuplicateNotice(`Duplicate check alert: version history created for ${duplicates.map(f => f.name).join(', ')}.`);
    }

    try {
      await documentsApi.upload(acceptedFiles, (fileName, progress) => {
        setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  }, [queryClient, documentsQuery.data]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
    disabled: isUploading,
    noClick: true,
  });

  const documents = documentsQuery.data?.items ?? [];
  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: documents.length,
    processed: documents.filter((d) => d.status === 'completed').length,
    entities: documents.reduce((sum, d) => sum + d.entities.length, 0),
    categories: new Set(documents.map((d) => d.metadata.category).filter(Boolean)).size,
  };

  const handleExportMetadata = () => {
    const metadataList = documents.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      size: d.size,
      uploadedAt: d.uploadedAt,
      metadata: d.metadata,
      entitiesCount: d.entities.length,
      confidenceScore: d.confidenceScore
    }));
    
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(metadataList, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'industria_document_metadata.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (documentsQuery.isError) {
    return (
      <PageTransition>
        <ErrorState onRetry={() => documentsQuery.refetch()} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Document Intelligence Center</h1>
          <p className="page-subtitle">Upload, process, and extract intelligence from industrial documents</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Documents" value={stats.total} icon={<FileText className="w-5 h-5" />} color="cyan" />
          <StatCard label="Processed" value={stats.processed} icon={<RefreshCw className="w-5 h-5" />} color="green" />
          <StatCard label="Entities Extracted" value={stats.entities} icon={<Filter className="w-5 h-5" />} color="purple" />
          <StatCard label="Categories" value={stats.categories} icon={<FileSpreadsheet className="w-5 h-5" />} color="primary" />
        </div>

        {/* Duplicate alert banner */}
        {duplicateNotice && (
          <div className="p-4 rounded-xl text-sm border bg-accent-amber/10 border-accent-amber/20 text-accent-amber flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{duplicateNotice}</span>
          </div>
        )}

        <Card
          {...getRootProps()}
          onClick={open}
          className={`border-2 border-dashed cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-primary-500 bg-primary-500/5'
              : 'border-white/10 hover:border-primary-500/30 hover:bg-white/[0.02]'
          } ${isUploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          <input {...getInputProps()} aria-label="Upload documents" />
          <div className="flex flex-col items-center py-10 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4">
              <Upload className={`w-8 h-8 text-primary-400 ${isDragActive ? 'animate-bounce' : ''}`} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files to upload'}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Supports PDF, DOCX, XLSX, and images. Bulk upload enabled.
            </p>
            <Button variant="secondary" size="sm" type="button" onClick={(e) => { e.stopPropagation(); open(); }}>
              Browse Files
            </Button>
          </div>

          <AnimatePresence>
            {Object.entries(uploadProgress).map(([name, progress]) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-4"
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400 truncate">{name}</span>
                  <span className="text-primary-400">{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-600 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>

        {/* Toolbar: Search, Filters & Export */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="pl-10 !mb-0"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportMetadata}>
              <Download className="w-4 h-4" /> Export Metadata (JSON)
            </Button>
          </div>
        </div>

        {documentsQuery.isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No documents found' : 'No documents yet'}
            description={search ? 'Try a different search term' : 'Upload your first document to get started with AI-powered extraction'}
            actionLabel={search ? undefined : 'Upload is available above'}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <div key={doc.id} className="space-y-2">
                <DocumentRow
                  doc={doc}
                  onView={() => navigate(`/app/processing/${doc.id}`)}
                  onDelete={() => deleteMutation.mutate(doc.id)}
                  onReprocess={() => reprocessMutation.mutate(doc.id)}
                  isDeleting={deleteMutation.isPending || reprocessMutation.isPending}
                  onToggleVersions={() => setShowVersions(showVersions === doc.id ? null : doc.id)}
                />
                
                {/* Mock version history panel */}
                {showVersions === doc.id && (
                  <div className="mx-6 p-4 rounded-xl bg-surface-850 border border-white/5 space-y-3 text-xs">
                    <h4 className="font-semibold text-white flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> File Version History</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-slate-300">
                        <span>v2 (Current Active Version)</span>
                        <span className="text-[10px] text-slate-500">{new Date(doc.uploadedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>v1 (Archived Backup)</span>
                        <span className="text-[10px]">2026-06-25 10:14:02</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function DocumentRow({
  doc,
  onView,
  onDelete,
  onReprocess,
  isDeleting,
  onToggleVersions,
}: {
  doc: DocumentRecord;
  onView: () => void;
  onDelete: () => void;
  onReprocess: () => void;
  isDeleting: boolean;
  onToggleVersions: () => void;
}) {
  const docType = doc.type || getDocumentType(doc.name);

  return (
    <Card hover padding="sm" className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-surface-600/50 flex items-center justify-center shrink-0">
          {typeIcons[docType]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white truncate">{doc.name}</p>
            {/* Version Badge trigger */}
            <button
              onClick={onToggleVersions}
              className="px-1.5 py-0.5 rounded bg-surface-700 hover:bg-primary-500/20 hover:text-primary-300 text-[9px] text-slate-400 font-semibold flex items-center gap-0.5 cursor-pointer"
              title="Show Version History"
            >
              <History className="w-2.5 h-2.5" /> v2
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="text-xs text-slate-500">{formatBytes(doc.size)}</span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
            </span>
            {doc.metadata.category && (
              <>
                <span className="text-xs text-slate-600">•</span>
                <Badge variant="info">{doc.metadata.category}</Badge>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:shrink-0">
        {doc.status !== 'completed' && doc.status !== 'failed' && (
          <div className="flex-1 sm:w-24">
            <div className="h-1.5 rounded-full bg-surface-600 overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${doc.progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 text-center">{doc.progress}%</p>
          </div>
        )}
        <Badge variant={statusVariant[doc.status]}>{doc.status}</Badge>
        {doc.confidenceScore && (
          <span className="text-xs text-accent-green font-medium">{Math.round(doc.confidenceScore)}%</span>
        )}
        <div className="flex gap-1">
          {doc.status === 'failed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReprocess}
              disabled={isDeleting}
              aria-label={`Retry reprocessing ${doc.name}`}
              className="text-accent-amber hover:bg-accent-amber/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onView} aria-label={`View ${doc.name}`}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            aria-label={`Delete ${doc.name}`}
            className="hover:text-accent-red"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
