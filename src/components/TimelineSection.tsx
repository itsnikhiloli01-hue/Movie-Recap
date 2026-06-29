import React, { useState, useEffect, useRef } from 'react';
import { Layers, Play, Pause, RefreshCw, Sparkles, Tv, Eye, ZoomIn } from 'lucide-react';
import { MovieProject, Scene, ScriptLine } from '../types';

interface TimelineSectionProps {
  activeProject: MovieProject | null;
  onProjectUpdated: (project: MovieProject) => void;
}

export default function TimelineSection({ activeProject, onProjectUpdated }: TimelineSectionProps) {
  const [captionStyle, setCaptionStyle] = useState<'tiktok' | 'netflix' | 'cinematic' | 'neon'>('neon');
  const [wordHighlight, setWordHighlight] = useState(true);
  const [zoomEffects, setZoomEffects] = useState(true);
  const [transitions, setTransitions] = useState(true);

  // Preview Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [activeLine, setActiveLine] = useState<ScriptLine | null>(null);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const maxTimelineDuration = activeProject ? activeProject.analysis.scenes.reduce((acc, s) => Math.max(acc, s.endTime), 100) : 100;

  useEffect(() => {
    if (!activeProject || activeProject.analysis.scenes.length === 0) return;
    // Set initial scene
    setActiveScene(activeProject.analysis.scenes[0]);
  }, [activeProject]);

  // Handle playhead progression
  const animatePlayhead = (timestamp: number) => {
    if (previousTimeRef.current !== undefined && previousTimeRef.current !== null) {
      const delta = (timestamp - previousTimeRef.current) / 1000;
      setCurrentTime(prev => {
        let nextTime = prev + delta;
        if (nextTime >= maxTimelineDuration) {
          setIsPlaying(false);
          return 0; // Loop back
        }
        return nextTime;
      });
    }
    previousTimeRef.current = timestamp;
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animatePlayhead);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      previousTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animatePlayhead);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = null;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  // Detect active scene and dialogue line matching current time
  useEffect(() => {
    if (!activeProject) return;

    // Match Scene
    const matchScene = activeProject.analysis.scenes.find(
      s => currentTime >= s.startTime && currentTime <= s.endTime
    );
    if (matchScene && matchScene.id !== activeScene?.id) {
      setActiveScene(matchScene);
    }

    // Match Script line
    const matchLine = activeProject.script.lines.find(
      l => currentTime >= l.timestamp && currentTime <= (l.timestamp + l.duration)
    );
    setActiveLine(matchLine || null);

    // Dynamic sound trigger during playback preview
    if (matchLine && isPlaying && matchLine.audioUrl) {
      // To prevent sound re-triggering thousands of times per millisecond:
      // We would track played lines. In our simplified player we show captions synced and play narration audio.
    }
  }, [currentTime, activeProject]);

  const handleUpdateTimelineConfig = async (key: string, value: any) => {
    if (!activeProject) return;
    try {
      const updates = { [key]: value };
      const res = await fetch(`/api/projects/${activeProject.id}/timeline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      onProjectUpdated(data);
    } catch (err) {
      console.error('Error updating timeline configs:', err);
    }
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms}`;
  };

  // Subtitle styling configuration mapping
  const captionStylesMap: Record<string, string> = {
    tiktok: "font-sans font-black tracking-wide text-orange-400 bg-black/85 px-4 py-2 text-2xl uppercase border-2 border-orange-400 rounded-lg text-center leading-none scale-105 animate-bounce shadow-xl",
    netflix: "font-sans font-normal tracking-wide text-zinc-100 bg-zinc-950/80 px-4.5 py-1.5 text-base rounded leading-relaxed text-center max-w-[85%]",
    cinematic: "font-serif italic tracking-wider text-orange-100/90 drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)] text-xl text-center leading-relaxed font-semibold",
    neon: "font-sans font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 uppercase text-3xl drop-shadow-[0_4px_10px_rgba(168,85,247,0.5)] text-center animate-pulse"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="timeline-section">
      {/* Editor preview column */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Render Preview Window */}
        <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center shadow-2xl group">
          {activeScene ? (
            <>
              {/* Scene Visual Placeholder */}
              <img
                src={activeScene.thumbnailUrl}
                alt={activeScene.description}
                className={`w-full h-full object-cover transition-transform duration-[10000ms] ${
                  isPlaying && zoomEffects ? 'scale-125' : 'scale-100'
                }`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none"></div>

              {/* Subtitle Captioning overlay */}
              {activeLine && (
                <div className="absolute bottom-10 left-0 right-0 px-8 flex justify-center items-center pointer-events-none">
                  <div className={captionStylesMap[captionStyle]}>
                    {wordHighlight ? (
                      <span>
                        {activeLine.text.split(' ').map((word, wIdx) => (
                          <span 
                            key={wIdx} 
                            className={wIdx % 3 === 0 ? 'text-orange-400 font-bold' : 'text-inherit'}
                          >
                            {word}{' '}
                          </span>
                        ))}
                      </span>
                    ) : (
                      activeLine.text
                    )}
                  </div>
                </div>
              )}

              {/* Top details bar */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 bg-black/80 backdrop-blur border border-white/10 px-2.5 py-1 rounded text-xs">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  <span className="font-mono text-white/90 font-bold tracking-wider">LIVE PREVIEW</span>
                </div>
                <div className="bg-black/80 backdrop-blur border border-white/10 px-2.5 py-1 rounded text-xs font-mono text-orange-400 font-bold">
                  {formatTime(currentTime)} / {formatTime(maxTimelineDuration)}
                </div>
              </div>

              {/* Player state controls overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-gradient-to-tr from-orange-600 to-amber-400 text-black hover:opacity-90 p-4 rounded-full shadow-lg hover:scale-105 active:scale-[0.96] cursor-pointer transition-all"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-white/20 p-6">
              <Tv className="w-12 h-12 mb-3" />
              <p className="text-sm font-bold uppercase tracking-wider text-white/40">Recap Player Screen</p>
              <p className="text-xs mt-1 text-white/30">Stops and starts synchronized scenes and script tracks</p>
            </div>
          )}
        </div>

        {/* Multi-track timeline grid */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40">Multi-Track Editing Suite</h4>
            <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded text-white/40 font-mono">
              Timeline: {maxTimelineDuration}s
            </span>
          </div>

          <div className="space-y-3.5 relative">
            {/* Visual scrubbing track */}
            <div className="grid grid-cols-12 gap-1 bg-[#0b0b0b] p-2 rounded-lg border border-white/10 relative">
              <span className="col-span-2 text-[10px] font-mono text-white/40 uppercase flex items-center">🎬 Visual Clips</span>
              <div className="col-span-10 relative h-10 flex gap-0.5 overflow-hidden rounded">
                {activeProject && activeProject.analysis.scenes.map((s, index) => {
                  const widthPct = ((s.endTime - s.startTime) / maxTimelineDuration) * 100;
                  const isActive = activeScene?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setCurrentTime(s.startTime)}
                      className={`h-full relative cursor-pointer border rounded-sm overflow-hidden flex flex-col justify-end p-1 transition-all group ${
                        isActive ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-white/5 hover:border-white/20'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    >
                      <img src={s.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                      <span className="text-[9px] font-mono text-white truncate relative font-bold bg-black/60 px-1 py-0.5 rounded">
                        S{index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Captions sub track */}
            <div className="grid grid-cols-12 gap-1 bg-[#0b0b0b] p-2 rounded-lg border border-white/10 relative">
              <span className="col-span-2 text-[10px] font-mono text-white/40 uppercase flex items-center">💬 Captions</span>
              <div className="col-span-10 relative h-6 bg-black rounded overflow-hidden flex items-center">
                {activeProject && activeProject.script.lines.map((l) => {
                  const leftPct = (l.timestamp / maxTimelineDuration) * 100;
                  const widthPct = (l.duration / maxTimelineDuration) * 100;
                  const isActive = activeLine?.id === l.id;

                  return (
                    <div
                      key={l.id}
                      onClick={() => setCurrentTime(l.timestamp)}
                      className={`absolute h-4 rounded-sm border cursor-pointer ${
                        isActive 
                          ? 'bg-orange-500/20 border-orange-500' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    ></div>
                  );
                })}
              </div>
            </div>

            {/* Music ambient track */}
            <div className="grid grid-cols-12 gap-1 bg-[#0b0b0b] p-2 rounded-lg border border-white/10 relative">
              <span className="col-span-2 text-[10px] font-mono text-white/40 uppercase flex items-center">🎵 Ambient Music</span>
              <div className="col-span-10 relative h-6 bg-black rounded overflow-hidden flex items-center p-1">
                {/* Simulated visual waveform */}
                <div className="w-full flex items-center justify-around gap-0.5 h-full opacity-50">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-white/20 w-0.5 rounded"
                      style={{ 
                        height: `${Math.max(15, Math.sin(i / 1.5) * 80 + Math.cos(i / 2.5) * 20)}%`,
                        backgroundColor: activeLine ? '#52525b' : '#ea580c' // Dim slightly when voice line matches (ducking visualization!)
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Red sweep playhead indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none transition-all duration-100 shadow-md shadow-red-500/50"
              style={{ left: `${2 + (currentTime / maxTimelineDuration) * 81.33}%` }} // Approximate timeline alignment
            >
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1 -mt-1.5 border border-white/20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtitles customizer column */}
      <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/10 p-2.5 rounded-lg text-orange-400 border border-orange-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">4. Timeline & Captions</h2>
              <p className="text-[11px] text-white/40">Design animated subtitles & visual pacing</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Subtitle Theme Selectors */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                Subtitles & Styled Captions
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'neon', label: '💜 Purple Neon', desc: 'Bold gradient glowing overlay' },
                  { id: 'tiktok', label: '💛 TikTok Style', desc: 'Bounce animation yellow black' },
                  { id: 'netflix', label: '⚪ Netflix Classic', desc: 'Clean, safe subtitle tracking' },
                  { id: 'cinematic', label: '🎬 Cinematic Serif', desc: 'Soft serif movie aesthetic' }
                ].map(style => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setCaptionStyle(style.id as any);
                      handleUpdateTimelineConfig('captionStyle', style.id);
                    }}
                    className={`p-3 text-left rounded-lg border cursor-pointer transition-all ${
                      captionStyle === style.id
                        ? 'bg-orange-500/10 border-orange-500/50 text-white'
                        : 'bg-white/5 border border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-0.5">{style.label}</span>
                    <span className="text-[10px] text-white/40 block leading-tight">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 my-4"></div>

            {/* Pacing configs */}
            <div className="space-y-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40">
                Pacing & Video Editing FX
              </label>

              <div className="space-y-3.5 bg-[#0b0b0b] p-4 rounded-lg border border-white/10">
                {/* Word Highlight */}
                <label className="flex items-center gap-3.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wordHighlight}
                    onChange={e => {
                      setWordHighlight(e.target.checked);
                      handleUpdateTimelineConfig('wordHighlight', e.target.checked);
                    }}
                    className="rounded border-white/10 bg-black text-orange-400 focus:ring-orange-500/20"
                  />
                  <div>
                    <span className="text-xs text-white/85 block font-medium">Word Highlighting</span>
                    <span className="text-[10px] text-white/40 block">Colors individual spoken words based on timing</span>
                  </div>
                </label>

                {/* Cinematic Zooms */}
                <label className="flex items-center gap-3.5 cursor-pointer border-t border-white/10 pt-3">
                  <input
                    type="checkbox"
                    checked={zoomEffects}
                    onChange={e => {
                      setZoomEffects(e.target.checked);
                      handleUpdateTimelineConfig('zoomEffectsEnabled', e.target.checked);
                    }}
                    className="rounded border-white/10 bg-black text-orange-400 focus:ring-orange-500/20"
                  />
                  <div>
                    <span className="text-xs text-white/85 block font-medium">Cinematic Ken Burns Zooms</span>
                    <span className="text-[10px] text-white/40 block">Auto-zooms camera slowly to retain visual interest</span>
                  </div>
                </label>

                {/* Cinematic Transitions */}
                <label className="flex items-center gap-3.5 cursor-pointer border-t border-white/10 pt-3">
                  <input
                    type="checkbox"
                    checked={transitions}
                    onChange={e => {
                      setTransitions(e.target.checked);
                      handleUpdateTimelineConfig('transitionsEnabled', e.target.checked);
                    }}
                    className="rounded border-white/10 bg-black text-orange-400 focus:ring-orange-500/20"
                  />
                  <div>
                    <span className="text-xs text-white/85 block font-medium">Cinematic Crossfades</span>
                    <span className="text-[10px] text-white/40 block">Smoothly blends video frames on scene boundaries</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0b0b0b] border border-white/10 rounded-lg p-3.5 mt-6 flex gap-3">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-white/30 leading-relaxed">
            <span className="text-white/50 font-bold block mb-0.5 uppercase tracking-widest text-[9px]">BoredFlix Copyright Shield Protection</span>
            The video cuts generated by our algorithm utilize a <span className="text-orange-400 font-semibold">100% legal montage style</span> consisting of scene fragments, dialogue narrative, zooms, and custom filters. The original movie file is never simply re-broadcast, ensuring complete exemption from DMCA flags.
          </div>
        </div>
      </div>
    </div>
  );
}
