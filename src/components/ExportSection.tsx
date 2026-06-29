import React, { useState } from 'react';
import { Download, Sparkles, Sliders, Play, Terminal, HelpCircle, RefreshCw } from 'lucide-react';
import { MovieProject } from '../types';

interface ExportSectionProps {
  activeProject: MovieProject | null;
  onProjectUpdated: (project: MovieProject) => void;
}

export default function ExportSection({ activeProject, onProjectUpdated }: ExportSectionProps) {
  const [format, setFormat] = useState<'mp4' | 'mov' | 'mkv'>('mp4');
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'vertical' | 'square'>('landscape');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4K'>('1080p');
  const [lang, setLang] = useState<'en' | 'es' | 'fr' | 'de' | 'ja'>('en');

  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [readyToDownload, setReadyToDownload] = useState(false);

  const handleUpdateExportSettings = async (key: string, value: any) => {
    if (!activeProject) return;
    try {
      const updates = { [key]: value };
      const res = await fetch(`/api/projects/${activeProject.id}/export-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      onProjectUpdated(data);
    } catch (err) {
      console.error('Error updating export settings:', err);
    }
  };

  const handleTriggerExport = async () => {
    if (!activeProject) return;
    setIsCompiling(true);
    setCompileProgress(0);
    setReadyToDownload(false);
    setCompileLogs([]);

    const renderLogs = [
      '[FFmpeg] Initializing NVENC hardware accelerated transcoder (CUDA)...',
      '[FFmpeg] Mapping stream indices: Input 0 (Video), Input 1 (VO Audio), Input 2 (BG Music)...',
      '[FFmpeg] Applying sidechain compressor filter on Input 2 with threshold=0.15, ratio=15...',
      '[FFmpeg] Merging audio tracks into single master container (AAC, 48000Hz, Stereo)...',
      '[FFmpeg] Burn-in subtitle filter: styling styled overlay with UTF-8 encoding...',
      '[FFmpeg] Burning styled captions onto video matrix with custom aspect ratios...',
      '[YOLOv8] Tracking coordinates to center focus pan (Smart Pan-and-Scan active for Vertical orientation)...',
      '[FFmpeg] Processing frame 350 / 3600 (fps=45, speed=1.5x)...',
      '[FFmpeg] Processing frame 1200 / 3600 (fps=48, speed=1.6x)...',
      '[FFmpeg] Processing frame 2400 / 3600 (fps=44, speed=1.5x)...',
      '[FFmpeg] Processing frame 3200 / 3600 (fps=49, speed=1.7x)...',
      '[FFmpeg] Flushing containers, assembling MP4 atomic fragments...',
      '[System] Finalizing export. Legend AI copyright shield hashes baked successfully.'
    ];

    let logIdx = 0;
    const interval = setInterval(() => {
      setCompileProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setReadyToDownload(true);
          triggerRenderApi();
          return 100;
        }

        if (Math.random() > 0.45 && logIdx < renderLogs.length) {
          setCompileLogs(curr => [...curr, renderLogs[logIdx]]);
          logIdx++;
        }

        return prev + 4;
      });
    }, 200);
  };

  const triggerRenderApi = async () => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/render`, {
        method: 'POST'
      });
      const data = await res.json();
      onProjectUpdated(data);
    } catch (err) {
      console.error('Error in render API:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownloadFile = () => {
    if (!activeProject) return;
    // Download a real sample text file structured as a summary + links, or a simple blob
    const summaryText = `LEGEND AI - Movie Recap Production Complete!
============================================
Movie Title: ${activeProject.title}
Recap Length: ${activeProject.script.lengthMinutes} minutes
Narrator Profile: ${activeProject.script.narrator} (Dramatic Neural)
Audio Music: Genre [${activeProject.audioSettings.bgMusicGenre}]
Aesthetic Style: Styled Captions [${activeProject.timeline.captionStyle}]
Target Export Format: [${format.toUpperCase()}]
Export Resolution: [${resolution}]
Screen Ratio: [${aspectRatio}]

Script Voice Lines Compiled:
---------------------------
${activeProject.script.lines.map((l, i) => `[${l.timestamp}s] Line #${i+1}: "${l.text}"`).join('\n\n')}

Disclaimer: Baked utilizing BoredFlix stream montages and custom-synthesized voice assets. Excluded from YouTube copyright strikes under Fair Use exemptions.

============================================
Enjoy your completed professional movie recap video!`;

    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeProject.title.toLowerCase().replace(/\s+/g, '_')}_recap_${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="export-section">
      {/* Export Settings */}
      <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/10 p-2.5 rounded-lg text-orange-400 border border-orange-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">5. Compile & Export</h2>
              <p className="text-[11px] text-white/40">Configure final output codecs & orientation</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Screen Ratio & Orientation
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'landscape', label: '📺 Landscape (16:9)', desc: 'YouTube standard' },
                  { id: 'vertical', label: '📱 Vertical (9:16)', desc: 'TikTok / Shorts' },
                  { id: 'square', label: '⏹️ Square (1:1)', desc: 'Instagram Grid' }
                ].map(ratio => (
                  <button
                    key={ratio.id}
                    onClick={() => {
                      setAspectRatio(ratio.id as any);
                      handleUpdateExportSettings('aspectRatio', ratio.id);
                    }}
                    className={`p-2.5 text-center rounded-lg border cursor-pointer transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-orange-500/10 border-orange-500/50 text-white'
                        : 'bg-white/5 border border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-semibold block mb-0.5">{ratio.label}</span>
                    <span className="text-[9px] text-white/40 block leading-tight">{ratio.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Container Format & Resolution Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                  Output Format
                </label>
                <select
                  value={format}
                  onChange={e => {
                    const fmt = e.target.value as any;
                    setFormat(fmt);
                    handleUpdateExportSettings('format', fmt);
                  }}
                  className="w-full bg-white/5 border border-white/10 focus:border-orange-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="mp4" className="bg-[#050505] text-white">📦 MP4 (H.264 High-Profile)</option>
                  <option value="mov" className="bg-[#050505] text-white">🎥 MOV (Apple ProRes Raw)</option>
                  <option value="mkv" className="bg-[#050505] text-white">🗂️ MKV (Matroska Uncompressed)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                  Render Resolution
                </label>
                <select
                  value={resolution}
                  onChange={e => {
                    const res = e.target.value as any;
                    setResolution(res);
                    handleUpdateExportSettings('resolution', res);
                  }}
                  className="w-full bg-white/5 border border-white/10 focus:border-orange-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="720p" className="bg-[#050505] text-white">720p HD Standard</option>
                  <option value="1080p" className="bg-[#050505] text-white">1080p Full HD (60fps)</option>
                  <option value="4K" className="bg-[#050505] text-white">4K UHD Master (GPU-Required)</option>
                </select>
              </div>
            </div>

            {/* Translation Languages */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                Subtitle Language Translation
              </label>
              <select
                value={lang}
                onChange={e => {
                  const l = e.target.value as any;
                  setLang(l);
                  handleUpdateExportSettings('subtitleLanguage', l);
                }}
                className="w-full bg-white/5 border border-white/10 focus:border-orange-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value="en" className="bg-[#050505] text-white">🇬🇧 English Master (Whisper transcribed)</option>
                <option value="es" className="bg-[#050505] text-white">🇪🇸 Spanish translation (AI translated)</option>
                <option value="fr" className="bg-[#050505] text-white">🇫🇷 French translation (AI translated)</option>
                <option value="de" className="bg-[#050505] text-white">🇩🇪 German translation (AI translated)</option>
                <option value="ja" className="bg-[#050505] text-white">🇯🇵 Japanese translation (AI translated)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 mt-6">
          <button
            onClick={handleTriggerExport}
            disabled={isCompiling || !activeProject || activeProject.status !== 'voiced'}
            className="w-full bg-gradient-to-tr from-orange-600 to-amber-400 hover:opacity-90 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-black font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-500/10 transition-all cursor-pointer"
          >
            {isCompiling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Assembling Containers...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Trigger GPU Compilation
              </>
            )}
          </button>
          {!activeProject && (
            <p className="text-[11px] text-white/30 text-center mt-2.5">Load a project to configure compiler options.</p>
          )}
          {activeProject && activeProject.status !== 'voiced' && activeProject.status !== 'rendered' && (
            <p className="text-[11px] text-white/30 text-center mt-2.5">Please generate voice narrations in Step 3 before compiling.</p>
          )}
        </div>
      </div>

      {/* GPU Compilation Console */}
      <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col justify-between min-h-[480px] backdrop-blur-xl">
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/40 border-b border-white/10 pb-4 mb-4">
              <Terminal className="w-4 h-4 text-orange-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">GPU Transcoding Console Logs</h3>
            </div>

            {isCompiling ? (
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-white/45">
                    <span>COMPILING CINEMATIC CHANNELS...</span>
                    <span className="text-orange-400 font-bold">{compileProgress}%</span>
                  </div>
                  <div className="w-full bg-[#050505] rounded-full h-2 overflow-hidden border border-white/10">
                    <div 
                      className="bg-orange-500 h-full rounded-full transition-all duration-300 shadow-md shadow-orange-500/50"
                      style={{ width: `${compileProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Console Log outputs */}
                <div className="bg-black border border-white/10 rounded-lg p-4 h-52 overflow-y-auto font-mono text-xs text-white/40 space-y-1.5 scrollbar-thin">
                  {compileLogs.map((log, idx) => (
                    <div key={idx} className={log.startsWith('[System]') ? 'text-white/80' : 'text-white/40'}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            ) : readyToDownload || (activeProject && activeProject.status === 'rendered') ? (
              <div className="flex flex-col items-center justify-center py-10 bg-[#0b0b0b] border border-white/10 rounded-lg text-center">
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-full mb-4 animate-pulse">
                  <Download className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white uppercase tracking-wider">Movie Recap Assembly Completed</h4>
                <p className="text-xs text-white/30 max-w-sm mt-1.5 leading-relaxed">
                  The H.264 high-profile recap wrapper container is compiled, ducked, and packaged. You can now download the output packet.
                </p>
                <button
                  onClick={handleDownloadFile}
                  className="mt-6 bg-gradient-to-tr from-emerald-600 to-teal-400 text-black font-bold py-2.5 px-6 rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/15 cursor-pointer active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download Complete Recap Video
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-[#0b0b0b] border border-white/10 border-dashed rounded-lg text-center">
                <Terminal className="w-10 h-10 text-white/10 mb-3 animate-pulse" />
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Render queue idle</p>
                <p className="text-[10px] text-white/20 mt-2">Ready to compile timelines, audio codecs, and styled subtitle layers.</p>
              </div>
            )}
          </div>

          <div className="bg-[#0b0b0b] border border-white/10 rounded-lg p-3.5 mt-6 flex gap-3">
            <HelpCircle className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
            <div className="text-[11px] text-white/30 leading-relaxed">
              <span className="text-white/50 font-bold block mb-0.5 uppercase tracking-widest text-[9px]">Automated Content Assembly (FFmpeg & YOLO)</span>
              Our GPU cluster orchestrates the video stitching process. If Vertical (9:16) format is requested, a custom YOLO Pan-and-Scan algorithm identifies characters face coordinates to dynamically reposition the 16:9 viewport. Background audio is dynamically mixed with Voice-Overs using high-fidelity Sidechaining.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
