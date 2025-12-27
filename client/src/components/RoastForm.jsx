import React, { useState, useRef } from 'react';

/**
 * RoastForm Component
 * The "Bypass" Version: Starts audio on user interaction.
 */
const RoastForm = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [roastData, setRoastData] = useState(null);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [view, setView] = useState('input');

  // --- AUDIO REFS ---
  const bgAudioRef = useRef(null);
  const thinkingAudioRef = useRef(null);

  // --- AUDIO CONTROLLER ---

  const initAudio = () => {
    // Only create audio if it doesn't exist yet
    if (!bgAudioRef.current) {
      bgAudioRef.current = new Audio('/audio/background sound.mp3');
      bgAudioRef.current.volume = 0.5;
      bgAudioRef.current.loop = true;
      bgAudioRef.current.play().catch(e => console.log("Audio waiting for interaction..."));
    }

    if (!thinkingAudioRef.current) {
      thinkingAudioRef.current = new Audio('/audio/cyber-10071.mp3');
      thinkingAudioRef.current.volume = 0.4;
      thinkingAudioRef.current.loop = true;
    }
  };

  const playClick = () => {
    const audio = new Audio('/audio/button click 1.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => { });
  };

  const playSuccess = () => {
    const audio = new Audio('/audio/aggressive-tech-cyber-logo-452884.mp3');
    audio.volume = 0.6;
    audio.play().catch(() => { });
  };

  const playError = () => {
    const audio = new Audio('/audio/button click 2.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => { });
  };

  const switchToThinkingMode = () => {
    // Stop BG, Start Think
    if (bgAudioRef.current) bgAudioRef.current.pause();
    if (thinkingAudioRef.current) {
      thinkingAudioRef.current.currentTime = 0;
      thinkingAudioRef.current.play().catch(() => { });
    }
  };

  const switchToNormalMode = () => {
    // Stop Think, Start BG
    if (thinkingAudioRef.current) {
      thinkingAudioRef.current.pause();
      thinkingAudioRef.current.currentTime = 0;
    }
    if (bgAudioRef.current) {
      bgAudioRef.current.play().catch(() => { });
    }
  };

  const handleRoast = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    playClick();
    setLoading(true);
    switchToThinkingMode(); // 🎵 Enter Cyber Mode

    setError(null);
    setErrorCode(null);
    setRoastData(null);

    // Trigger Global Glitch
    window.dispatchEvent(new CustomEvent('toggle-glitch', { detail: { active: true } }));

    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8001';
      const response = await fetch(`${apiUrl}/api/roast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl }),
      });

      if (!response.ok) {
        setErrorCode(response.status);
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail || 'UNKNOWN_DESTRUCTION_ERROR';

        switch (response.status) {
          case 404: throw new Error("I can't roast what I can't see. Is this repo private?");
          case 403: throw new Error('GitHub is tired of my insults. Rate limit hit.');
          case 422: throw new Error("This repo is empty or boring. Give me some CODE to destroy.");
          case 503: throw new Error("SETUP REQUIRED: Change the API Key in server/.env");
          case 502: throw new Error("GitHub's servers are cringing too hard at your repo.");
          default: throw new Error(detail);
        }
      }

      const data = await response.json();
      console.log("ROAST DATA RECEIVED:", data); // DEBUG LOG to checking what we get

      if (!data || !data.roast) {
        console.error("INVALID DATA STRUCTURE:", data);
        throw new Error("Received empty roast from server.");
      }

      setRoastData(data);
      setView('result');

      switchToNormalMode(); // 🎵 Back to Vibe Mode
      playSuccess();

    } catch (err) {
      setError(err.message);
      switchToNormalMode(); // 🎵 Back to Vibe Mode
      playError();
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('toggle-glitch', { detail: { active: false } }));
    }
  };

  return (
    <div className={`flex items-center justify-center bg-transparent relative ${loading ? 'animate-world-shake' : ''}`}>
      {/* Loading Overlay */}
      {loading && (
        <div className="relative -top-10 w-screen h-screen z-[1000] bg-transparent">
          <div className="glitch-scanner"></div>
          <div className="brain-melting-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-50">
            <h2 className="text-terminal-red text-[2rem] font-black tracking-[5px] mb-8 animate-pulse shadow-[0_0_10px_currentColor]">NEURAL_OVERLOAD_DETECTED</h2>
            <div className="flex flex-col gap-2 font-mono text-terminal-green text-[0.8rem] text-left border-l-2 border-terminal-red pl-4 bg-[rgba(0,0,0,0.8)] p-4">
              <span className="animate-blink">SYMPTOMS: CONFUSION, NAUSEA, DISGUST</span>
              <span className="block">ACTION: BYPASSING_LIMITS.exe</span>
              <span className="block text-terminal-red">BRAIN_CELLS_REMAINING: 0.003%</span>
              <span className="block">PROCESSING_LEVEL_OF_LAMENESS: 11/10</span>
            </div>
            <div className="w-full h-[10px] bg-terminal-dark mt-8 relative overflow-hidden">
              <div className="absolute h-full w-full bg-terminal-green shadow-[0_0_20px_currentColor] animate-loading-crazy"></div>
            </div>
          </div>
          <div className="noise-canvas"></div>
        </div>
      )}

      {/* Main Content */}
      {!loading && <div className={`w-full h-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${view}`}>
        {view === 'input' ? (
          <div className="w-[80vw] max-w-[1000px] h-auto flex flex-col items-center justify-center z-10">
            <div className="w-full max-w-[600px] bg-terminal-dim border border-terminal-green shadow-[0_0_40px_rgba(0,243,255,0.2)] relative backdrop-blur-sm">
              <div className="bg-terminal-header p-[8px_15px] flex items-center gap-2 border-b border-[#1a1a1a]">
                <span className="w-[10px] h-[10px] rounded-full opacity-80 bg-[#ff5f56]"></span>
                <span className="w-[10px] h-[10px] rounded-full opacity-80 bg-[#ffbd2e]"></span>
                <span className="w-[10px] h-[10px] rounded-full opacity-80 bg-cyan-500 shadow-[0_0_5px_cyan]"></span>
                <span className="ml-auto text-[#666] text-[0.7rem] tracking-[1px]">git-roast --bash</span>
              </div>

              <form onSubmit={handleRoast} className="p-[30px] flex flex-col gap-8">
                <div className="flex items-center gap-[10px] text-[1.2rem]">
                  <span className="text-terminal-green shadow-[0_0_10px_currentColor] whitespace-nowrap">root@git-roast:~$</span>

                  {/* THE MAGIC FIX: initAudio on Focus/Click */}
                  <input
                    id="repo-url"
                    name="repo-url"
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onFocus={initAudio}
                    onClick={initAudio}
                    placeholder="inject_repo_url_here..."
                    className="bg-transparent border-none outline-none text-white font-inherit text-[1.2rem] w-full placeholder:text-gray-600"
                    disabled={loading}
                    autoFocus
                  />
                  {!repoUrl && <span className="animate-blink">_</span>}
                </div>
                <button
                  type="submit"
                  disabled={loading || !repoUrl}
                  className="bg-terminal-green text-black border-none p-[15px] font-black uppercase tracking-[5px] cursor-pointer transition-all duration-200 hover:bg-white hover:text-terminal-green hover:shadow-[0_0_20px_white] disabled:opacity-50 disabled:cursor-not-allowed clip-path-polygon-[0_0,100%_0,100%_70%,95%_100%,0_100%]"
                >
                  {loading ? 'CALCULATING_DESTRUCTION...' : 'EXECUTE_ROAST.sh'}
                </button>
              </form>

              {error && (
                <div className="border-t border-[#f00] bg-[rgba(20,0,0,0.9)] p-4 animate-pulse">
                  <p className="text-terminal-red font-bold text-[0.9rem]">» ERROR: {error}</p>
                  <p className="text-terminal-red text-[0.7rem] mt-1 opacity-80">SYSTEM_STABILITY: CRITICAL</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Result View */
          <div className="w-[80vw] max-w-[1000px] h-auto flex flex-col items-center justify-center z-10">
            <div className="w-full h-[80vh] bg-terminal-dim border border-terminal-green flex flex-col relative overflow-hidden">
              <div className="p-5 bg-black border-b-[3px] border-terminal-green flex items-center justify-between">
                <div className="text-terminal-red font-bold animate-blink text-[0.8rem]">rec</div>
                <h2 className="text-terminal-green text-[1.2rem] tracking-[5px] m-0">DESTRUCTION_DASHBOARD</h2>
                <button onClick={() => setView('input')} className="bg-transparent border border-terminal-red text-terminal-red px-[15px] py-[5px] text-[0.7rem] cursor-pointer hover:bg-terminal-red hover:text-white transition-colors">
                  REBOOT_SYSTEM
                </button>
              </div>

              <div className="flex-1 grid grid-cols-[2fr_1fr] p-[2px] gap-[2px] bg-terminal-green">
                <div className="bg-terminal-black/80 relative flex flex-col backdrop-blur-md">
                  {/* Fixed Header */}
                  <div className="w-full h-[40px] bg-terminal-dark/90 border-b border-terminal-green/20 flex items-center px-4 shrink-0 z-10 shadow-lg">
                    <span className="text-[0.6rem] text-terminal-green tracking-[2px] uppercase font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-terminal-green rounded-full animate-pulse"></span>
                      TRANSCRIPTION_OF_SHAME
                    </span>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <p className="text-[1.1rem] text-cyan-50/90 leading-relaxed font-mono drop-shadow-[0_0_2px_rgba(0,243,255,0.3)] whitespace-pre-wrap selection:bg-terminal-green selection:text-black">
                      &quot;{roastData.roast}&quot;
                    </p>
                    <div className="h-4"></div> {/* Bottom spacer */}
                  </div>

                  {/* Decor corners */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-terminal-green/50 opacity-50 pointer-events-none"></div>
                </div>

                <div className="bg-black p-[30px] relative overflow-y-auto flex flex-col">
                  <div className="mb-[30px]">
                    <div className="text-[0.7rem] text-terminal-green mb-[5px]">LAMENESS_PERCENTAGE</div>
                    <div className="text-[2.5rem] font-black text-terminal-red leading-none">{roastData.score}%</div>
                    <div className="h-[8px] bg-[#1a1a1a] mt-[10px]">
                      <div className="h-full bg-terminal-red shadow-[0_0_15px_currentColor]" style={{ width: `${roastData.score}%` }}></div>
                    </div>
                  </div>
                  <div className="mb-[30px]">
                    <div className="text-[0.7rem] text-terminal-green mb-[5px]">AI_BRAIN_DAMAGE</div>
                    <div className="text-[2.5rem] font-black text-terminal-red leading-none">CRITICAL</div>
                  </div>
                </div>
              </div>

              <div className="bg-black border-t border-terminal-green p-[10px] overflow-hidden">
                <div className="whitespace-nowrap text-terminal-green text-[0.7rem] animate-scroll-text">
                  DATA_STREAM: [INFO] FETCHING REPO CONTENT... [SUCCESS] PARSING CODE... [WARN] LAME CODE DETECTED... [CRITICAL] GENAI OVERLOAD... [DONE] ROAST GENERATED
                </div>
              </div>
            </div>
          </div>
        )}
      </div>}
    </div>
  );
};

export default RoastForm;