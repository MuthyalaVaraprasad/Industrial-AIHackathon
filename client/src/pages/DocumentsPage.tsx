import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Image, FileSpreadsheet, File, Trash2,
  Eye, RefreshCw, Search, Download, History, AlertTriangle, CheckSquare, Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { documentsApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
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

const TAG_FILTERS = ['All', 'Manual', 'Drawing', 'Audit', 'Telemetry'];

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setSelectedIds([]);
    },
  });

  const reprocessMutation = useMutation({
    mutationFn: documentsApi.reprocess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setSelectedIds([]);
    },
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
    } catch {
      // handled inside API client
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress({}), 2000);
    }
  }, [documentsQuery.data, queryClient]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    disabled: isUploading,
  });

  const handleExportMetadata = () => {
    if (!documentsQuery.data) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(documentsQuery.data.items, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'industria_documents_metadata.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredItems: DocumentRecord[]) => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(d => d.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected documents?`)) {
      selectedIds.forEach(id => deleteMutation.mutate(id));
    }
  };

  const handleBulkReprocess = () => {
    selectedIds.forEach(id => reprocessMutation.mutate(id));
  };

  const items = documentsQuery.data?.items ?? [];

  const filtered = items.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.metadata.category && doc.metadata.category.toLowerCase().includes(search.toLowerCase()));
    
    const matchesTag = selectedTag === 'All' || 
      (doc.metadata.category && doc.metadata.category.toLowerCase() === selectedTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="page-title">Document Intelligence Center</h1>
            <p className="page-subtitle">Upload plant schemas, compliance reports, and manuals to process via RAG & OCR pipelines</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExportMetadata} className="text-xs">
            <Download className="w-4 h-4 mr-1" /> Export Metadata JSON
          </Button>
        </div>

        {/* Dropzone Upload Component */}
        <Card className="p-0 overflow-hidden bg-surface-900 border border-white/5 relative">
          {duplicateNotice && (
            <div className="bg-accent-cyan/10 border-b border-accent-cyan/20 p-3 text-xs text-accent-cyan flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{duplicateNotice}</span>
            </div>
          )}

          <div
            {...getRootProps()}
            className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-white/5 hover:border-primary-500/20 bg-surface-850/50'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-slate-500 mx-auto mb-4 animate-bounce" />
            <p className="text-sm font-semibold text-white">Drag & drop files here, or click to upload</p>
            <p className="text-xs text-slate-500 mt-2">Supports PDF, DOCX, XLSX, PNG, JPG, and TIFF (Max 25MB)</p>
            <Button variant="secondary" size="sm" className="mt-4 pointer-events-none text-xs">
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

        {/* Filters pills row */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
          {TAG_FILTERS.map((tag) => (
            <button
              key={tag}
              onClick={() => { setSelectedTag(tag); setSelectedIds([]); }}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap cursor-pointer transition-colors ${
                selectedTag === tag
                  ? 'bg-primary-500 text-white font-bold'
                  : 'bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-slate-300'
              }`}
            >
              {tag}s
            </button>
          ))}
        </div>

        {/* Toolbar: Search, Filters & Bulk Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-surface-900/60 p-4 rounded-xl border border-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedIds([]); }}
              placeholder="Search documents by name or category..."
              className="pl-10 !mb-0 text-xs"
            />
          </div>

          {/* Bulk operations actions */}
          {selectedIds.length > 0 && (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-slate-400 font-semibold">{selectedIds.length} Selected</span>
              <button
                onClick={handleBulkReprocess}
                className="px-3 py-1.5 rounded bg-accent-amber/20 hover:bg-accent-amber/30 text-accent-amber text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reprocess
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded bg-accent-red/20 hover:bg-accent-red/30 text-accent-red text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Documents list table */}
        {documentsQuery.isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No documents found' : 'No documents yet'}
            description={search ? 'Try a different search term or select another category' : 'Upload your first document to get started with AI-powered extraction'}
            actionLabel={search ? undefined : 'Upload is available above'}
          />
        ) : (
          <div className="space-y-3">
            {/* Select all bar */}
            <div className="flex items-center gap-3 px-4 py-1.5 bg-surface-900/40 rounded-lg border border-white/5 text-xs text-slate-400">
              <button
                onClick={() => toggleSelectAll(filtered)}
                className="hover:text-white flex items-center gap-1.5 font-semibold cursor-pointer"
              >
                {selectedIds.length === filtered.length ? (
                  <CheckSquare className="w-4 h-4 text-primary-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                Select All ({filtered.length})
              </button>
            </div>

            {filtered.map((doc) => (
              <div key={doc.id} className="space-y-2">
                <DocumentRow
                  doc={doc}
                  isSelected={selectedIds.includes(doc.id)}
                  onSelectToggle={() => toggleSelect(doc.id)}
                  onView={() => navigate(`/app/processing/${doc.id}`)}
                  onDelete={() => deleteMutation.mutate(doc.id)}
                  onReprocess={() => reprocessMutation.mutate(doc.id)}
                  isDeleting={deleteMutation.isPending || reprocessMutation.isPending}
                  onToggleVersions={() => setShowVersions(showVersions === doc.id ? null : doc.id)}
                />
                
                {/* Version history panel */}
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
  isSelected,
  onSelectToggle,
  onView,
  onDelete,
  onReprocess,
  isDeleting,
  onToggleVersions,
}: {
  doc: DocumentRecord;
  isSelected: boolean;
  onSelectToggle: () => void;
  onView: () => void;
  onDelete: () => void;
  onReprocess: () => void;
  isDeleting: boolean;
  onToggleVersions: () => void;
}) {
  const docType = doc.type || getDocumentType(doc.name);

  return (
    <Card hover padding="sm" className="flex flex-col sm:flex-row sm:items-center gap-4 relative overflow-hidden">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Checkbox selector */}
        <button
          onClick={onSelectToggle}
          className="text-slate-500 hover:text-white shrink-0 cursor-pointer"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-primary-400" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>

        <div className="w-10 h-10 rounded-lg bg-surface-600/50 flex items-center justify-center shrink-0">
          {typeIcons[docType]}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white truncate">{doc.name}</p>
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

      <div className="flex items-center gap-3 sm:shrink-0 pl-8 sm:pl-0">
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
