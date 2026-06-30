import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, ArrowRight, FileText, Share2, MessageSquare, Wrench, Box, Shield,
  ChevronRight, Zap, TrendingUp, Clock,
} from 'lucide-react';
import { lazy, Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/ui/PageTransition';
import { StatCard } from '@/components/common/StatCard';
import { LANDING_FEATURES, ARCHITECTURE_LAYERS, BUSINESS_IMPACT } from '@/utils/navigation';

const Brain3D = lazy(() =>
  import('@/components/common/Brain3D').then((m) => ({ default: m.Brain3D }))
);

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-6 h-6" />,
  Share2: <Share2 className="w-6 h-6" />,
  MessageSquare: <MessageSquare className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
  Box: <Box className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 inset-x-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-white hidden sm:block">INDUSTRIA AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/signup"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm mb-6">
                <Zap className="w-4 h-4" />
                ET AI Hackathon — Problem Statement 8
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
                Unified Asset &<br />
                <span className="gradient-text">Operations Brain</span>
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-xl">
                AI-powered industrial knowledge intelligence platform. Ingest documents, drawings, and sensor data to deliver actionable insights across your entire plant.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg">
                    Start Free Trial <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">View Demo</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[300px] sm:h-[400px] lg:h-[500px]"
            >
              <Suspense fallback={<div className="w-full h-full skeleton rounded-2xl" />}>
                <Brain3D className="w-full h-full" />
              </Suspense>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <StatCard label="Documents Processed" value={12847} icon={<FileText className="w-5 h-5" />} color="cyan" />
            <StatCard label="Assets Monitored" value={342} icon={<Box className="w-5 h-5" />} color="green" />
            <StatCard label="Compliance Score" value={92} suffix="%" icon={<Shield className="w-5 h-5" />} color="purple" />
            <StatCard label="Risk Alerts" value={7} icon={<TrendingUp className="w-5 h-5" />} color="amber" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Platform Features</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Comprehensive AI modules for industrial asset management and operational intelligence.</p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LANDING_FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.1}>
                <div className="glass-card-hover p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 mb-4">
                    {iconMap[feature.icon]}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 md:py-28 bg-surface-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Architecture Overview</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Five-layer architecture from data ingestion to intelligent application delivery.</p>
          </FadeIn>
          <div className="grid md:grid-cols-5 gap-4">
            {ARCHITECTURE_LAYERS.map((layer, i) => (
              <FadeIn key={layer.name} delay={i * 0.1}>
                <div className="glass-card p-5 h-full relative">
                  {i < ARCHITECTURE_LAYERS.length - 1 && (
                    <ChevronRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400 z-10" />
                  )}
                  <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 text-sm font-bold mb-3">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-3">{layer.name}</h3>
                  <ul className="space-y-1.5">
                    {layer.items.map((item) => (
                      <li key={item} className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-accent-cyan" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Business Impact */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Business Impact</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Measurable outcomes for industrial operations teams.</p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BUSINESS_IMPACT.map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div className="glass-card-hover p-8 text-center">
                  <p className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">{item.metric}</p>
                  <p className="text-slate-400 text-sm">{item.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-cyan/5" />
              <div className="relative">
                <Clock className="w-10 h-10 text-primary-400 mx-auto mb-4" />
                <h2 className="text-3xl font-display font-bold text-white mb-4">Ready for Phase 2 Demo?</h2>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                  Launch the platform now with demo mode. Upload documents, explore the dashboard, and experience AI-powered industrial intelligence.
                </p>
                <Link to="/signup">
                  <Button size="lg">
                    Launch INDUSTRIA AI <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary-400" />
            <span className="text-sm text-slate-500">© 2026 INDUSTRIA AI — ET AI Hackathon</span>
          </div>
          <p className="text-xs text-slate-600">React · Vite · Gemini · Neo4j · Pinecone · MongoDB</p>
        </div>
      </footer>
    </div>
  );
}
