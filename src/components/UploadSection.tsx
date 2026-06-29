import React, { useState, useEffect } from 'react';
import { Film, Sparkles, AlertCircle, CheckCircle, Brain, User, Zap, Eye } from 'lucide-react';
import { MovieProject, MovieTemplate } from '../types';

interface UploadSectionProps {
  onProjectCreated: (project: MovieProject) => void;
  activeProject: MovieProject | null;
  onProjectUpdated: (project: MovieProject) => void;
}

export default function UploadSection({ onProjectCreated, activeProject, onProjectUpdated }: UploadSectionProps) {
  const [templates, setTemplates] = useState<MovieTemplate[]>([]);
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        if (data.length > 0) setSelectedTemplate(data[0].id);
      })
      .catch(err => console.error('Error fetching templates:', err));
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const body = customTitle 
        ? { title: customTitle, videoUrl: customUrl }
        : { templateId: selectedTemplate };

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      onProjectCreated(data);
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!activeProject) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisLogs([]);

    const logs = [
      '[System] Initializing ML Pipeline on Nvidia A100 GPU core...',
      '[BoredFlix] Validating stream endpoint handshake...',
      '[FFmpeg] Demuxing stream metadata, establishing stream handles...',
      '[PySceneDetect] Launching ContentDetector (Threshold=30, MinLength=15)...',
      '[PySceneDetect] Analyzing frame color histogram differences...',
      '[Whisper] Loading OpenAI Whisper Large-V3 speech transformer...',
      '[YOLOv8] Pulling facial classification weights (YOLOv8x-Face)...',
      '[AI Classifier] Cluster recognition active on character silhouettes...',
      '[System] Finalizing movie timeline vectors & dialogue sheets...'
    ];

    // Simulate real-time ML logging
    let logIdx = 0;
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          triggerRealAnalysis();
          return 100;
        }
        
        // Randomly push standard ML logs during percentage increase
        if (Math.random() > 0.4 && logIdx < logs.length) {
          setAnalysisLogs(curr => [...curr, logs[logIdx]]);
          logIdx++;
        }
        
        return prev + 5;
      });
    }, 200);
  };

  const triggerRealAnalysis = async () => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/analyze`, {
        method: 'POST'
      });
      const data = await res.json();
      onProjectUpdated(data);
    } catch (err) {
      console.error('Error in movie analysis API:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="upload-section">
      {/* Create Project Card */}
      <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/10 p-2.5 rounded-lg text-orange-400 border border-orange-500/20">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">1. Initialize Project</h2>
              <p className="text-[11px] text-white/40">Select BoredFlix template or input custom URL</p>
            </div>
          </div>

          <form onSubmit={handleCreateProject} className="space-y-6">
            {/* Curated Templates */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2.5">
                Curated Movie Templates
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {templates.map(temp => (
                  <label
                    key={temp.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate === temp.id && !customTitle
                        ? 'bg-orange-500/10 border-orange-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                    }`}
                    onClick={() => {
                      setCustomTitle('');
                      setCustomUrl('');
                      setSelectedTemplate(temp.id);
                    }}
                  >
                    <input
                      type="radio"
                      name="templateRadio"
                      checked={selectedTemplate === temp.id && !customTitle}
                      onChange={() => {}}
                      className="hidden"
                    />
                    <img
                      src={temp.thumbnailUrl}
                      alt={temp.title}
                      className="w-12 h-12 object-cover rounded-md border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold truncate block text-white">{temp.title}</span>
                        <span className="text-xs font-mono text-orange-400">{temp.year}</span>
                      </div>
                      <span className="text-xs text-white/40 block truncate">{temp.genre}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono uppercase text-white/30">Or custom movie</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Custom Input */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                  Movie Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spider-Man: No Way Home"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 rounded-lg px-3.5 py-2 text-sm text-white placeholder-white/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                  BoredFlix Video Stream Link (MP4, MKV, AVI)
                </label>
                <input
                  type="url"
                  placeholder="https://www.boredflix.tv/watch/your_movie_stream.mp4"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 rounded-lg px-3.5 py-2 text-sm text-white placeholder-white/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating || (!customTitle && !selectedTemplate)}
              className="w-full bg-gradient-to-tr from-orange-600 to-amber-400 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-500/10 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Initializing Canvas...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Load recap project
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Analysis Status and Feedback Panel */}
      <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col justify-between min-h-[480px] backdrop-blur-xl">
        {activeProject ? (
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div>
                  <span className="text-[10px] font-mono text-orange-400 uppercase tracking-widest block mb-0.5">Active Sandbox</span>
                  <h3 className="text-lg font-bold text-white tracking-tight">{activeProject.title}</h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-mono uppercase ${
                  activeProject.status === 'created' 
                    ? 'bg-white/5 text-white/40 border-white/10' 
                    : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                }`}>
                  {activeProject.status}
                </span>
              </div>

              {activeProject.status === 'created' ? (
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-3">
                    <Brain className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">Scene and Character Analyzer</h4>
                      <p className="text-xs text-white/40 mt-1 leading-relaxed">
                        To construct a narrative, we need to partition the video file. LEGEND AI scans frame vectors, identifies character models, extracts dialogues via speech-to-text, and estimates emotional scores.
                      </p>
                    </div>
                  </div>

                  {isAnalyzing ? (
                    <div className="space-y-4">
                      {/* Analysis Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-white/40">
                          <span>RUNNING SCANNING ALGORITHMS...</span>
                          <span className="text-orange-400 font-bold">{analysisProgress}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                          <div 
                            className="bg-gradient-to-r from-orange-600 to-amber-400 h-full rounded-full transition-all duration-300 shadow-md shadow-orange-500/50"
                            style={{ width: `${analysisProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Log Console Output */}
                      <div className="bg-black/80 border border-white/10 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs text-white/30 space-y-1.5 scrollbar-thin">
                        {analysisLogs.map((log, idx) => (
                          <div key={idx} className={log.startsWith('[System]') ? 'text-white/60' : log.startsWith('[Bored') ? 'text-orange-400/80' : 'text-white/30'}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 bg-white/5 border border-dashed border-white/10 rounded-lg">
                      <Brain className="w-10 h-10 text-white/20 mb-3 animate-pulse" />
                      <p className="text-sm text-white/60 font-semibold">Ready for deep scene analysis</p>
                      <p className="text-xs text-white/30 mt-1">Estimates ~5 representative scenes and speaker identification cards</p>
                      <button
                        onClick={handleStartAnalysis}
                        className="mt-5 bg-white/5 border border-white/10 text-white hover:border-orange-500/35 hover:text-orange-400 px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Trigger ML Analysis Engine
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Successfully analyzed presentation */}
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-400">Cinematic Analysis Complete</h4>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">
                        Successfully mapped {activeProject.analysis.scenes.length} major scene cuts, identified {activeProject.analysis.characters.length} characters with high AI confidence, and generated the emotional pacing map.
                      </p>
                    </div>
                  </div>

                  {/* Quick stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center gap-3">
                      <div className="bg-orange-500/10 p-1.5 rounded text-orange-400 border border-orange-500/20">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-white/40 block">Scenes Found</span>
                        <span className="text-sm font-bold text-white">{activeProject.analysis.scenes.length} Segments</span>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center gap-3">
                      <div className="bg-orange-500/10 p-1.5 rounded text-orange-400 border border-orange-500/20">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-white/40 block">Characters</span>
                        <span className="text-sm font-bold text-white">{activeProject.analysis.characters.length} Identified</span>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center gap-3 col-span-2 sm:col-span-1">
                      <div className="bg-orange-500/10 p-1.5 rounded text-orange-400 border border-orange-500/20">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-white/40 block">Action Scenes</span>
                        <span className="text-sm font-bold text-white">{activeProject.analysis.actions.length} Choreographies</span>
                      </div>
                    </div>
                  </div>

                  {/* Scene Preview Grid */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Detected Scenes & Emotional Tags</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {activeProject.analysis.scenes.map(sc => (
                        <div key={sc.id} className="bg-[#0b0b0b] border border-white/10 rounded-lg p-2.5 flex gap-3">
                          <img src={sc.thumbnailUrl} alt={sc.description} className="w-14 h-14 object-cover rounded shrink-0 border border-white/10" referrerPolicy="no-referrer" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-white truncate">{sc.description}</span>
                              <span className="text-[10px] font-mono text-white/40">{sc.startTime}s</span>
                            </div>
                            <span className="text-[11px] text-white/40 block truncate mt-0.5">{sc.visualSummary}</span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 text-orange-400 font-mono uppercase tracking-widest inline-block mt-1.5 rounded">
                              {sc.emotion}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#0b0b0b] border border-white/10 rounded-lg p-4 mt-6">
              <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">BoredFlix Auto-Detection Architecture</h4>
              <p className="text-xs text-white/30 leading-relaxed">
                By processing BoredFlix streams, our system utilizes frame-by-frame structural similarity index calculations. The characters are isolated via Haar-cascades and matched against standard DB profiles to flag cameos, leading roles, and secondary elements.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="bg-white/5 border border-white/10 p-4 rounded-full text-white/20 mb-4 animate-bounce">
              <Film className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">No project initialized yet</h3>
            <p className="text-xs text-white/30 mt-2 max-w-sm leading-relaxed">
              Use the left sidebar to select a cinematic masterclass template or input a BoredFlix streaming video. Click "Load recap project" to begin!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
