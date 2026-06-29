import React, { useState, useEffect } from 'react';
import { Film, MessageSquare, Sliders, Layers, Sparkles, Code, Trash2, Plus, RefreshCw, Layers3, Activity } from 'lucide-react';
import { MovieProject } from './types';
import UploadSection from './components/UploadSection';
import ScriptSection from './components/ScriptSection';
import VoiceSection from './components/VoiceSection';
import TimelineSection from './components/TimelineSection';
import ExportSection from './components/ExportSection';
import DeveloperSection from './components/DeveloperSection';

export default function App() {
  const [projects, setProjects] = useState<MovieProject[]>([]);
  const [activeProject, setActiveProject] = useState<MovieProject | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'script' | 'voice' | 'timeline' | 'export' | 'developer'>('upload');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load projects from server
  const loadProjects = async (selectLatest = false) => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
      if (data.length > 0) {
        if (selectLatest || !activeProject) {
          // Find if there is an active matching or select the first
          setActiveProject(data[0]);
        } else {
          // Sync active project state
          const current = data.find((p: MovieProject) => p.id === activeProject.id);
          if (current) setActiveProject(current);
        }
      } else {
        setActiveProject(null);
      }
    } catch (err) {
      console.error('Error loading projects list:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects(true);
  }, []);

  const handleProjectCreated = (newProj: MovieProject) => {
    setProjects(prev => [newProj, ...prev]);
    setActiveProject(newProj);
    setActiveTab('upload');
  };

  const handleProjectUpdated = (updatedProj: MovieProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
    setActiveProject(updatedProj);
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project? All custom script edits and voice-overs will be lost.')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      loadProjects(true);
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const steps = [
    { id: 'upload', name: '1. Load & Analyze', icon: Film, desc: 'Identify scenes & characters' },
    { id: 'script', name: '2. Narration Script', icon: MessageSquare, desc: 'Generate storyteller narrative' },
    { id: 'voice', name: '3. Voice Over', icon: Sliders, desc: 'Acoustic mixing & Gemini TTS' },
    { id: 'timeline', name: '4. Subtitles & Timeline', icon: Layers, desc: 'Sync captions overlay' },
    { id: 'export', name: '5. Compile & Export', icon: Sparkles, desc: 'Stitch containers & render' },
    { id: 'developer', name: '6. Deliverables Console', icon: Code, desc: 'View deployment packages' }
  ] as const;

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans selection:bg-orange-500/30 selection:text-orange-500 antialiased" id="main-dashboard">
      
      {/* 1. Header Navigation Bar */}
      <header className="h-auto min-h-16 border-b border-white/10 flex flex-col md:flex-row items-center justify-between px-6 py-4 md:py-0 bg-black/40 backdrop-blur-xl sticky top-0 z-50 gap-4">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-amber-400 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-sm rotate-45"></div>
            </div>
            <span className="text-xl font-black tracking-tighter text-white">LEGEND AI</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-0.5">Movie Recap Suite</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" /> IMMERSIVE ENGINE
              </span>
            </div>
          </div>
        </div>

        {/* Project Switcher Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-white/40">
              GPU Priority: High
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
              <span className="text-xs text-white/30 font-mono">Project:</span>
              {projects.length > 0 ? (
                <select
                  value={activeProject?.id || ''}
                  onChange={e => {
                    const selected = projects.find(p => p.id === e.target.value);
                    if (selected) setActiveProject(selected);
                  }}
                  className="bg-transparent text-xs text-white/90 outline-none font-medium cursor-pointer max-w-[160px] truncate"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#050505] text-white">
                      {p.title}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-white/30 font-medium italic">None loaded</span>
              )}

              {activeProject && (
                <button
                  onClick={() => handleDeleteProject(activeProject.id)}
                  className="text-white/40 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                  title="Delete current project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => loadProjects()}
              disabled={isRefreshing}
              className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 p-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer"
              title="Refresh from server"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-500' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Horizontal Pipeline Stepper Navigation */}
      <nav className="border-b border-white/10 bg-black/20 px-6 py-4 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-w-[800px]">
          {steps.map(step => {
            const Icon = step.icon;
            const isSelected = activeTab === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`flex-1 flex items-center gap-3.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-orange-600/10 border-orange-500/50 text-white shadow-inner'
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-gradient-to-tr from-orange-600 to-amber-400 text-black font-bold' : 'bg-white/5 border border-white/10'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className={`text-xs font-bold block ${isSelected ? 'text-orange-500' : ''}`}>{step.name}</span>
                  <span className="text-[10px] text-white/40 truncate block mt-0.5 leading-none">{step.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. Main Dashboard Workspace Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Render respective tab modules */}
        {activeTab === 'upload' && (
          <UploadSection 
            onProjectCreated={handleProjectCreated} 
            activeProject={activeProject} 
            onProjectUpdated={handleProjectUpdated}
          />
        )}

        {activeTab === 'script' && (
          <ScriptSection 
            activeProject={activeProject} 
            onProjectUpdated={handleProjectUpdated}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceSection 
            activeProject={activeProject} 
            onProjectUpdated={handleProjectUpdated}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineSection 
            activeProject={activeProject} 
            onProjectUpdated={handleProjectUpdated}
          />
        )}

        {activeTab === 'export' && (
          <ExportSection 
            activeProject={activeProject} 
            onProjectUpdated={handleProjectUpdated}
          />
        )}

        {activeTab === 'developer' && (
          <DeveloperSection />
        )}

      </main>

      {/* 4. Footer Status Bar */}
      <footer className="h-auto md:h-10 bg-black border-t border-white/10 px-6 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/30">
          <span className="flex items-center gap-1.5 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> System Online</span>
          <span>FFmpeg r24.2 Optimized</span>
          <span>Whisper Large V3 Listening...</span>
          <span>GPU Nodes Active (A100 Tensor Core)</span>
        </div>
        <div className="text-[10px] text-white/30 font-mono">
          Workspace: Production-Stage-01 • v2.4.1-Stable • Bypasses BoredFlix DMCA
        </div>
      </footer>
    </div>
  );
}
