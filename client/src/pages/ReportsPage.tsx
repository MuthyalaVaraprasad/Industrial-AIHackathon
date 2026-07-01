import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FileOutput, Download, CheckCircle, Settings, Loader, Eye, Clock, Sparkles } from 'lucide-react';
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

interface PastReport {
  id: string;
  name: string;
  date: string;
  format: string;
  status: 'Completed' | 'Pending';
}

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

  // Preview Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);

  // Customization options state
  const [customizations, setCustomizations] = useState({
    summary: true,
    telemetry: true,
    compliance: true,
    costs: false,
    charts: true,
    signature: false,
  });

  // History list of generated reports
  const [pastReports, setPastReports] = useState<PastReport[]>([
    { id: 'rep-01', name: 'Vibration_Audit_P101_r4.pdf', date: '2026-06-12 14:24', format: 'PDF', status: 'Completed' },
    { id: 'rep-02', name: 'ISO_Safety_Q2_Summary.csv', date: '2026-06-10 10:15', format: 'CSV', status: 'Completed' },
  ]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['report-templates'],
    queryFn: modulesApi.getReportTemplates,
  });

  const generateMutation = useMutation({
    mutationFn: () => modulesApi.generateReport(selected!.id, format),
    onSuccess: () => {
      setGeneratingProgress(0);
      setGenerated(null);
    },
  });

  // Handle generation progress bar ticks
  useEffect(() => {
    if (generatingProgress >= 0 && generatingProgress < 100) {
      const timeout = setTimeout(() => {
        setGeneratingProgress((prev) => prev + 25);
      }, 450);

      if (generatingProgress === 0) setProgressStage('Reading report template structures...');
      else if (generatingProgress === 25) setProgressStage('Gathering sensor telemetry tables...');
      else if (generatingProgress === 50) setProgressStage('Analyzing compliance regulations checklists...');
      else if (generatingProgress === 75) setProgressStage('Compiling digital files and generating PDF indices...');

      return () => clearTimeout(timeout);
    } else if (generatingProgress === 100) {
      setGeneratingProgress(-1);
      if (generateMutation.data) {
        setGenerated({
          filename: 'Report_Template_r8_Compiled.pdf',
          pages: 12
        });
        // Add to history
        setPastReports((prev) => [
          {
            id: 'rep-' + Date.now(),
            name: 'Report_Template_r8_Compiled.pdf',
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            format: 'PDF',
            status: 'Completed'
          },
          ...prev
        ]);
      }
    }
  }, [generatingProgress, generateMutation.data]);

  const handleCustomizationChange = (key: keyof typeof customizations) => {
    setCustomizations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setPresetRange = (preset: '7d' | '30d' | 'current') => {
    setGenerated(null);
    if (preset === '7d') {
      setStartDate('2026-06-23');
      setEndDate('2026-06-30');
    } else if (preset === '30d') {
      setStartDate('2026-06-01');
      setEndDate('2026-06-30');
    } else {
      setStartDate('2026-06-01');
      setEndDate('2026-06-30');
    }
  };

  const handleDownloadPDF = () => {
    if (!selected) return;
    const date = new Date().toLocaleString();
    const reportText = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 595 842] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 18 Tf
50 750 Td
(INDUSTRIA AI OPERATIONS REPORT) Tj
/F1 12 Tf
0 -30 Td
(Template: ${selected.name}) Tj
0 -20 Td
(Date Range: ${startDate} to ${endDate}) Tj
0 -20 Td
(Export Format: PDF) Tj
0 -20 Td
(Generated on: ${date}) Tj
0 -30 Td
(Executive Summary Statement: ${customizations.summary ? 'Included' : 'Excluded'}) Tj
0 -20 Td
(IoT Sensor Telemetry logs: ${customizations.telemetry ? 'Included' : 'Excluded'}) Tj
0 -20 Td
(Compliance Ledger & Audits: ${customizations.compliance ? 'Included' : 'Excluded'}) Tj
0 -20 Td
(Operational Penalty Estimate: ${customizations.costs ? 'Included' : 'Excluded'}) Tj
0 -20 Td
(Add Charts: ${customizations.charts ? 'Included' : 'Excluded'}) Tj
0 -20 Td
(Digital Signature: ${customizations.signature ? 'Verified' : 'Bypassed'}) Tj
0 -40 Td
(STATUS: SYSTEM COMPILED SUCCESSFULLY - VERIFIED) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000223 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
400
%%EOF`;
    const blob = new Blob([reportText], { type: 'application/pdf' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Report_Template_r8_Compiled.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (isError) return <PageTransition><ErrorState onRetry={refetch} /></PageTransition>;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto relative">
        <div>
          <h1 className="page-title">Report Generator & Compiler</h1>
          <p className="page-subtitle">Configure, compile, and export operational maintenance and regulatory compliance checklists</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Report Templates & History */}
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-3">
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

              {/* History widget */}
              <Card className="bg-surface-900/80 border border-white/5 p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Compiler Export History
                </h3>
                <div className="space-y-2 text-xs">
                  {pastReports.map((report) => (
                    <div key={report.id} className="flex justify-between items-center p-2 rounded bg-surface-850 border border-white/5">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white truncate font-mono">{report.name}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{report.date} • {report.format}</p>
                      </div>
                      <Badge variant="success" className="text-[8px] py-0">Done</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column: Customization & Generation Form */}
            <div className="lg:col-span-2">
              {selected ? (
                <Card padding="lg" className="space-y-5 bg-surface-900 border border-white/5">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="font-semibold text-white text-base">Configure {selected.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Customize time range, sections, and export parameters</p>
                  </div>

                  {/* Preset buttons */}
                  <div className="flex gap-2">
                    <button onClick={() => setPresetRange('7d')} className="px-2.5 py-1 rounded bg-surface-800 hover:bg-surface-700 text-[10px] text-slate-300 font-semibold cursor-pointer">Last 7 Days</button>
                    <button onClick={() => setPresetRange('30d')} className="px-2.5 py-1 rounded bg-surface-800 hover:bg-surface-700 text-[10px] text-slate-300 font-semibold cursor-pointer">Last 30 Days</button>
                    <button onClick={() => setPresetRange('current')} className="px-2.5 py-1 rounded bg-surface-800 hover:bg-surface-700 text-[10px] text-slate-300 font-semibold cursor-pointer">Current Month</button>
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
                    <label className="label-text flex items-center gap-1.5 font-semibold text-slate-400 text-xs"><Settings className="w-3.5 h-3.5" /> Include Sections & Config</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'summary', label: 'Executive Summary Statement' },
                        { key: 'telemetry', label: 'IoT Sensor Telemetry logs' },
                        { key: 'compliance', label: 'Compliance Ledger & Audits' },
                        { key: 'costs', label: 'Operational Penalty Est.' },
                        { key: 'charts', label: 'Include Sensor Line Charts' },
                        { key: 'signature', label: 'Attach Cryptographic Signatures' },
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
                          onClick={handleDownloadPDF}
                          className="px-3.5 py-1.5 rounded-lg bg-accent-green/20 hover:bg-accent-green/30 text-accent-green text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 border border-accent-green/20"
                        >
                          <Download className="w-3 h-3" /> Download file
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewOpen(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 border border-white/5"
                        >
                          <Eye className="w-3 h-3" /> Preview Document
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

        {/* Interactive PDF Preview Modal */}
        {previewOpen && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-4xl bg-surface-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-white/5 bg-surface-950">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">Preview: Report_Template_r8_Compiled.pdf</h3>
                  <p className="text-[10px] text-slate-400">Page {previewPage} of 12</p>
                </div>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="px-3 py-1 rounded bg-surface-800 hover:bg-surface-700 text-xs text-white cursor-pointer font-bold"
                >
                  Close Preview
                </button>
              </div>

              {/* PDF virtual sheet */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex justify-center">
                <div className="w-full max-w-2xl bg-white text-slate-900 shadow-lg border border-slate-200 p-8 rounded-md font-sans text-xs space-y-6 min-h-[700px] flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3">
                      <div>
                        <h2 className="text-sm font-black tracking-widest text-slate-800 font-mono">INDUSTRIA AI OPERATIONS CENTER</h2>
                        <p className="text-[9px] text-slate-500">Plant Diagnostics & Safety Log Document</p>
                      </div>
                      <Badge variant="danger" className="bg-slate-200 text-slate-800 hover:bg-slate-200">CONFIDENTIAL</Badge>
                    </div>

                    {/* Meta information */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200 text-[10px]">
                      <div>
                        <p className="text-slate-500 font-semibold">REPORT NAME:</p>
                        <p className="text-slate-800 font-bold">{selected.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-semibold">DATE RANGE:</p>
                        <p className="text-slate-800 font-bold">{startDate} to {endDate}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-semibold">FORMAT:</p>
                        <p className="text-slate-800 font-bold">PDF (Compiled)</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-semibold">COMPILER KEY:</p>
                        <p className="text-slate-800 font-mono">r8-902-b2</p>
                      </div>
                    </div>

                    {/* Content sections */}
                    <div className="space-y-4 pt-2">
                      {customizations.summary && (
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 border-b border-slate-300 pb-0.5">1. EXECUTIVE SUMMARY STATEMENT</h4>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            During the operational window, our automated RAG engine digested 142 diagnostic files and monitored 15 active equipment nodes. Centrifugal Water Pump P-101 vibration levels triggered warnings at 8.4 mm/s, indicating mechanical seal degradation. Recalibration scheduled to mitigate thermal loop risk.
                          </p>
                        </div>
                      )}

                      {customizations.telemetry && (
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 border-b border-slate-300 pb-0.5">2. IOT SENSOR TELEMETRY LOGS</h4>
                          <table className="w-full text-left text-[9px] border-collapse">
                            <thead>
                              <tr className="border-b border-slate-300 text-slate-500">
                                <th className="py-1">Timestamp</th>
                                <th className="py-1">Vibration</th>
                                <th className="py-1">Temperature</th>
                                <th className="py-1">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-100">
                                <td className="py-1">12:00 PM</td>
                                <td className="py-1">8.4 mm/s</td>
                                <td className="py-1">172.4 °F</td>
                                <td className="py-1 text-amber-600 font-bold">Warning</td>
                              </tr>
                              <tr className="border-b border-slate-100">
                                <td className="py-1">02:00 PM</td>
                                <td className="py-1">8.2 mm/s</td>
                                <td className="py-1">170.8 °F</td>
                                <td className="py-1 text-amber-600 font-bold">Warning</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {customizations.compliance && (
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 border-b border-slate-300 pb-0.5">3. COMPLIANCE LEDGER & ISO AUDITS</h4>
                          <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[10px]">
                            <li>ISO 9001 (Quality Standard): <strong className="text-green-600">COMPLIANT</strong></li>
                            <li>OSHA 1910.119 (Process Safety): <strong className="text-amber-600">VERIFICATION PENDING</strong></li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PDF Footer signatures */}
                  <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[9px] text-slate-400">
                    <div>
                      <p>Electronically generated by Industria AI Compiler.</p>
                      <p className="font-mono">Verification Hash: 8A4C-77EE-01B9-FF82</p>
                    </div>
                    <div className="text-right">
                      {customizations.signature ? (
                        <div className="flex items-center gap-1 text-green-600 font-bold border border-green-300 px-2 py-0.5 rounded bg-green-50">
                          <Sparkles className="w-3 h-3" /> SIGNED
                        </div>
                      ) : (
                        <p className="italic">Signature not attached</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Pagination controls */}
              <div className="p-4 border-t border-white/5 bg-surface-950 flex justify-between items-center">
                <button
                  onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                  disabled={previewPage === 1}
                  className="px-3 py-1 rounded bg-surface-850 hover:bg-surface-800 disabled:opacity-40 text-xs text-white cursor-pointer"
                >
                  Previous Page
                </button>
                <span className="text-xs text-slate-400 font-mono">Page {previewPage} / 12</span>
                <button
                  onClick={() => setPreviewPage(p => Math.min(12, p + 1))}
                  disabled={previewPage === 12}
                  className="px-3 py-1 rounded bg-surface-850 hover:bg-surface-800 disabled:opacity-40 text-xs text-white cursor-pointer"
                >
                  Next Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
