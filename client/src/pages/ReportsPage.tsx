import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FileOutput, Download, CheckCircle, Settings, Loader, ExternalLink } from 'lucide-react';
import { modulesApi } from '@/services/api';
import { PageTransition } from '@/components/ui/PageTransition';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Loading';
import type { ReportTemplate } from '@/types';

const FORMATS = ['pdf', 'excel', 'csv'] as const;

export default function ReportsPage() {
  const [selected, setSelected] = useState<ReportTemplate | null>(null);
  const [format, setFormat] = useState<string>('pdf');
  const [generated, setGenerated] = useState<{ filename: string; pages: number } | null>(null);

  // Simulated progress loader states
  const [generatingProgress, setGeneratingProgress] = useState(-1);
  const [progressStage, setProgressStage] = useState('');

  // Date picker states
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-30');

  // Customization options state
  const [customizations, setCustomizations] = useState({
    summary: true,
    telemetry: true,
    compliance: false,
    costs: false,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['report-templates'],
    queryFn: modulesApi.getReportTemplates,
  });

  const generateMutation = useMutation({
    mutationFn: () => modulesApi.generateReport(selected!.id, format),
    onSuccess: () => {
      // Trigger progressive loader instead of instant success
      setGeneratingProgress(0);
      setGenerated(null);
    },
  });

  // Handle generation progress bar ticks
  useEffect(() => {
    if (generatingProgress >= 0 && generatingProgress < 100) {
      const timeout = setTimeout(() => {
        setGeneratingProgress((prev) => prev + 25);
      }, 400);

      // Change log stage message based on percent
      if (generatingProgress === 0) setProgressStage('Reading report template structures...');
      else if (generatingProgress === 25) setProgressStage('Gathering sensor telemetry tables...');
      else if (generatingProgress === 50) setProgressStage('Analyzing compliance regulations checklists...');
      else if (generatingProgress === 75) setProgressStage('Compiling digital files and generating PDF indices...');

      return () => clearTimeout(timeout);
    } else if (generatingProgress === 100) {
      setGeneratingProgress(-1);
      // Populate results
      if (generateMutation.data) {
        setGenerated({
          filename: generateMutation.data.filename,
          pages: generateMutation.data.pages
        });
      }
    }
  }, [generatingProgress, generateMutation.data]);

  const handleCustomizationChange = (key: keyof typeof customizations) => {
    setCustomizations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="page-title">Report Generator</h1>
          <p className="page-subtitle">Configure, compile, and export operational maintenance and regulatory compliance checklists</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Report Templates */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Templates</h2>
              <div className="space-y-3">
                {data?.map((template) => (
                  <div
                    key={template.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => { setSelected(template); setGenerated(null); setGeneratingProgress(-1); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setSelected(template); setGenerated(null); setGeneratingProgress(-1); } }}
                    className={`cursor-pointer transition-all ${selected?.id === template.id ? 'ring-2 ring-primary-500/50 rounded-2xl' : ''}`}
                  >
                    <Card hover padding="sm" className="bg-surface-900/90 border border-white/5 hover:border-primary-500/20">
                      <div className="flex items-start gap-3">
                        <FileOutput className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-white text-xs md:text-sm">{template.name}</h3>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{template.description}</p>
                          <Badge variant="info" className="mt-2 text-[9px] capitalize">{template.type}</Badge>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Customization & Generation Form */}
            <div className="lg:col-span-2">
              {selected ? (
                <Card padding="lg" className="space-y-5 bg-surface-900 border border-white/5">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="font-semibold text-white text-base">Configure {selected.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Customize time range, sections, and export parameters</p>
                  </div>

                  {/* Date range picker */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => { setStartDate(e.target.value); setGenerated(null); }}
                      className="!mb-0 text-xs"
                    />
                    <Input
                      label="End Date"
                      type="date"
                      value={endDate}
                      onChange={(e) => { setEndDate(e.target.value); setGenerated(null); }}
                      className="!mb-0 text-xs"
                    />
                  </div>

                  {/* Customization checkboxes */}
                  <div className="space-y-3">
                    <label className="label-text flex items-center gap-1.5 font-semibold text-slate-400 text-xs"><Settings className="w-3.5 h-3.5" /> Include Sections</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'summary', label: 'Executive Summary Statement' },
                        { key: 'telemetry', label: 'IoT Sensor Telemetry logs' },
                        { key: 'compliance', label: 'Compliance Ledger & Audits' },
                        { key: 'costs', label: 'Operational Penalty Est.' },
                      ].map((opt) => (
                        <label
                          key={opt.key}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-850 border border-white/5 text-xs text-slate-300 select-none cursor-pointer hover:bg-surface-800 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={customizations[opt.key as keyof typeof customizations]}
                            onChange={() => { handleCustomizationChange(opt.key as keyof typeof customizations); setGenerated(null); }}
                            className="w-4 h-4 accent-primary-500"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Format export buttons */}
                  <div className="space-y-2">
                    <label className="label-text text-slate-400 font-semibold text-xs">Select Export Format</label>
                    <div className="flex gap-2">
                      {FORMATS.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => { setFormat(f); setGenerated(null); }}
                          className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase border transition-all cursor-pointer ${
                            format === f
                              ? 'bg-primary-500/10 text-primary-300 border-primary-500/30'
                              : 'bg-surface-850 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => generateMutation.mutate()}
                    loading={generateMutation.isPending || generatingProgress >= 0}
                    className="w-full mt-4 bg-gradient-to-r from-primary-600 to-accent-cyan hover:from-primary-500 hover:to-cyan-400"
                  >
                    <Download className="w-4 h-4 mr-1" /> Compile & Export Report
                  </Button>

                  {/* Generation Progress Bar UI */}
                  {generatingProgress >= 0 && (
                    <div className="space-y-2 p-4 rounded-xl bg-surface-850 border border-white/5">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5"><Loader className="w-3.5 h-3.5 text-accent-cyan animate-spin" /> {progressStage}</span>
                        <span className="font-mono text-white font-bold">{generatingProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-cyan rounded-full transition-all duration-300"
                          style={{ width: `${generatingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Generated result panel */}
                  {generated && (
                    <div className="mt-4 p-4 rounded-xl bg-accent-green/10 border border-accent-green/20 space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-accent-green shrink-0 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold text-white font-mono uppercase tracking-wider">{generated.filename}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {generated.pages} pages • Date Range: {startDate} to {endDate} • Format: {format.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1.5 border-t border-accent-green/10">
                        <button
                          type="button"
                          onClick={() => {
                            // Mock download action
                            alert(`Downloading ${generated.filename}...`);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-accent-green/20 hover:bg-accent-green/30 text-accent-green text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download file
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            alert(`Opening preview window for ${generated.filename}...`);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 border border-white/5"
                        >
                          <ExternalLink className="w-3 h-3" /> Preview Document
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="text-center py-16 bg-surface-900 border border-white/5">
                  <FileOutput className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-base font-semibold text-white mb-1">No Template Selected</h3>
                  <p className="text-xs text-slate-500">Select a report template from the list on the left to configure and export.</p>
                </Card>
              )}
            </div>

          </div>
        )}
      </div>
    </PageTransition>
  );
}
