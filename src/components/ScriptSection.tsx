import React, { useState } from 'react';
import { Sparkles, Edit3, Save, MessageSquare, ListCollapse, HelpCircle, RefreshCw } from 'lucide-react';
import { MovieProject, ScriptLine } from '../types';

interface ScriptSectionProps {
  activeProject: MovieProject | null;
  onProjectUpdated: (project: MovieProject) => void;
}

export default function ScriptSection({ activeProject, onProjectUpdated }: ScriptSectionProps) {
  const [tone, setTone] = useState<'suspenseful' | 'action' | 'analytical' | 'dramatic' | 'humorous'>('suspenseful');
  const [lengthMinutes, setLengthMinutes] = useState<number>(15);
  const [customStoryline, setCustomStoryline] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleGenerateScript = async () => {
    if (!activeProject) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone,
          lengthMinutes,
          storyline: customStoryline
        })
      });
      const data = await res.json();
      onProjectUpdated(data);
    } catch (err) {
      console.error('Error generating script:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartEdit = (line: ScriptLine) => {
    setEditingLineId(line.id);
    setEditingText(line.text);
  };

  const handleSaveLine = async (lineId: string) => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/script-lines/${lineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editingText
        })
      });
      const data = await res.json();
      onProjectUpdated(data);
      setEditingLineId(null);
    } catch (err) {
      console.error('Error saving script line:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="script-section">
      {/* Script Configuration */}
      <div className="lg:col-span-4 bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/10 p-2.5 rounded-lg text-orange-400 border border-orange-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">2. Narration Script</h2>
              <p className="text-[11px] text-white/40">Generate storyteller narrative script</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Tone Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                YouTube Recapper Tone Style
              </label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value as any)}
                disabled={isGenerating || !activeProject}
                className="w-full bg-white/5 border border-white/10 focus:border-orange-500/50 rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer"
              >
                <option value="suspenseful" className="bg-[#050505] text-white">🎙️ Dramatic Suspense & Whispers</option>
                <option value="action" className="bg-[#050505] text-white">🔥 Action-Packed, Fast Pace & Energy</option>
                <option value="analytical" className="bg-[#050505] text-white">🧠 Deconstructive & Easter-Eggs Analysis</option>
                <option value="dramatic" className="bg-[#050505] text-white">💧 Highly Emotional & Character Catharsis</option>
                <option value="humorous" className="bg-[#050505] text-white">🍿 Comedic Sarcasm & Wit</option>
              </select>
            </div>

            {/* Length Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Recap Video Target Length
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[10, 15, 20, 25, 30].map(min => (
                  <button
                    key={min}
                    type="button"
                    disabled={isGenerating || !activeProject}
                    onClick={() => setLengthMinutes(min)}
                    className={`text-xs font-mono py-2 rounded border cursor-pointer transition-all ${
                      lengthMinutes === min
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-bold'
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Guidelines */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Plot focus & specific guidelines
              </label>
              <textarea
                placeholder="e.g. Focus heavily on Cobb's grief about Mal, emphasize the folding Paris scene, and end on a mind-blowing cliffhanger about the spinning top."
                value={customStoryline}
                onChange={e => setCustomStoryline(e.target.value)}
                disabled={isGenerating || !activeProject}
                className="w-full h-32 bg-white/5 border border-white/10 focus:border-orange-500/50 rounded-lg p-3 text-xs text-white placeholder-white/20 outline-none resize-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 mt-6">
          <button
            onClick={handleGenerateScript}
            disabled={isGenerating || !activeProject || activeProject.status === 'created'}
            className="w-full bg-gradient-to-tr from-orange-600 to-amber-400 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-500/10 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Writing Script...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Script with Gemini
              </>
            )}
          </button>
          {!activeProject && (
            <p className="text-[11px] text-white/30 text-center mt-2.5">Load and analyze a project to unlock script-writing.</p>
          )}
          {activeProject && activeProject.status === 'created' && (
            <p className="text-[11px] text-white/30 text-center mt-2.5">Please trigger the ML Analysis step first.</p>
          )}
        </div>
      </div>

      {/* Script Narratives Display */}
      <div className="lg:col-span-8 bg-black/40 border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col min-h-[480px] backdrop-blur-xl">
        {activeProject && activeProject.script.lines.length > 0 ? (
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">YouTube Script Outline</h3>
                  <p className="text-xs text-white/40 mt-0.5">Edit lines dynamically. AI voices will regenerate automatically to match changes.</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-mono text-orange-400">
                  {activeProject.script.lines.length} Sentence Blocks
                </div>
              </div>

              {/* Narrator Lines Stack */}
              <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {activeProject.script.lines.map((line, index) => {
                  const scene = activeProject.analysis.scenes.find(s => s.id === line.sceneId);
                  const isEditing = editingLineId === line.id;

                  return (
                    <div 
                      key={line.id} 
                      className={`p-4 rounded-lg border transition-all ${
                        isEditing 
                          ? 'bg-black border-orange-500/50' 
                          : 'bg-[#0b0b0b] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60 font-mono">
                            Line #{index + 1}
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">
                            Time: {line.timestamp}s
                          </span>
                          {scene && (
                            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded font-semibold border border-orange-500/20">
                              🎬 {scene.description}
                            </span>
                          )}
                        </div>
                        
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveLine(line.id)}
                            className="bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Save className="w-3 h-3" /> Save Changes
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(line)}
                            className="bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-[10px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <textarea
                          value={editingText}
                          onChange={e => setEditingText(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-orange-500/40 rounded p-2.5 text-xs text-white placeholder-white/20 outline-none resize-none h-20 transition-all font-sans"
                        />
                      ) : (
                        <p className="text-xs text-white/80 leading-relaxed font-sans italic">
                          "{line.text}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#0b0b0b] border border-white/10 rounded-lg p-3.5 mt-6 flex gap-3 items-start">
              <HelpCircle className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
              <div className="text-[11px] text-white/30 leading-relaxed">
                <span className="text-white/50 font-bold block mb-1 uppercase tracking-widest text-[9px]">YouTube Recapper Storytelling Mechanics</span>
                Our generator avoids simplistic frame narration. Instead, the server instructs Gemini to construct a script utilizing dramatic hooks (to reduce video bounce rate), explaining character psychological motives, highlighting hidden themes, and building cliffhangers for high YouTube retention.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="bg-white/5 border border-white/10 p-4 rounded-full text-white/20 mb-4">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">No script generated yet</h3>
            <p className="text-xs text-white/30 mt-2 max-w-sm leading-relaxed">
              Analyze the movie and use the left panel to configure your voice-over style. Gemini will write a cohesive YouTube-narrated storyline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
