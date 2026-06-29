import React, { useState } from 'react';
import { Volume2, Sliders, Music, Check, RefreshCw, Play, Pause, AlertCircle } from 'lucide-react';
import { MovieProject, ScriptLine } from '../types';

interface VoiceSectionProps {
  activeProject: MovieProject | null;
  onProjectUpdated: (project: MovieProject) => void;
}

export default function VoiceSection({ activeProject, onProjectUpdated }: VoiceSectionProps) {
  const [selectedNarrator, setSelectedNarrator] = useState('Zephyr');
  const [bgGenre, setBgGenre] = useState<'suspense' | 'action' | 'drama' | 'horror' | 'romance' | 'scifi' | 'none'>('suspense');
  const [bgVolume, setBgVolume] = useState(0.25);
  const [voiceVolume, setVoiceVolume] = useState(0.85);
  const [autoDucking, setAutoDucking] = useState(true);
  
  const [generatingLines, setGeneratingLines] = useState<Record<string, boolean>>({});
  const [playingLineId, setPlayingLineId] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  const handleUpdateAudioSettings = async (updates: any) => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/audio-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      onProjectUpdated(data);
    } catch (err) {
      console.error('Error updating audio settings:', err);
    }
  };

  const handleUpdateNarrator = async (narrator: string) => {
    setSelectedNarrator(narrator);
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrator })
      });
      const data = await res.json();
      onProjectUpdated(data);
    } catch (err) {
      console.error('Error updating narrator:', err);
    }
  };

  const handleGenerateVoiceForLine = async (lineId: string) => {
    if (!activeProject) return;
    setGeneratingLines(curr => ({ ...curr, [lineId]: true }));
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/generate-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineId })
      });
      const data = await res.json();
      if (data.success) {
        // Fetch updated project
        const projRes = await fetch(`/api/projects/${activeProject.id}`);
        const projData = await projRes.json();
        onProjectUpdated(projData);
      }
    } catch (err) {
      console.error('Error generating voice line:', err);
    } finally {
      setGeneratingLines(curr => ({ ...curr, [lineId]: false }));
    }
  };

  const handleGenerateAllVoices = async () => {
    if (!activeProject) return;
    const lines = activeProject.script.lines;
    for (const line of lines) {
      if (!line.audioUrl) {
        await handleGenerateVoiceForLine(line.id);
      }
    }
  };

  const handlePlayAudio = (line: ScriptLine) => {
    if (!line.audioUrl) return;

    if (activeAudio) {
      activeAudio.pause();
      if (playingLineId === line.id) {
        setPlayingLineId(null);
        setActiveAudio(null);
        return;
      }
    }

    const audio = new Audio(line.audioUrl);
    audio.volume = voiceVolume;
    audio.play();
    setPlayingLineId(line.id);
    setActiveAudio(audio);

    audio.onended = () => {
      setPlayingLineId(null);
      setActiveAudio(null);
    };
  };

  const voiceStyles = [
    { name: 'Zephyr', description: '🎙️ Dramatic Youtube Storyteller (Male)', origin: 'Gemini Neural' },
    { name: 'Fenrir', description: '🔥 Deep Cinematic Action Narrator (Male)', origin: 'Gemini Neural' },
    { name: 'Kore', description: '✨ Bright, High-Retention Explainer (Female)', origin: 'Gemini Neural' },
    { name: 'Puck', description: '🍿 Sarcastic and Witty Commentator (Male)', origin: 'Gemini Neural' },
    { name: 'Charon', description: '🔮 Slow Whispering Horror Storyteller (Male)', origin: 'Gemini Neural' }
  ];

  const tracks: Record<string, { name: string; feel: string }> = {
    suspense: { name: 'Dark Subconscious (Orchestral Synth)', feel: 'High Tension' },
    action: { name: 'Full Throttle (Rock Hybrid)', feel: 'Aggressive' },
    drama: { name: 'Acoustic Grief (Plucked Cello)', feel: 'Cathartic' },
    horror: { name: 'Labyrinth echoes (Drone Ambient)', feel: 'Terrifying' },
    romance: { name: 'Soft Whispers (Warm Piano)', feel: 'Sentimental' },
    scifi: { name: 'Stellar Horizons (Arpeggiated Pads)', feel: 'Awe-Inspiring' },
    none: { name: 'No Music Track (Voice Only)', feel: 'Muted' }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="voice-section">
      {/* Voice and Music Controls */}
      <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/10 p-2.5 rounded-lg text-orange-400 border border-orange-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">3. Voice & Music</h2>
              <p className="text-[11px] text-white/40">Configure speaker profiles & mixing deck</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Speaker profile */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2.5">
                AI Voice Speaker
              </label>
              <div className="space-y-2">
                {voiceStyles.map(v => (
                  <label
                    key={v.name}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedNarrator === v.name
                        ? 'bg-orange-500/10 border-orange-500/50 text-white font-semibold'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                    }`}
                    onClick={() => handleUpdateNarrator(v.name)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="narratorRadio"
                        checked={selectedNarrator === v.name}
                        onChange={() => {}}
                        className="hidden"
                      />
                      <div>
                        <span className="text-xs font-semibold block text-white">{v.description}</span>
                        <span className="text-[10px] text-white/40">{v.origin}</span>
                      </div>
                    </div>
                    {selectedNarrator === v.name && <Check className="w-4 h-4 text-orange-400" />}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 my-4"></div>

            {/* Background Music Genre */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Background Music Selection
              </label>
              <select
                value={bgGenre}
                onChange={e => {
                  const genre = e.target.value as any;
                  setBgGenre(genre);
                  handleUpdateAudioSettings({ bgMusicGenre: genre });
                }}
                className="w-full bg-white/5 border border-white/10 focus:border-orange-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value="suspense" className="bg-[#050505] text-white">🎵 Suspense: Dark Subconscious (Orchestral Synth)</option>
                <option value="action" className="bg-[#050505] text-white">🎸 Action: Full Throttle (Rock Hybrid)</option>
                <option value="drama" className="bg-[#050505] text-white">🎻 Drama: Acoustic Grief (Plucked Cello)</option>
                <option value="horror" className="bg-[#050505] text-white">👻 Horror: Labyrinth Echoes (Drone Ambient)</option>
                <option value="romance" className="bg-[#050505] text-white">🎹 Romance: Soft Whispers (Warm Piano)</option>
                <option value="scifi" className="bg-[#050505] text-white">🌌 Sci-Fi: Stellar Horizons (Arpeggiated Pads)</option>
                <option value="none" className="bg-[#050505] text-white">🔇 None (Recap Voice-Over Only)</option>
              </select>
            </div>

            {/* Volumes mixing deck */}
            <div className="space-y-4 bg-[#0b0b0b] p-4 rounded-lg border border-white/10">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Mixing Deck Console</span>
              
              <div className="space-y-3">
                {/* Voice Volume */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white/40">
                    <span className="flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> Narrator Voice</span>
                    <span className="font-mono text-[11px] text-orange-400">{Math.round(voiceVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={voiceVolume}
                    onChange={e => {
                      const vol = Number(e.target.value);
                      setVoiceVolume(vol);
                      handleUpdateAudioSettings({ voiceVolume: vol });
                    }}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                {/* Music Volume */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white/40">
                    <span className="flex items-center gap-1"><Music className="w-3.5 h-3.5" /> Background Track</span>
                    <span className="font-mono text-[11px] text-orange-400">{Math.round(bgVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgVolume}
                    onChange={e => {
                      const vol = Number(e.target.value);
                      setBgVolume(vol);
                      handleUpdateAudioSettings({ bgMusicVolume: vol });
                    }}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </div>

              {/* Sidechain compression toggle */}
              <label className="flex items-center gap-3.5 pt-2 border-t border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDucking}
                  onChange={e => {
                    const duck = e.target.checked;
                    setAutoDucking(duck);
                    handleUpdateAudioSettings({ autoDucking: duck });
                  }}
                  className="rounded border-white/10 bg-black text-orange-400 focus:ring-orange-500/20"
                />
                <div className="flex-1">
                  <span className="text-xs text-white/85 block font-medium">Automatic Sidechain Ducking</span>
                  <span className="text-[10px] text-white/40 block">Fades background music automatically during voiceover</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Voice lines rendering center */}
      <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col justify-between min-h-[480px] backdrop-blur-xl">
        {activeProject && activeProject.script.lines.length > 0 ? (
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">AI Voice Synthesis Deck</h3>
                  <p className="text-xs text-white/40 mt-0.5">Generate realistic voices via server-side Gemini TTS</p>
                </div>
                <button
                  onClick={handleGenerateAllVoices}
                  className="bg-gradient-to-tr from-orange-600 to-amber-400 hover:opacity-90 text-black font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Synthesize All Lines
                </button>
              </div>

              {/* Voice list items */}
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                {activeProject.script.lines.map((line, idx) => {
                  const isGenerating = generatingLines[line.id];
                  const isPlaying = playingLineId === line.id;

                  return (
                    <div key={line.id} className="bg-[#0b0b0b] border border-white/10 p-3 rounded-lg flex items-center justify-between gap-4 hover:border-white/20 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] bg-white/5 border border-white/10 text-white/40 px-1.5 py-0.5 rounded font-mono">
                            Line #{idx + 1}
                          </span>
                          <span className="text-[10px] text-white/30 font-mono truncate max-w-[120px] sm:max-w-[180px]">
                            {tracks[bgGenre]?.name} mixed
                          </span>
                        </div>
                        <p className="text-xs text-white/80 truncate font-sans">"{line.text}"</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {line.audioUrl ? (
                          <button
                            onClick={() => handlePlayAudio(line)}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                              isPlaying 
                                ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                                : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'
                            }`}
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                          </button>
                        ) : (
                          <div className="text-[11px] text-white/20 font-mono italic">No Voice</div>
                        )}

                        <button
                          onClick={() => handleGenerateVoiceForLine(line.id)}
                          disabled={isGenerating}
                          className="bg-white/5 hover:bg-white/10 text-white/85 border border-white/10 text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-[0.97]"
                        >
                          {isGenerating ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-orange-400" />
                          ) : (
                            <Volume2 className="w-3 h-3 text-white/40" />
                          )}
                          {line.audioUrl ? 'Regen' : 'Voice'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#0b0b0b] border border-white/10 rounded-lg p-3.5 mt-6 flex gap-3">
              <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-white/30 leading-relaxed">
                <span className="text-white/50 font-bold block mb-0.5 uppercase tracking-widest text-[9px]">Real-time Audio Mixing Engine</span>
                When a voiceover line plays, our client mixing layer ducks the active background track (configured with the <span className="text-orange-400 font-mono">"{tracks[bgGenre]?.feel}"</span> feel) to match the selected auto-ducking sidechain thresholds. This allows you to experience the exact final mixed acoustic output prior to video compile.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="bg-white/5 border border-white/10 p-4 rounded-full text-white/20 mb-4">
              <Volume2 className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">No narrative lines to voice</h3>
            <p className="text-xs text-white/30 mt-2 max-w-sm leading-relaxed">
              Generate the script layout in Step 2 to configure voices and build speech outputs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
