import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/store/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PageLoader } from '@/components/ui/Loading';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PreloaderScreen } from '@/components/common/PreloaderScreen';


const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const CommandCenterPage = lazy(() => import('@/pages/CommandCenterPage'));
const IndustrialIntelligencePage = lazy(() => import('@/pages/IndustrialIntelligencePage'));
const DecisionIntelligencePage = lazy(() => import('@/pages/DecisionIntelligencePage'));
const ControlCenterPage = lazy(() => import('@/pages/ControlCenterPage'));
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'));
const ProcessingPage = lazy(() => import('@/pages/ProcessingPage'));
const KnowledgeGraphPage = lazy(() => import('@/pages/KnowledgeGraphPage'));
const CopilotPage = lazy(() => import('@/pages/CopilotPage'));
const PIDPage = lazy(() => import('@/pages/PIDPage'));
const MaintenancePage = lazy(() => import('@/pages/MaintenancePage'));
const CompliancePage = lazy(() => import('@/pages/CompliancePage'));
const LessonsPage = lazy(() => import('@/pages/LessonsPage'));
const RCAPage = lazy(() => import('@/pages/RCAPage'));
const DigitalTwinPage = lazy(() => import('@/pages/DigitalTwinPage'));
const ExecutivePage = lazy(() => import('@/pages/ExecutivePage'));
const QRScannerPage = lazy(() => import('@/pages/QRScannerPage'));
const SimulatorPage = lazy(() => import('@/pages/SimulatorPage'));
const CollaborationPage = lazy(() => import('@/pages/CollaborationPage'));
const VoicePage = lazy(() => import('@/pages/VoicePage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const AlertsPage = lazy(() => import('@/pages/AlertsPage'));

const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const Asset360Page = lazy(() => import('@/pages/Asset360Page'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  const [preloaderFinished, setPreloaderFinished] = useState(() => {
    return sessionStorage.getItem('preloader_entered') === 'true';
  });

  const handlePreloaderEnter = () => {
    sessionStorage.setItem('preloader_entered', 'true');
    setPreloaderFinished(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {!preloaderFinished && <PreloaderScreen onEnter={handlePreloaderEnter} />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LazyPage><LoginPage /></LazyPage>} />
              <Route path="/signup" element={<LazyPage><SignupPage /></LazyPage>} />
              <Route path="/forgot-password" element={<LazyPage><ForgotPasswordPage /></LazyPage>} />
            </Route>

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<LazyPage><DashboardPage /></LazyPage>} />
              <Route path="command-center" element={<LazyPage><CommandCenterPage /></LazyPage>} />
              <Route path="industrial-intelligence" element={<LazyPage><IndustrialIntelligencePage /></LazyPage>} />
              <Route path="decision-intelligence" element={<LazyPage><DecisionIntelligencePage /></LazyPage>} />
              <Route path="control-center" element={<LazyPage><ControlCenterPage /></LazyPage>} />
              <Route path="documents" element={<LazyPage><DocumentsPage /></LazyPage>} />
              <Route path="processing" element={<LazyPage><ProcessingPage /></LazyPage>} />
              <Route path="processing/:id" element={<LazyPage><ProcessingPage /></LazyPage>} />
              <Route path="knowledge-graph" element={<LazyPage><KnowledgeGraphPage /></LazyPage>} />
              <Route path="copilot" element={<LazyPage><CopilotPage /></LazyPage>} />
              <Route path="pid" element={<LazyPage><PIDPage /></LazyPage>} />
              <Route path="maintenance" element={<LazyPage><MaintenancePage /></LazyPage>} />
              <Route path="compliance" element={<LazyPage><CompliancePage /></LazyPage>} />
              <Route path="lessons" element={<LazyPage><LessonsPage /></LazyPage>} />
              <Route path="rca" element={<LazyPage><RCAPage /></LazyPage>} />
              <Route path="digital-twin" element={<LazyPage><DigitalTwinPage /></LazyPage>} />
              <Route path="executive" element={<LazyPage><ExecutivePage /></LazyPage>} />
              <Route path="qr-scanner" element={<LazyPage><QRScannerPage /></LazyPage>} />
              <Route path="simulator" element={<LazyPage><SimulatorPage /></LazyPage>} />
              <Route path="collaboration" element={<LazyPage><CollaborationPage /></LazyPage>} />
              <Route path="voice" element={<LazyPage><VoicePage /></LazyPage>} />
              <Route path="reports" element={<LazyPage><ReportsPage /></LazyPage>} />
              <Route path="alerts" element={<LazyPage><AlertsPage /></LazyPage>} />
              <Route path="settings" element={<LazyPage><SettingsPage /></LazyPage>} />
              <Route path="asset-360" element={<LazyPage><Asset360Page /></LazyPage>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
